## Why

Expo SDK 55 has been released (v55.0.5). The library currently targets Expo 50–54 and uses `expo-file-system` v19. Upgrading keeps the library compatible with the latest Expo ecosystem, ensures access to bug fixes and performance improvements, and prevents users on Expo 55 from encountering peer-dependency warnings or runtime incompatibilities.

## What Changes

- **BREAKING**: Bump minimum supported Expo SDK — drop Expo 50, support Expo 51–55.
- Update `expo` devDependency from `54.0.13` → `55.0.5`.
- Update `expo-file-system` devDependency to the version compatible with Expo 55.
- Widen `peerDependencies` ranges to include Expo 55 and the matching `expo-file-system` version.
- Bump library version from `54.0.7` → `55.0.0` to reflect the new Expo SDK major alignment.
- Adapt source code if `expo-file-system` introduces any API changes (e.g., `Directory`, `File`, `Paths` imports).
- Update `@types/react` and `react`/`react-native` devDependencies if required by Expo 55's dependency graph.
- Ensure tests and linting pass with the updated dependencies.

## Capabilities

### New Capabilities

- `expo-55-compat`: Ensure full compatibility with Expo SDK 55 and its bundled `expo-file-system` version, including any API surface changes.

### Modified Capabilities

_(none — no spec-level behavior changes to existing capabilities; image caching semantics remain the same)_

## Impact

- **package.json**: `devDependencies`, `peerDependencies`, and `version` fields all change.
- **src/index.tsx** and **src/consts.ts**: May require import or API adjustments if `expo-file-system` changes its `File`, `Directory`, or `Paths` exports.
- **Downstream consumers**: Users on Expo ≤50 will need to stay on the 54.x release line. Users on Expo 55 can adopt the new version.
- **CI / build**: `npm install`, `tsc`, `jest`, and `ts-standard` must all pass after the upgrade.
