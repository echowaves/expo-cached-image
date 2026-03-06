## 1. Update Dependencies

- [ ] 1.1 Update `expo` devDependency from `54.0.13` to `55.0.5` in package.json
- [ ] 1.2 Update `expo-file-system` devDependency to the version compatible with Expo SDK 55
- [ ] 1.3 Update `react`, `react-native`, and `@types/react` devDependencies to versions required by Expo 55
- [ ] 1.4 Update peerDependencies: set `expo` range to `>=51.0.0 <56.0.0` and `expo-file-system` range to cover Expo 51–55 compatible versions

## 2. Version Bump

- [ ] 2.1 Bump `version` field in package.json from `54.0.7` to `55.0.0`

## 3. Source Code Compatibility

- [ ] 3.1 Review Expo 55 `expo-file-system` changelog for API changes to `File`, `Directory`, `Paths`, `File.downloadFileAsync`
- [ ] 3.2 Update imports and API calls in `src/consts.ts` if needed
- [ ] 3.3 Update imports and API calls in `src/index.tsx` if needed

## 4. Validation

- [ ] 4.1 Run `npm install` and verify clean install with no peer dependency warnings
- [ ] 4.2 Run `npm run build` and verify TypeScript compilation succeeds with zero errors
- [ ] 4.3 Run `npm test` and verify all tests pass
- [ ] 4.4 Run `npm run lint` and verify linting passes
