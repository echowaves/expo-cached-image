## Why

Expo SDK 57 has been released (v57.0.9). The library currently targets Expo 51–55 at version 55.0.0. Two major SDK versions (56 and 57) have shipped since the last upgrade. Upgrading keeps the library compatible with the latest Expo ecosystem, ensures access to bug fixes and performance improvements, and prevents users on Expo 56/57 from encountering peer-dependency warnings or runtime incompatibilities.

## What Changes

- **BREAKING**: Slide the supported Expo window — drop Expo 51–52, support Expo 53–57.
- Update `expo` devDependency from `55.0.5` → `57.0.9`.
- Update `expo-file-system` devDependency from `55.0.10` → `57.0.2`.
- Bump `@types/react-native` from `^0.72.0` → `^0.83.0` (currently 4 versions behind).
- Widen `peerDependencies` ranges to include Expo 57 and matching `expo-file-system` versions.
- Bump library version from `55.0.0` → `57.0.0` (skipping 56 per convention alignment).
- Verify source code compatibility with `expo-file-system` v57 APIs (`File`, `Directory`, `Paths`).
- Update `react` and `react-native` devDependencies if Expo 57 requires newer versions.
- Ensure tests, build, and linting pass with the updated dependencies.

## Capabilities

### New Capabilities

- `expo-57-compat`: Ensure full compatibility with Expo SDK 57 and its bundled `expo-file-system` version.

### Modified Capabilities

_(none — image caching semantics remain unchanged)_

## Impact

- **package.json**: `version`, `devDependencies`, and `peerDependencies` all change.
- **src/index.tsx** and **src/consts.ts**: Verify `expo-file-system` API compatibility; likely no code changes needed (API surface has been stable across 55→57).
- **Downstream consumers**: Users on Expo ≤52 will need to stay on the 55.x release line. Users on Expo 56/57 can adopt the new version.
