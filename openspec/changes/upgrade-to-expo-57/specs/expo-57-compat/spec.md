### Requirement: Expo 57 peer dependency support
The library SHALL declare `expo` peer dependency range as `>=53.0.0 <58.0.0` and `expo-file-system` peer dependency range as `>=53.0.0 <58.0.0`, covering Expo SDK 53 through 57.

#### Scenario: Install with Expo 57 project
- **WHEN** a consumer runs `npm install expo-cached-image` in an Expo 57 project
- **THEN** no peer dependency warnings SHALL be emitted for `expo` or `expo-file-system`

#### Scenario: Install with Expo 52 project
- **WHEN** a consumer runs `npm install expo-cached-image@57` in an Expo 52 project
- **THEN** npm SHALL emit a peer dependency warning indicating Expo 52 is not supported

### Requirement: Expo 57 devDependency alignment
The library's devDependencies SHALL pin `expo` to `57.0.9` and `expo-file-system` to `57.0.2`.

#### Scenario: Fresh install
- **WHEN** a contributor runs `npm install` in the repo
- **THEN** Expo 57 and its matching `expo-file-system` SHALL be installed

### Requirement: Type definitions alignment
The library SHALL remove `@types/react-native` as a devDependency since React Native 0.83+ ships its own complete type declarations and the DefinitelyTyped package is effectively deprecated (last version: 0.73.0).

#### Scenario: TypeScript compilation
- **WHEN** `npm run build` is executed without `@types/react-native` installed
- **THEN** type resolution for `react-native` imports (`Image`, `ImageProps`, `ImageURISource`) SHALL succeed using types shipped with `react-native` itself

### Requirement: Library version alignment
The library version SHALL be bumped to `57.0.0` to reflect the Expo SDK 57 target.

#### Scenario: Published package version
- **WHEN** the package is published to npm
- **THEN** the version field SHALL read `57.0.0`

### Requirement: Source compatibility with expo-file-system for Expo 57
All imports and API calls to `expo-file-system` (`File`, `Directory`, `Paths`, `File.downloadFileAsync`, `file.info()`, `file.move()`, `file.copy()`, `file.delete()`) SHALL work without errors under `expo-file-system` v57.

#### Scenario: Build succeeds
- **WHEN** `npm run build` is executed with the updated dependencies
- **THEN** TypeScript compilation SHALL complete with zero errors

#### Scenario: Tests pass
- **WHEN** `npm test` is executed with the updated dependencies
- **THEN** all existing tests SHALL pass

#### Scenario: Lint passes
- **WHEN** `npm run lint` is executed with the updated dependencies
- **THEN** linting SHALL complete with zero errors
