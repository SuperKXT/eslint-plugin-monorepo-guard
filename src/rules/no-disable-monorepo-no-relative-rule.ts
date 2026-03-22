import type { Rule } from 'eslint'

// Matches: eslint-disable, eslint-disable-line, eslint-disable-next-line
// optionally followed by a rule name (e.g. monorepo-cop/no-relative-import-outside-package)
const disableRegex =
  /^eslint-disable(-next-line|-line)?\s+((@?[\w-]+\/([\w-]+\/)?)?[\w-]+)?/u

function extractRuleName(commentValue: string): string | null {
  const match = disableRegex.exec(commentValue.trim())
  if (!match) return null
  // match[2] is the rule name (may be undefined for bare eslint-disable)
  return match[2] ?? null
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent eslint-disable comments that suppress monorepo-cop rules',
      recommended: true,
    },
    schema: [],
    messages: {
      noDisable: 'You cannot disable the rule {{rule}}',
    },
  },

  create(context) {
    return {
      Program(node) {
        for (const comment of node.comments ?? []) {
          const ruleName = extractRuleName(comment.value)

          if (ruleName?.includes('monorepo-guard')) {
            context.report({
              loc: {
                start: { ...comment.loc!.start, column: -1 },
                end: comment.loc!.end,
              },
              messageId: 'noDisable',
              data: { rule: ruleName },
            })
          }
        }
      },
    }
  },
}

export default rule
