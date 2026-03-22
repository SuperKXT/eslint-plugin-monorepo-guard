import { RuleTester } from 'eslint'
import { describe } from 'vitest'

import plugin from '../index.js'
import rule from './no-disable-monorepo-no-relative-rule.js'

describe('no-disable-monorepo-no-relative-rule', () => {
  const tester = new RuleTester({
    // Register the monorepo-guard plugin so ESLint 9 recognises its rule names
    // when they appear in eslint-disable comments.
    plugins: { 'monorepo-guard': plugin },
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    // Disable the "unused disable directive" check — we care only about our rule.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  })

  tester.run('no-disable-monorepo-no-relative-rule', rule, {
    valid: [
      // Disabling a built-in rule is fine
      { code: "eval() // eslint-disable-line no-eval" },
      // Bare eslint-disable (no rule name) is fine
      { code: '/* eslint-disable */' },
    ],

    invalid: [
      // Inline disable of a monorepo-guard rule
      {
        code: "import x from '../other/file' // eslint-disable-line monorepo-guard/no-relative-import-outside-package",
        errors: [
          {
            messageId: 'noDisable',
            data: { rule: 'monorepo-guard/no-relative-import-outside-package' },
          },
        ],
      },
      // Next-line disable
      {
        code: '// eslint-disable-next-line monorepo-guard/no-relative-import-outside-package',
        errors: [
          {
            messageId: 'noDisable',
            data: { rule: 'monorepo-guard/no-relative-import-outside-package' },
          },
        ],
      },
      // Block-level disable of no-relative-import-outside-package
      {
        code: '/* eslint-disable monorepo-guard/no-relative-import-outside-package */',
        errors: [
          {
            messageId: 'noDisable',
            data: { rule: 'monorepo-guard/no-relative-import-outside-package' },
          },
        ],
      },
      // Block-level disable of no-self-package-import
      {
        code: '/* eslint-disable monorepo-guard/no-self-package-import */',
        errors: [
          {
            messageId: 'noDisable',
            data: { rule: 'monorepo-guard/no-self-package-import' },
          },
        ],
      },
      // Disabling the no-disable rule itself
      {
        code: '/* eslint-disable monorepo-guard/no-disable-monorepo-no-relative-rule */',
        errors: [
          {
            messageId: 'noDisable',
            data: { rule: 'monorepo-guard/no-disable-monorepo-no-relative-rule' },
          },
        ],
      },
    ],
  })
})
