# Prevent self-referencing package imports (`no-self-package-import`)

This rule prevents a package from importing itself by its own package name. This commonly happens when a monorepo package is also listed as a dependency of itself, or when a developer reaches for the public package name instead of a relative path while working inside the package.

Self-referencing imports create a hidden coupling to the published package interface rather than the local source. This can mask build errors, cause confusion about which version is actually being loaded, and break in environments where the package is not yet installed.

## Rule details

### Fail

```js
// packages/my-package/src/utils.js

// Importing the package itself by its registered name:
import { helper } from 'my-package'
import { helper } from 'my-package/src/other-file'

const x = require('my-package')
const x = require('my-package/deep/path')

// Scoped packages work the same way:
import { thing } from '@my-org/my-package'
import { thing } from '@my-org/my-package/utils'
```

### Pass

```js
// packages/my-package/src/utils.js

// Use relative imports to reference other files within the same package:
import { helper } from './helper'
import { helper } from '../other-module/helper'

// Importing other packages is fine:
import { thing } from '@my-org/some-other-package'
import _ from 'lodash'
```

## When to use

Enable this rule in any monorepo where packages should import their own internals via relative paths. This enforces that the package's source is always used directly, rather than going through an installed/published version of itself.

## Configuration

This rule is included in the `recommended` config. To enable it manually:

```js
// eslint.config.js
import monorepoGuard from 'eslint-plugin-monorepo-guard'

export default [
  {
    plugins: { 'monorepo-guard': monorepoGuard },
    rules: {
      'monorepo-guard/no-self-package-import': 'error',
    },
  },
]
```

## How it works

The rule reads the nearest `package.json` relative to the file being linted to determine the current package name. If the import path matches that name exactly, or starts with `<name>/` (for deep imports), the rule reports a violation.

The package lookup result is cached per directory, so there is no repeated filesystem I/O when linting multiple files in the same package.
