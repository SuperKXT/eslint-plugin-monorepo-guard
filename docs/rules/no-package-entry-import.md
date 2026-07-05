# Prevent importing a package's own entry file (`no-package-entry-import`)

This rule prevents files inside a package from importing that package's own entry/barrel file (typically `index.ts`) via a relative path. A file that imports the entry file, while the entry file re-exports that same file, creates a require cycle: loading either module transitively requires loading the other before it has finished initializing.

This is a different concern from [`no-package-self-import`](./no-package-self-import.md), which catches imports of the package by its registered _name_ (e.g. `import x from "@pkg/my-package"`). This rule instead resolves relative imports against the filesystem to see whether they point at the package's own entry file, regardless of what the package is named.

## Rule details

### Fail

```js
// packages/my-package/src/utils.js (entry file is src/index.js)

import { helper } from "./index";
import { helper } from ".";

const x = require("./index");
```

```js
// packages/my-package/src/sub/file.js

// '..' resolves to src/index.js, the package's entry file:
import { helper } from "..";
```

### Pass

```js
// packages/my-package/src/utils.js

// Import the concrete file directly instead of going through the entry file:
import { helper } from "./helper";
import { thing } from "../other-module/thing";

// The entry file itself re-exporting other files is fine — that's its job:
// packages/my-package/src/index.js
export * from "./utils";

// Type-only imports are exempt: they're erased at compile time and can't
// cause a runtime require cycle.
import type { Thing } from ".";
```

## When to use

Enable this rule in any monorepo package that has an `index.*` entry file re-exporting its own internals. It catches the specific pattern that causes require cycles: an internal module reaching back through the barrel it is exported from.

## Configuration

This rule is included in the `recommended` config. To enable it manually:

```js
// eslint.config.js
import monorepoGuard from "eslint-plugin-monorepo-guard";

export default [
	{
		plugins: { "monorepo-guard": monorepoGuard },
		rules: {
			"monorepo-guard/no-package-entry-import": "error",
		},
	},
];
```

## How it works

The rule locates the package's entry file by convention: `index.{ts,tsx,js,jsx,mjs,cjs}` at the package root, falling back to the same search under `<root>/src`. If no such file exists, the rule reports nothing for that package.

For each relative import, the rule resolves the specifier against the importing file's directory. A specifier that resolves to a directory (such as `.` or `..`) is treated as pointing at that directory's entry file, matching how Node and bundlers resolve directory imports. If the resolved file matches the package's entry file, a violation is reported — unless the import is type-only, or the importing file _is_ the entry file itself.

Only the package's root entry file is guarded; nested directory-level barrels (e.g. `src/foo/index.ts`) are not checked. `require()` calls are checked the same way as `import` statements; dynamic `import()` is not, since it is deferred/async and does not trigger the synchronous module-loading failure this rule guards against.

The package and entry-file lookups are cached per directory, so there is no repeated filesystem I/O when linting multiple files in the same package.
