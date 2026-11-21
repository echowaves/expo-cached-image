---
title: 'Fix "Destination already exists" crash when caching an uncached image'
type: 'bugfix'
ticket: ''
created: '2026-11-21'
status: 'in-progress'
baseline_revision: '8cfad0c2028d9d1ea75a55ef0ab66352e3543b31'
route: 'oneshot'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: []
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every uncached photo logs `Error loading image: … Destination already exists` (Android) / `…couldn't be moved to "Caches" because an item with the same name already exists` (iOS) instead of caching. `move()`/`copy()` are called without `overwrite`, downloads land on a shared server-derived filename in `Caches/`, and nothing clears a stale or zero-byte target before re-download — so two concurrent mounts race and a leftover file makes one cache key permanently broken.

**Approach:** Make the download→promote step collision-proof and idempotent: download to a unique temp file inside the cache dir, delete any stale/zero-byte target first, promote with `overwrite: true`, and dedupe concurrent loads for one sanitized cache key through a module-level in-flight promise map. No new dependencies; public API unchanged.

</frozen-after-approval>

## Implementation Notes

Oneshot route: this section carries the file-level actions and the decisions investigation settled, since the oneshot template drops Code Map / Tasks / Design Notes.

**Verified API facts (`expo-file-system@58.0.13`, read from `node_modules/expo-file-system`)**
- `build/File.types.d.ts`: `RelocationOptions = { overwrite?: boolean }` only — move/copy have **no** `idempotent`. `ios/FileSystemPath.swift:86` removes the destination *only* when `options.overwrite`; otherwise raw `FileManager.moveItem` throws the reported NSFileWriteFileExistsError. `android/.../FileSystemPath.kt:245` → `file.moveTo(to.asCopyOrMoveDestination(options.overwrite))`.
- `build/NetworkTasks.types.d.ts`: `DownloadOptions.idempotent?: boolean`, default `false`. `android/.../FileSystemDownload.kt:91` throws `DestinationAlreadyExistsException` when the target exists; `ios/FileSystemDownload.swift:155` same. Download naming into a Directory is server-derived (`URLUtil.guessFileName` / `httpResponse.suggestedFilename ?? url.lastPathComponent`) — this is a **second** collision site the original diagnosis did not name.
- `delete(): void`, `info()`, `create()` are synchronous in this API; only `move`/`copy` return promises and `downloadFileAsync` is async. So stale-target cleanup is a sync try/catch, not `await file.delete()` (deviation from the request wording; awaiting a `void` would be misleading). iOS throws `UnableToDeleteException("path does not exist")`, hence the catch.
- A `File` destination is accepted by `downloadFileAsync` on both platforms (`FileSystemDownload.kt:86-88`, `FileSystemDownload.swift:150-152`) — required for the temp-file approach.

**Decision: download to a unique temp file, then promote.** Chosen over "keep shared name + `idempotent: true`" because a unique name removes the cross-instance collision at its source (two components with one `cacheKey`, or two keys whose server filename matches), makes an interrupted download's leftover harmless and self-cleaned, and keeps the final `.png` target appearing only once bytes are complete. `idempotent: true` is still passed on the temp download so a leftover temp name can never wedge a retry.

**Files**
- `src/cache.ts` (new) — no JSX. Owns: `cacheFileFor(key)`, `uniqueTempName()`, module-level `inFlight: Map<string, Promise<string>>` keyed by sanitized key, `loadIntoCache({ uri, key, headers, expiresIn })` implementing info → stale/expired cleanup → temp download (`{ headers, idempotent: true }`) → `temp.move(target, { overwrite: true })` → finally delete leftover temp; plus the existing `CacheManager` methods, with `addToCache`'s `copy(..., { overwrite: true })` and `downloadAsync` sharing `loadIntoCache`.
- `src/index.tsx` — component keeps its expiry/validity checks and delegates the download path to `loadIntoCache`; re-exports `CacheManager` from `./cache`. Default export stays `CachedImage` (WiSaw uses `import CachedImage from 'expo-cached-image'` in 9 files / 12 sites, plus named `CacheManager.addToCache`).
- `__tests__/cache.test.ts` (new) — jest with `jest.mock('expo-file-system')`: (a) `move` receives `{ overwrite: true }` and resolution succeeds when the destination already exists; (b) two concurrent `loadIntoCache` calls for one key produce exactly **one** `downloadFileAsync`; plus stale/zero-byte delete-before-download and temp cleanup.
- `tsconfig.eslint.json` (new) + `.eslintrc.json` — point `parserOptions.project` at a config that also includes `__tests__/**/*`. Verified: `npx ts-standard` fails with "that TSConfig does not include this file" on any test file otherwise. Build keeps using `tsconfig.json` (tests must stay out of `lib/`).
- `src/consts.ts` — unchanged (`sanitizeCacheKey` untouched, see follow-ups).

**Follow-ups (deliberately NOT implemented)**
- Hardcoded `.png` extension for webp/jpeg sources: changing it invalidates every existing cache entry on upgrade → needs owner approval.
- `sanitizeCacheKey`'s `.slice(0, 100)` can collide distinct keys.
- WiSaw's `photoUploadService.js` swallows `"already exists"` from `addToCache`; that workaround can be dropped once a fixed version is consumed.

**Out of scope / forbidden:** no new dependencies; never edit `lib/` (tsc output); no changes to WiSaw or its pin; no `npm publish`.

### Implementation record (2026-11-21)

Built as planned. Deviations and surprises, all verified while implementing:

- **`idempotent` is a download option, not a relocation option.** The request asked for `{ idempotent: true }` "where supported": `move`/`copy` take only `{ overwrite }`, so they got `overwrite: true`; `downloadFileAsync` got `{ idempotent: true }`. Both are now in `src/cache.ts`.
- **`file.delete()` is sync**, so the stale-target cleanup is a `try/catch` (`deleteQuietly`) rather than `await file.delete()`. The catch also covers "already gone", which the old code would have thrown on.
- **Extra hardening inside the goal:** a download that lands 0 bytes is rejected and its temp file removed, so a truncated response can never become a cached entry (the zero-byte loop in the report). Covered by a test.
- **`src/cache.ts` extraction was forced by tooling**: jest's babel config (`@babel/preset-env` + `@babel/preset-typescript`) has no JSX transform — importing `src/index.tsx` from a test fails to parse (verified before writing code). The cache pipeline now lives in a JSX-free module the tests import directly; `src/index.tsx` keeps only the component and re-exports.
- **Lint/test harness gaps found and fixed** (both were blocking): `tsconfig.eslint.json` for `parserOptions.project` (test files were outside the project), and `types/jest-globals.d.ts` with minimal ambient jest types instead of adding `@types/jest`, per the no-new-dependency rule. `__tests__/globals.d.ts` initially sat inside `__tests__/` and jest tried to run it as a suite; moved to `types/`.
- **Known tradeoff of delete-before-download**: if the download then fails, the previous entry is gone (a re-download is required). Kept because every caller reaching this path has already judged the entry unusable, and it matches what the old expiry path did.

## Plan Change Log

_Append-only; populated by step-04 review loops._

## Review Triage Log

_Append-only; populated by step-04 on every review pass._

## Verification

**Commands:**
- `HOME="$TMPDIR/fakehome" npx ts-standard` -- expected: exit 0, no findings. (ts-standard caches in `~/.cache/ts-standard`, which the sandbox blocks; the HOME override is a run-environment detail, not a repo change.)
- `npm run build` -- expected: `tsc` exits 0 and emits `lib/cache.js` + `lib/index.js`.
- `npx jest --watchman=false` -- expected: new suite passes with ≥2 tests (watchman's state file under `~/.local/state` is sandbox-blocked; the flag is a run-environment detail).

**Manual checks:**
- Walk both native paths against the fix and show they cannot throw "already exists": iOS `FileSystemPath.move` now hits the `options.overwrite` branch (`removeItem` then `moveItem`), Android `moveTo(overwrite=true)`; download destination is a fresh unique temp name, so `DestinationAlreadyExistsException` is unreachable, and `idempotent: true` covers a leftover.
- Confirm `lib/index.d.ts` still exports `default CachedImage` with the same props and named `CacheManager` with the same method signatures.
