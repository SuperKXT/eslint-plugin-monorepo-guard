# eslint-plugin-monorepo-guard

ESLint rules to enforce package boundaries in a monorepo.

Requires **ESLint 9 or later** (flat config). Node.js `^18.18.0 || ^20.9.0 || >=21.1.0`.

## Rules

| Rule | Description | Recommended |
|---|---|---|
| [`no-relative-import-outside-package`](docs/rules/no-relative-import-outside-package.md) | Prevent relative imports that cross a package boundary | ✅ |
| [`no-self-package-import`](docs/rules/no-self-package-import.md) | Prevent a package from importing itself by name | ✅ |
| [`no-disable-monorepo-no-relative-rule`](docs/rules/no-disable-monorepo-no-relative-rule.md) | Prevent `eslint-disable` comments that suppress monorepo-guard rules | ✅ |

## Installation

```sh
npm install eslint-plugin-monorepo-guard --save-dev
```

## Usage

### Recommended config (simplest)

Add the recommended preset to your `eslint.config.js`. It enables all three rules as errors:

```js
// eslint.config.js
import monorepoGuard from 'eslint-plugin-monorepo-guard'

export default [
  monorepoGuard.configs.recommended,
  // ... rest of your config
]
```

### Manual config

If you want to enable rules individually:

```js
// eslint.config.js
import monorepoGuard from 'eslint-plugin-monorepo-guard'

export default [
  {
    plugins: { 'monorepo-guard': monorepoGuard },
    rules: {
      'monorepo-guard/no-relative-import-outside-package': 'error',
      'monorepo-guard/no-self-package-import': 'error',
      'monorepo-guard/no-disable-monorepo-no-relative-rule': 'error',
    },
  },
]
```

### Applying only to specific workspaces

If your repo root also has an `eslint.config.js` and you only want these rules to apply inside workspace packages, scope them with `files`:

```js
// eslint.config.js (repo root)
import monorepoGuard from 'eslint-plugin-monorepo-guard'

export default [
  {
    files: ['packages/**/*.{js,ts,jsx,tsx}'],
    ...monorepoGuard.configs.recommended,
  },
]
```

## Rule details

### `no-relative-import-outside-package`

Prevents relative paths from escaping the nearest `package.json` boundary.

```js
// packages/my-package/src/index.js

// ✗ Crosses into a sibling package
import something from '../some-other-package/something.js'

// ✓ Use the package's registered name
import something from '@my-monorepo/some-other-package'

// ✓ Relative imports within the same package are fine
import { helper } from './helper'
```

[Full documentation →](docs/rules/no-relative-import-outside-package.md)

---

### `no-self-package-import`

Prevents a package from importing itself by its own package name.

```js
// packages/my-package/src/utils.js  (package name: "my-package")

// ✗ Self-reference by name
import { helper } from 'my-package'
import { helper } from 'my-package/src/other-file'

// ✓ Use a relative path instead
import { helper } from './helper'
import { helper } from '../other-module/helper'
```

[Full documentation →](docs/rules/no-self-package-import.md)

---

### `no-disable-monorepo-no-relative-rule`

Prevents `eslint-disable` comments that suppress any `monorepo-guard` rule.

```js
// ✗ Any of these will be reported:
import x from '../other-pkg/file' // eslint-disable-line monorepo-guard/no-relative-import-outside-package
/* eslint-disable monorepo-guard/no-self-package-import */

// ✓ Disabling unrelated rules is fine:
eval() // eslint-disable-line no-eval
```

[Full documentation →](docs/rules/no-disable-monorepo-no-relative-rule.md)

## License

MIT
