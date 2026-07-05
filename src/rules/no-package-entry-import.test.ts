import { resolve } from "node:path";

import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import { describe, vi } from "vitest";

import { findNearestPackage } from "../helpers/find-nearest-package.js";
import { findPackageEntry } from "../helpers/find-package-entry.js";
import { resolveRelativeImport } from "../helpers/resolve-relative-import.js";

import { noPackageEntryImport } from "./no-package-entry-import.js";

vi.mock(import("../helpers/find-nearest-package.js"), () => ({
	findNearestPackage: vi.fn(),
}));
vi.mock(import("../helpers/find-package-entry.js"), () => ({
	findPackageEntry: vi.fn(),
}));
vi.mock(import("../helpers/resolve-relative-import.js"), () => ({
	resolveRelativeImport: vi.fn(),
}));

const mockFindNearestPackage = vi.mocked(findNearestPackage);
const mockFindPackageEntry = vi.mocked(findPackageEntry);
const mockResolveRelativeImport = vi.mocked(resolveRelativeImport);

/*
  Simulated file structure:

  /repo/packages/my-package/
    package.json  (name: "my-package")
    src/
      index.ts     <- entry file
      utils.ts
      sub/
        file.ts
*/

const PACKAGE_DIR = "/repo/packages/my-package";
const SRC_DIR = `${PACKAGE_DIR}/src`;
const ENTRY_FILE = `${SRC_DIR}/index.ts`;
const UTILS_FILE = `${SRC_DIR}/utils.ts`;
const SUB_DIR = `${SRC_DIR}/sub`;
const SUB_FILE = `${SUB_DIR}/file.ts`;
const PACKAGE_NAME = "my-package";

// Mimics real resolution against the simulated file structure above, without
// touching the real filesystem: '.'/'..' resolve to that directory's index.
const fakeResolveRelativeImport = (fileDir: string, importPath: string) => {
	const resolved = resolve(fileDir, importPath);
	return resolved === SRC_DIR || resolved === SUB_DIR
		? resolve(resolved, "index")
		: resolved;
};

describe("no-package-entry-import", () => {
	mockFindNearestPackage.mockImplementation((dir: string) =>
		dir.startsWith(PACKAGE_DIR)
			? { path: PACKAGE_DIR, name: PACKAGE_NAME }
			: null,
	);
	mockFindPackageEntry.mockImplementation((packagePath: string) =>
		packagePath === PACKAGE_DIR ? ENTRY_FILE : null,
	);
	mockResolveRelativeImport.mockImplementation(fakeResolveRelativeImport);

	const tester = new RuleTester({
		languageOptions: { ecmaVersion: 2022, sourceType: "module" },
	});

	tester.run("no-package-entry-import", noPackageEntryImport, {
		valid: [
			// Importing another package is fine
			{
				code: "import { thing } from 'lodash'",
				filename: UTILS_FILE,
			},
			// Relative import of a concrete file (not the entry) is fine
			{
				code: "import { helper } from './helper'",
				filename: UTILS_FILE,
			},
			// The entry file itself re-exporting other files is fine
			{
				code: "export * from './utils'",
				filename: ENTRY_FILE,
			},
			// Type-only import of the entry file is exempt (no runtime cycle)
			{
				code: "import type { Thing } from '.'",
				filename: UTILS_FILE,
				languageOptions: { parser: tsParser },
			},
			// Import where every specifier is an inline type import
			{
				code: "import { type Thing } from '.'",
				filename: UTILS_FILE,
				languageOptions: { parser: tsParser },
			},
		],

		invalid: [
			// Explicit relative reference to the entry file
			{
				code: "import { helper } from './index'",
				filename: UTILS_FILE,
				errors: [
					{
						messageId: "entryImport",
						data: { importPath: "./index", packageName: PACKAGE_NAME },
					},
				],
			},
			// '.' shorthand for the current directory's entry file
			{
				code: "import { helper } from '.'",
				filename: UTILS_FILE,
				errors: [
					{
						messageId: "entryImport",
						data: { importPath: ".", packageName: PACKAGE_NAME },
					},
				],
			},
			// '..' shorthand for the parent directory's entry file, from a subdirectory
			{
				code: "import { helper } from '..'",
				filename: SUB_FILE,
				errors: [
					{
						messageId: "entryImport",
						data: { importPath: "..", packageName: PACKAGE_NAME },
					},
				],
			},
			// require() of the entry file
			{
				code: "const x = require('./index')",
				filename: UTILS_FILE,
				errors: [
					{
						messageId: "entryImport",
						data: { importPath: "./index", packageName: PACKAGE_NAME },
					},
				],
			},
			// A mixed import (value + inline type specifier) still has a runtime require
			{
				code: "import { thing, type Thing } from '.'",
				filename: UTILS_FILE,
				languageOptions: { parser: tsParser },
				errors: [
					{
						messageId: "entryImport",
						data: { importPath: ".", packageName: PACKAGE_NAME },
					},
				],
			},
		],
	});
});
