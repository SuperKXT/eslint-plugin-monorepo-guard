import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resolves an extension-stripped relative import path to an absolute path.
 * If the resolved path is a directory, returns that directory's `index`
 * path instead (mirroring Node/bundler directory-import resolution), so it
 * can be compared directly against a package's entry file path.
 */
export const resolveRelativeImport = (
	fileDir: string,
	importPath: string,
): string => {
	const resolved = resolve(fileDir, importPath);
	if (existsSync(resolved) && statSync(resolved).isDirectory()) {
		return resolve(resolved, "index");
	}
	return resolved;
};
