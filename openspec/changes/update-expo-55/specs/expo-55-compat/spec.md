## ADDED Requirements

### Requirement: Expo 55 peer dependency support
The library SHALL declare `expo` peer dependency range as `>=51.0.0 <56.0.0` and `expo-file-system` peer dependency range covering the versions shipped with Expo 51 through Expo 55.

#### Scenario: Install with Expo 55 project
- **WHEN** a consumer runs `npm install expo-cached-image` in an Expo 55 project
- **THEN** no peer dependency warnings SHALL be emitted for `expo` or `expo-file-system`

#### Scenario: Install with Expo 50 project
- **WHEN** a consumer runs `npm install expo-cached-image@55` in an Expo 50 project
- **THEN** npm SHALL emit a peer dependency warning indicating Expo 50 is not supported

### Requirement: Expo 55 devDependency alignment
The library's devDependencies SHALL pin `expo` to `55.0.5` and `expo-file-system` to the version compatible with Expo SDK 55.

#### Scenario: Fresh install
- **WHEN** a contributor runs `npm install` in the repo
- **THEN** Expo 55 and its matching `expo-file-system` SHALL be installed

### Requirement: Library version alignment
The library version SHALL be bumped to `55.0.0` to reflect the Expo SDK 55 target.

#### Scenario: Published package version
- **WHEN** the package is published to npm
- **THEN** the version field SHALL read `55.0.0`

### Requirement: Source compatibility with expo-file-system for Expo 55
All imports and API calls to `expo-file-system` (`File`, `Directory`, `Paths`, `File.downloadFileAsync`, `file.info()`, `file.move()`, `file.copy()`, `file.delete()`) SHALL work without errors under the `expo-file-system` version shipped with Expo 55.

#### Scenario: Build succeeds
- **WHEN** `npm run build` is executed with the updated dependencies
- **THEN** TypeScript compilation SHALL complete with zero errors

#### Scenario: Tests pass
- **WHEN** `npm test` is executed with the updated dependencies
- **THEN** all existing tests SHALL pass

#### Scenario: Lint passes
- **WHEN** `npm run lint` is executed with the updated dependencies
- **THEN** linting SHALL complete with zero errors
