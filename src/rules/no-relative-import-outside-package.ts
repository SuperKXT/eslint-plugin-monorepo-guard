import { dirname, resolve } from 'node:path'

import type { Rule } from 'eslint'

import { findNearestPackage, type PackageInfo } from '../utils/find-nearest-package.js'

const scopedRegExp = /^@[^/]+\/[^/]+/u
const externalModuleRegExp = /^\w/u

function isExternal(name: string): boolean {
  return scopedRegExp.test(name) || externalModuleRegExp.test(name)
}

const packageCache = new Map<string, PackageInfo | null>()

function getPackage(fileDir: string): PackageInfo | null {
  if (!packageCache.has(fileDir)) {
    packageCache.set(fileDir, findNearestPackage(fileDir))
  }
  return packageCache.get(fileDir) ?? null
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prevent relative imports that cross a package boundary',
      recommended: true,
    },
    schema: [],
    messages: {
      outsidePackage:
        'Import of "{{importPath}}" reaches outside of the package "{{packageName}}"',
    },
  },

  create(context) {
    function check(node: Rule.Node, importPath: string): void {
      if (isExternal(importPath)) return

      const importBase = dirname(importPath)
      if (importBase === '.') return // Same-directory import, always within the package
      if (!/^\./u.test(importBase)) return // Not a relative path

      const filename = context.filename
      const fileDir = dirname(filename)
      const importDir = resolve(fileDir, importBase)

      const pkg = getPackage(fileDir)
      if (!pkg) return

      if (!importDir.startsWith(pkg.path)) {
        context.report({
          node,
          messageId: 'outsidePackage',
          data: { importPath, packageName: pkg.name },
        })
      }
    }

    return {
      ImportDeclaration(node) {
        // importKind is a TypeScript parser extension; absent means value import
        const importKind = (node as unknown as { importKind?: string }).importKind
        if (importKind === 'type') return
        check(node as unknown as Rule.Node, node.source.value as string)
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require'
        ) {
          const [arg] = node.arguments
          if (arg?.type === 'Literal' && typeof arg.value === 'string') {
            check(node as unknown as Rule.Node, arg.value)
          }
        }
      },
    }
  },
}

export default rule
