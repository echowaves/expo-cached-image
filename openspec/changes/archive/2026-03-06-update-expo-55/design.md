## Context

expo-cached-image is a lightweight React Native image caching library that wraps the Expo `expo-file-system` APIs (`File`, `Directory`, `Paths`, `File.downloadFileAsync`). The library currently pins to Expo SDK 54 for development and declares peer dependency support for Expo 50–54.

Expo SDK 55 (v55.0.5) has been released. The `expo-file-system` package ships a new major version alongside each SDK bump, and may introduce API changes to the `File`/`Directory`/`Paths` surface used throughout this library.

## Goals / Non-Goals

**Goals:**
- Update all Expo-related devDependencies to versions compatible with Expo SDK 55.
- Widen peerDependencies to include Expo 55 and its matching `expo-file-system`.
- Adapt source code to any breaking API changes in `expo-file-system` for Expo 55.
- Bump the library version to `55.0.0` to signal Expo SDK alignment.
- Ensure `tsc`, `jest`, and `ts-standard` all pass after the upgrade.

**Non-Goals:**
- Adding new features or changing caching behavior.
- Supporting Expo SDK 50 (will be dropped to keep a 5-version rolling window).
- Migrating away from `expo-file-system` or changing the caching strategy.
- Upgrading React or React Native beyond what Expo 55 requires.

## Decisions

1. **Drop Expo 50 support, keep Expo 51–55**
   - *Rationale*: Expo maintains ~4 SDK versions. Keeping 5 is generous. Dropping 50 limits the backward-compatibility surface.
   - *Alternative considered*: Keep Expo 50 — rejected because it increases testing burden for an SDK two generations behind.

2. **Align library major version with Expo SDK** (`55.0.0`)
   - *Rationale*: The existing convention (`54.0.7` for Expo 54) makes version expectations clear to consumers.
   - *Alternative considered*: SemVer independent of Expo — rejected for consistency with established versioning pattern.

3. **Update devDependencies to exact Expo 55 versions**
   - Pin `expo` to `55.0.5`, update `expo-file-system` to the matching version, and update `react`, `react-native`, and type packages to the versions bundled by Expo 55.
   - *Rationale*: Exact pinning in devDependencies ensures reproducible development builds while peerDependencies remain ranges.

4. **Adapt to `expo-file-system` API changes in-place**
   - If `File`, `Directory`, or `Paths` APIs change, update `src/index.tsx` and `src/consts.ts` directly rather than adding a compatibility abstraction.
   - *Rationale*: The library has only two source files with straightforward usage; an abstraction layer would be over-engineering.

## Risks / Trade-offs

- **[Breaking change for Expo 50 users]** → Mitigation: Clearly document in CHANGELOG/README that 55.x drops Expo 50. Users can stay on 54.x.
- **[expo-file-system API drift]** → Mitigation: Review Expo 55 changelog and `expo-file-system` release notes before implementation. Test all `File`/`Directory` methods used.
- **[Peer dependency range too wide]** → Mitigation: CI tests should run against both the lowest (Expo 51) and highest (Expo 55) supported versions.
