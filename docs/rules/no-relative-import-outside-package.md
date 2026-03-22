# Prevent relative imports outside of a monorepo package (`no-relative-import-outside-package`)

This rule enforces package and workspace boundaries in a monorepo by preventing relative imports that traverse above the nearest `package.json`. It works with any monorepo tool — Yarn Workspaces, npm Workspaces, pnpm Workspaces, Nx, Lerna, and others.

Packages should be isolated units. Using a relative path to reach into a sibling package bypasses the published interface (the other package's `exports`), makes refactoring harder, and will break if the consuming package is ever extracted from the monorepo.

## Rule details

### Fail

```js
// packages/my-package/src/index.js

// Crossing into a sibling package via a relative path:
import something from '../some-other-package/something.js'
import { util } from '../../shared/helpers'

const x = require('../some-other-package/something.js')
```

### Pass

```js
// packages/my-package/src/index.js

// Import the sibling package by its registered name:
import something from '@my-monorepo/some-other-package'
import { util } from '@my-monorepo/shared'

const x = require('@my-monorepo/some-other-package')

// Relative imports within the same package are fine:
import { helper } from './helper'
import { thing } from '../other-module/thing'

// TypeScript type-only imports are always allowed:
import type { SomeType } from '../some-other-package'
```

## When to use

Enable this rule across all packages in your monorepo. Pair it with [`no-self-package-import`](./no-self-package-import.md) to also prevent a package from importing itself by name.

## Configuration

This rule is included in the `recommended` config. To enable it manually:

```js
// eslint.config.js
import monorepoGuard from 'eslint-plugin-monorepo-guard'

export default [
  {
    plugins: { 'monorepo-guard': monorepoGuard },
    rules: {
      'monorepo-guard/no-relative-import-outside-package': 'error',
    },
  },
]
```

## How it works

For each relative import, the rule resolves the absolute path that the import points to, then finds the nearest `package.json` above the current file. If the resolved import path falls outside the directory containing that `package.json`, a violation is reported.

TypeScript `import type` statements are excluded from this check since they are erased at compile time and carry no runtime coupling.

The package lookup is cached per directory, so there is no repeated filesystem I/O when linting multiple files in the same package.
