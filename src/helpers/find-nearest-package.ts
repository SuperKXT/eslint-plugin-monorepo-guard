import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type TPackageInfo = {
	path: string;
	name: string;
};

/**
 * Walk up the directory tree from `startDir` to find the nearest package.json.
 * Returns the directory path and package name, or null if none is found.
 */
export const findNearestPackage = (startDir: string): TPackageInfo | null => {
	let dir = startDir;

	while (true) {
		const candidate = resolve(dir, "package.json");

		if (existsSync(candidate)) {
			try {
				const pkg = JSON.parse(readFileSync(candidate, "utf8")) as {
					name?: string;
				};
				return { path: dir, name: pkg.name ?? candidate };
			} catch {
				// Malformed package.json — keep walking up
			}
		}

		const parent = dirname(dir);
		if (parent === dir) return null; // Reached filesystem root
		dir = parent;
	}
};
