import { dirname } from "node:path";

import type { Rule } from "eslint";

import {
	findNearestPackage,
	type PackageInfo,
} from "../helpers/find-nearest-package.js";

const packageCache = new Map<string, PackageInfo | null>();

const getPackage = (fileDir: string): PackageInfo | null => {
	if (!packageCache.has(fileDir)) {
		packageCache.set(fileDir, findNearestPackage(fileDir));
	}
	return packageCache.get(fileDir) ?? null;
};

export const noPackageSelfImport: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Prevent a package from importing itself by name (use relative imports instead)",
			recommended: true,
		},
		schema: [],
		messages: {
			selfImport:
				'"{{importPath}}" is a self-reference to the current package "{{packageName}}". Use a relative import instead.',
		},
	},

	create(context) {
		const check = (node: Rule.Node, importPath: string): void => {
			const filename = context.filename;
			const fileDir = dirname(filename);

			const pkg = getPackage(fileDir);
			if (!pkg?.name) return;

			if (importPath === pkg.name || importPath.startsWith(`${pkg.name}/`)) {
				context.report({
					node,
					messageId: "selfImport",
					data: { importPath, packageName: pkg.name },
				});
			}
		};

		return {
			ImportDeclaration(node) {
				check(node as unknown as Rule.Node, node.source.value as string);
			},
			CallExpression(node) {
				if (
					node.callee.type === "Identifier" &&
					node.callee.name === "require"
				) {
					const [arg] = node.arguments;
					if (arg?.type === "Literal" && typeof arg.value === "string") {
						check(node as unknown as Rule.Node, arg.value);
					}
				}
			},
		};
	},
};
