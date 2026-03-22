import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import { beforeEach, describe, vi } from "vitest";

vi.mock("../helpers/find-nearest-package.js", () => ({
	findNearestPackage: vi.fn(),
}));

import { findNearestPackage } from "../helpers/find-nearest-package.js";
import { noPackageOutsideImport } from "./no-package-outside-import.js";

const mockFindNearestPackage = vi.mocked(findNearestPackage);

/*
  Simulated file structure:

  /repo/
    packages/
      my-package/
        package.json  (name: "my-package")
        file.ts
        sub/
          file.ts
      other-package/
        package.json  (name: "other-package")
        file.ts
*/

const MY_PACKAGE_DIR = "/repo/packages/my-package";
const MY_PACKAGE_FILE = `${MY_PACKAGE_DIR}/file.ts`;
const MY_PACKAGE_SUB_FILE = `${MY_PACKAGE_DIR}/sub/file.ts`;

const MY_PACKAGE_INFO = { path: MY_PACKAGE_DIR, name: "my-package" };

describe("no-package-outside-import", () => {
	beforeEach(() => {
		mockFindNearestPackage.mockReturnValue(MY_PACKAGE_INFO);
	});

	const tester = new RuleTester({
		languageOptions: { ecmaVersion: 2022, sourceType: "module" },
	});

	tester.run("no-package-outside-import", noPackageOutsideImport, {
		valid: [
			// External module — always ok
			{
				code: "import _ from 'lodash'",
				filename: MY_PACKAGE_FILE,
			},
			// Scoped external package — always ok
			{
				code: "import { thing } from '@my-org/other-package'",
				filename: MY_PACKAGE_FILE,
			},
			// Same-directory relative import — within the package
			{
				code: "import { helper } from './helper'",
				filename: MY_PACKAGE_FILE,
			},
			// Relative import into a subdirectory — within the package
			{
				code: "import { thing } from './sub/thing'",
				filename: MY_PACKAGE_FILE,
			},
			// Relative import going up but staying within the package (from sub/)
			{
				code: "import { thing } from '../file'",
				filename: MY_PACKAGE_SUB_FILE,
			},
			// require() of an external module
			{
				code: "const x = require('lodash')",
				filename: MY_PACKAGE_FILE,
			},
			// TypeScript type-only import crossing the boundary — allowed (erased at compile time)
			{
				code: "import type { SomeType } from '../../other-package'",
				filename: MY_PACKAGE_FILE,
				languageOptions: { parser: tsParser },
			},
		],

		invalid: [
			// Default import crossing package boundary
			{
				code: "import something from '../other-package/file'",
				filename: MY_PACKAGE_FILE,
				errors: [
					{
						messageId: "outsidePackage",
						data: {
							importPath: "../other-package/file",
							packageName: "my-package",
						},
					},
				],
			},
			// Named import crossing package boundary
			{
				code: "import { something } from '../other-package/file'",
				filename: MY_PACKAGE_FILE,
				errors: [
					{
						messageId: "outsidePackage",
						data: {
							importPath: "../other-package/file",
							packageName: "my-package",
						},
					},
				],
			},
			// require() crossing package boundary
			{
				code: "const x = require('../other-package/file')",
				filename: MY_PACKAGE_FILE,
				errors: [
					{
						messageId: "outsidePackage",
						data: {
							importPath: "../other-package/file",
							packageName: "my-package",
						},
					},
				],
			},
			// Crossing boundary from a subdirectory
			{
				code: "import { x } from '../../other-package/file'",
				filename: MY_PACKAGE_SUB_FILE,
				errors: [
					{
						messageId: "outsidePackage",
						data: {
							importPath: "../../other-package/file",
							packageName: "my-package",
						},
					},
				],
			},
		],
	});
});
