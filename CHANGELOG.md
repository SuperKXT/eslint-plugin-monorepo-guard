# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.5] - 2026-07-05

### Added

- New `no-package-entry-import` rule. Prevents a package's files from importing that package's own entry file (typically `index.ts`) via a relative path — importing back through the barrel that re-exports you creates a require cycle. This is a separate check from `no-package-self-import`: it resolves relative imports against the filesystem rather than matching the package's registered name. Included in the `recommended` config.

## [0.0.4] - 2026-05-13

### Added

- ESLint v10 support. The peer dependency range is now `>=9.0.0 <11.0.0`, explicitly covering both ESLint 9 and 10.

### Changed

- `no-package-outside-import`: TypeScript `import type` statements that cross package boundaries are now reported as violations. Previously they were exempt; this exemption has been removed since the boundary rule applies to source structure regardless of type erasure.

### Fixed

- Removed unnecessary `as unknown as Rule.Node` type casts in rule implementations, fixing type errors under ESLint v10's updated typings.

## [0.0.3]

_Not documented in changelog._

## [0.0.2]

_Not documented in changelog._

## [0.0.1]

_Not documented in changelog._
