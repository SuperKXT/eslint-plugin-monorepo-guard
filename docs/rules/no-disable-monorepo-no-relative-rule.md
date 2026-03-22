# Prevent disabling monorepo-guard rules (`no-disable-monorepo-no-relative-rule`)

This rule prevents any `eslint-disable` comment from suppressing a `monorepo-guard` rule. It covers all three disable comment forms: inline (`eslint-disable-line`), next-line (`eslint-disable-next-line`), and block-level (`eslint-disable`).

The monorepo boundary rules exist precisely to prevent import patterns that are hard to spot in code review. An `eslint-disable` comment on such a violation defeats the entire purpose of the rule, so this rule makes that impossible to do silently.

## Rule details

### Fail

```js
// Inline disable:
import something from '../some-other-package/file' // eslint-disable-line monorepo-guard/no-relative-import-outside-package

// Next-line disable:
// eslint-disable-next-line monorepo-guard/no-relative-import-outside-package
import something from '../some-other-package/file'

// Block disable:
/* eslint-disable monorepo-guard/no-relative-import-outside-package */

// Disabling any other monorepo-guard rule is also caught:
/* eslint-disable monorepo-guard/no-self-package-import */
/* eslint-disable monorepo-guard/no-disable-monorepo-no-relative-rule */
```

### Pass

```js
// Disabling unrelated rules is fine:
eval() // eslint-disable-line no-eval

/* eslint-disable some-other-plugin/some-rule */

// A bare eslint-disable (no rule specified) is also allowed:
/* eslint-disable */
```

## When to use

Enable this rule alongside any other `monorepo-guard` rule to prevent inline suppressions. It is included in the `recommended` config.

## Configuration

This rule is included in the `recommended` config. To enable it manually:

```js
// eslint.config.js
import monorepoGuard from 'eslint-plugin-monorepo-guard'

export default [
  {
    plugins: { 'monorepo-guard': monorepoGuard },
    rules: {
      'monorepo-guard/no-disable-monorepo-no-relative-rule': 'error',
    },
  },
]
```

## How it works

The rule inspects all comments on the `Program` node. Any comment matching the `eslint-disable` pattern that names a rule in the `monorepo-guard/` namespace is reported as a violation.
