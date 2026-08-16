## 1. Update Dependencies

- [x] 1.1 Update `expo` devDependency from `55.0.5` to `57.0.9` in package.json
- [x] 1.2 Update `expo-file-system` devDependency from `55.0.10` to `57.0.2` in package.json
- [x] 1.3 Remove `@types/react-native` devDependency from package.json (deprecated, RN 0.83+ ships its own types)
- [x] 1.4 Update `react` and `react-native` devDependencies if Expo 57 bundles newer versions (already at 19.2.0 / 0.83.3 — no change needed)
- [x] 1.5 Update peerDependencies: set `expo` range to `>=53.0.0 <58.0.0` and `expo-file-system` range to `>=53.0.0 <58.0.0`

## 2. Version Bump

- [x] 2.1 Bump `version` field in package.json from `55.0.0` to `57.0.0`

## 3. Source Code Compatibility

- [x] 3.1 Review Expo 57 `expo-file-system` changelog for API changes (no breaking changes to File, Directory, Paths, or downloadFileAsync)
- [x] 3.2 Verify imports and API calls in `src/consts.ts` (Paths.cache.uri — compatible)
- [x] 3.3 Verify imports and API calls in `src/index.tsx` (File, Directory, downloadFileAsync, info, move, copy, delete — all compatible)

## 4. Validation

- [x] 4.1 Run `npm install` and verify clean install with no peer dependency warnings
- [x] 4.2 Run `npm run build` and verify TypeScript compilation succeeds with zero errors
- [x] 4.3 Run `npm test` and verify all tests pass (no tests exist in __tests__/ — pre-existing condition, not a regression)
- [x] 4.4 Run `npm run lint` and verify linting passes (also fixed 3 pre-existing floating promise issues)
