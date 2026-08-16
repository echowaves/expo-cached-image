## Context

expo-cached-image is a lightweight React Native image caching library that wraps the Expo `expo-file-system` APIs (`File`, `Directory`, `Paths`, `File.downloadFileAsync`). The library currently pins to Expo SDK 55 for development and declares peer dependency support for Expo 51–55.

Expo SDK 57 (v57.0.9) has been released, skipping SDK 56. The `expo-file-system` package ships a new major version alongside each SDK bump. The library uses `expo-file-system` v55.0.10; targeting v57.0.2.

## Goals / Non-Goals

**Goals:**
- Update all Expo-related devDependencies to versions compatible with Expo SDK 57.
- Slide peerDependencies to Expo 53–57 (5-version rolling window, dropping 51–52).
- Bump `@types/react-native` from `^0.72.0` to `^0.83.0` to match current React Native version.
- Bump the library version to `57.0.0` to signal Expo SDK alignment.
- Ensure `tsc`, `jest`, and `ts-standard` all pass after the upgrade.

**Non-Goals:**
- Adding new features or changing caching behavior.
- Supporting Expo SDK ≤52 (dropped by rolling window).
- Migrating away from `expo-file-system` or changing the caching strategy.
- Testing against Expo 56 (API stability is well-established; verify against 57 only).

## Decisions

1. **Slide the peer dependency window: Expo 53–57**
   - *Rationale*: Maintain a 5-version rolling window. Drop Expo 51–52, add Expo 56–57. This limits backward-compatibility testing surface while covering recent SDKs.
   - *Alternative considered*: Extend to 7 versions (51–57) — rejected, increases testing burden.

2. **Align library major version with Expo SDK (`57.0.0`)**
   - *Rationale*: The existing convention (`55.0.0` for Expo 55) makes version expectations clear. Skipping `56.0.0` is acceptable — it signals "tested against Expo 57" not "Expo 56 compatible."
   - *Alternative considered*: SemVer independent of Expo — rejected for consistency with established pattern.

3. **Update devDependencies to exact Expo 57 versions**
   - Pin `expo` to `57.0.9`, `expo-file-system` to `57.0.2`, and update `@types/react-native` to `^0.83.0`.
   - *Rationale*: Exact pinning in devDependencies ensures reproducible builds. Peer dependencies remain ranges.

4. **Bump `@types/react-native` as part of this upgrade**
   - *Rationale*: Currently at `^0.72.0` while using `react-native 0.83.3` — 4 versions behind. Aligning now prevents type drift issues.
   - *Alternative considered*: Defer — rejected, easy to do now and reduces technical debt.

5. **Verify `expo-file-system` API stability, adapt in-place if needed**
   - The `File`, `Directory`, and `Paths` APIs have been stable since the new API was introduced. NPM registry shows identical export structures between v55 and v57 (only `./plugin` export added in 57, unused by this library).
   - *Rationale*: Two source files with straightforward usage — no abstraction layer needed.

## Risks / Trade-offs

- **[Breaking change for Expo ≤52 users]** → Mitigation: Users can stay on 55.x release line. Document in CHANGELOG/README.
- **[expo-file-system API drift across 2 majors]** → Mitigation: Low risk — export structure and API surface are stable. Verify by running `tsc` and tests against v57.
- **[@types/react-native breaking changes]** → Mitigation: Low risk — React Native types have been stable for `Image`, `ImageProps`, `ImageURISource` which is all we import. Verify with `tsc`.
- **[Skipping Expo 56 validation]** → Mitigation: Acceptable risk. The API surface (`File`/`Directory`/`Paths`) is unlikely to have breaking changes in 56 that 57 didn't also include. If issues surface, they'll show up in user feedback and can be addressed.
