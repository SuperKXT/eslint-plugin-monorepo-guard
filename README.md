# eslint-plugin-monorepo-guard

ESLint rules to enforce package boundaries in a monorepo.

Requires:

- **ESLint** V9 or later (flat config)
- Node.js `^18.18.0 || ^20.9.0 || >=21.1.0`

## Rules

| Rule                                                                   | Description                                            | Recommended |
| ---------------------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| [`no-package-outside-import`](docs/rules/no-package-outside-import.md) | Prevent relative imports that cross a package boundary | ✅          |
| [`no-package-self-import`](docs/rules/no-package-self-import.md)       | Prevent a package from importing itself by name        | ✅          |

## Installation

```sh
npm install eslint-plugin-monorepo-guard --save-dev
```

## Usage

### Recommended config (simplest)

Add the recommended preset to your `eslint.config.js`. It enables both rules as errors:

```js
// eslint.config.js
import { monorepoGuard } from "eslint-plugin-monorepo-guard";

export default [
	monorepoGuard.configs.recommended,
	// ... rest of your config
];
```

### Manual config

If you want to enable rules individually:

```js
// eslint.config.js
import { monorepoGuard } from "eslint-plugin-monorepo-guard";

export default [
	{
		plugins: { "monorepo-guard": monorepoGuard },
		rules: {
			"monorepo-guard/no-package-outside-import": "error",
			"monorepo-guard/no-package-self-import": "error",
		},
	},
];
```

### Applying only to specific workspaces

If your repo root also has an `eslint.config.js` and you only want these rules to apply inside workspace packages, scope them with `files`:

```js
// eslint.config.js (repo root)
import { monorepoGuard } from "eslint-plugin-monorepo-guard";

export default [
	{
		files: ["packages/**/*.{js,ts,jsx,tsx}"],
		...monorepoGuard.configs.recommended,
	},
];
```

## Rule details

### `no-package-outside-import`

Prevents relative paths from escaping the nearest `package.json` boundary.

```js
// packages/my-package/src/index.js

// ✗ Crosses into a sibling package
import something from "../other-package/something.js";

// ✓ Use the package's registered name
import something from "@pkg/other-package";

// ✓ Relative imports within the same package are fine
import { helper } from "./helper";
```

[Full documentation →](docs/rules/no-package-outside-import.md)

---

### `no-package-self-import`

Prevents a package from importing itself by its own package name.

```js
// packages/my-package/src/utils.js  (package name: "my-package")

// ✗ Self-reference by name
import { helper } from "@pkg/my-package";
import { helper } from "@pkg/my-package/src/other-file";

// ✓ Use a relative path instead
import { helper } from "./helper";
import { helper } from "../other-module/helper";
```

[Full documentation →](docs/rules/no-package-self-import.md)

## License

MIT
