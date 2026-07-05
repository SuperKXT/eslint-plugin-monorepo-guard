import { dirname, resolve } from "node:path";

import type { Rule } from "eslint";

import { findNearestPackage } from "../helpers/find-nearest-package.js";
import type { TPackageInfo } from "../helpers/find-nearest-package.js";
import { findPackageEntry } from "../helpers/find-package-entry.js";
import { resolveRelativeImport } from "../helpers/resolve-relative-import.js";

const ENTRY_EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "cjs"];

const stripKnownExtension = (path: string): string => {
	for (const extension of ENTRY_EXTENSIONS) {
		const suffix = `.${extension}`;
		if (path.endsWith(suffix)) return path.slice(0, -suffix.length);
	}
	return path;
};

const packageCache = new Map<string, TPackageInfo | null>();

const getPackage = (fileDir: string): TPackageInfo | null => {
	if (!packageCache.has(fileDir)) {
		packageCache.set(fileDir, findNearestPackage(fileDir));
	}
	return packageCache.get(fileDir) ?? null;
};

const entryCache = new Map<string, string | null>();

const getPackageEntry = (packagePath: string): string | null => {
	if (!entryCache.has(packagePath)) {
		entryCache.set(packagePath, findPackageEntry(packagePath));
	}
	return entryCache.get(packagePath) ?? null;
};

type TImportSpecifierNode = { type: string; importKind?: "type" | "value" };
type TImportDeclarationNode = {
	importKind?: "type" | "value";
	specifiers: TImportSpecifierNode[];
};

const isTypeOnlyImport = (node: Rule.Node): boolean => {
	const importNode = node as unknown as TImportDeclarationNode;
	if (importNode.importKind === "type") return true;
	if (importNode.specifiers.length === 0) return false;
	return importNode.specifiers.every(
		(specifier) =>
			specifier.type === "ImportSpecifier" && specifier.importKind === "type",
	);
};

export const noPackageEntryImport: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Prevent package files from importing the package's own entry file (causes require cycles)",
			recommended: true,
			url: "https://github.com/SuperKXT/eslint-plugin-monorepo-guard/blob/main/docs/rules/no-package-entry-import.md",
		},
		schema: [],
		messages: {
			entryImport:
				'"{{importPath}}" resolves to the entry file of package "{{packageName}}". Import the concrete file directly instead of going through the entry file, to avoid require cycles.',
		},
	},

	create(context) {
		const check = (node: Rule.Node, importPath: string): void => {
			if (!importPath.startsWith(".")) return;

			const filename = context.filename;
			const fileDir = dirname(filename);

			const pkg = getPackage(fileDir);
			if (!pkg) return;

			const entryPath = getPackageEntry(pkg.path);
			if (!entryPath) return;

			const entryBase = stripKnownExtension(entryPath);
			if (stripKnownExtension(resolve(filename)) === entryBase) return;

			const importBase = resolveRelativeImport(
				fileDir,
				stripKnownExtension(importPath),
			);
			if (importBase !== entryBase) return;

			context.report({
				node,
				messageId: "entryImport",
				data: { importPath, packageName: pkg.name },
			});
		};

		return {
			ImportDeclaration(node) {
				if (isTypeOnlyImport(node)) return;
				check(node, node.source.value as string);
			},
			CallExpression(node) {
				if (
					node.callee.type === "Identifier" &&
					node.callee.name === "require"
				) {
					const [arg] = node.arguments;
					if (arg?.type === "Literal" && typeof arg.value === "string") {
						check(node, arg.value);
					}
				}
			},
		};
	},
};
