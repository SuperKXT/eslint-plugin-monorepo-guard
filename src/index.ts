import type { Linter, Rule } from 'eslint'

import noDisableMonorepoNoRelativeRule from './rules/no-disable-monorepo-no-relative-rule.js'
import noRelativeImportOutsidePackage from './rules/no-relative-import-outside-package.js'
import noSelfPackageImport from './rules/no-self-package-import.js'

const rules = {
  'no-relative-import-outside-package': noRelativeImportOutsidePackage,
  'no-disable-monorepo-no-relative-rule': noDisableMonorepoNoRelativeRule,
  'no-self-package-import': noSelfPackageImport,
} satisfies Record<string, Rule.RuleModule>

const plugin = { rules } as const

const recommendedRules = {
  'monorepo-guard/no-relative-import-outside-package': 'error',
  'monorepo-guard/no-disable-monorepo-no-relative-rule': 'error',
  'monorepo-guard/no-self-package-import': 'error',
} satisfies Linter.RulesRecord

const configs = {
  recommended: {
    plugins: { 'monorepo-guard': plugin },
    rules: recommendedRules,
  } satisfies Linter.Config,
}

export default { ...plugin, configs }
