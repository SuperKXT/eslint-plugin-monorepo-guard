import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ENTRY_EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "cjs"];

const findIndexFile = (dir: string): string | null => {
	for (const extension of ENTRY_EXTENSIONS) {
		const candidate = resolve(dir, `index.${extension}`);
		if (existsSync(candidate)) return candidate;
	}
	return null;
};

/**
 * Locate a package's entry/barrel file by convention: `index.*` at the
 * package root, falling back to `index.*` under `<root>/src`. Returns the
 * absolute file path (with extension), or null if no entry file is found.
 */
export const findPackageEntry = (packagePath: string): string | null =>
	findIndexFile(packagePath) ?? findIndexFile(resolve(packagePath, "src"));
