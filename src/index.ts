import type { Linter, Rule } from "eslint";

import pkg from "../package.json" with { type: "json" };
import { noPackageOutsideImport } from "./rules/no-package-outside-import.js";
import { noPackageSelfImport } from "./rules/no-package-self-import.js";

const rules = {
	"no-package-outside-import": noPackageOutsideImport,
	"no-package-self-import": noPackageSelfImport,
} satisfies Record<string, Rule.RuleModule>;

const plugin = {
	meta: {
		name: "eslint-plugin-monorepo-guard",
		version: pkg.version,
	},
	rules,
} as const;

const recommendedRules = {
	"monorepo-guard/no-package-outside-import": "error",
	"monorepo-guard/no-package-self-import": "error",
} satisfies Linter.RulesRecord;

const configs = {
	recommended: {
		plugins: { "monorepo-guard": plugin },
		rules: recommendedRules,
	} satisfies Linter.Config,
};

export const monorepoGuard = { ...plugin, configs };
