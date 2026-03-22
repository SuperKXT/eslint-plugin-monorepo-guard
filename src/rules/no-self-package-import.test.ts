import { RuleTester } from 'eslint'
import { describe, vi } from 'vitest'

vi.mock('../utils/find-nearest-package.js', () => ({
  findNearestPackage: vi.fn(),
}))

import { findNearestPackage } from '../utils/find-nearest-package.js'
import rule from './no-self-package-import.js'

const mockFindNearestPackage = vi.mocked(findNearestPackage)

const PACKAGE_DIR = '/repo/packages/my-package'
const PACKAGE_FILE = `${PACKAGE_DIR}/src/index.ts`
const PACKAGE_NAME = 'my-package'

const SCOPED_PACKAGE_DIR = '/repo/packages/scoped'
const SCOPED_PACKAGE_FILE = `${SCOPED_PACKAGE_DIR}/src/index.ts`
const SCOPED_PACKAGE_NAME = '@my-org/scoped-pkg'

describe('no-self-package-import', () => {
  // Set mock once before RuleTester registers tests. The module-level packageCache
  // in the rule is populated lazily on first access — setting up the mock here
  // (before vitest executes the it() blocks) ensures the right value is cached.
  mockFindNearestPackage.mockImplementation((dir: string) => {
    if (dir === `${PACKAGE_DIR}/src`) {
      return { path: PACKAGE_DIR, name: PACKAGE_NAME }
    }
    if (dir === `${SCOPED_PACKAGE_DIR}/src`) {
      return { path: SCOPED_PACKAGE_DIR, name: SCOPED_PACKAGE_NAME }
    }
    return null
  })

  const tester = new RuleTester({
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
  })

  tester.run('no-self-package-import', rule, {
    valid: [
      // Importing another package is fine
      {
        code: "import { thing } from 'lodash'",
        filename: PACKAGE_FILE,
      },
      // Importing a scoped external package is fine
      {
        code: "import { thing } from '@my-org/other-package'",
        filename: PACKAGE_FILE,
      },
      // Relative imports are fine
      {
        code: "import { helper } from './helper'",
        filename: PACKAGE_FILE,
      },
      {
        code: "import { helper } from '../other-module/helper'",
        filename: PACKAGE_FILE,
      },
      // require() of an unrelated package is fine
      {
        code: "const x = require('lodash')",
        filename: PACKAGE_FILE,
      },
      // A name that merely starts with the same characters is not a match
      {
        code: "import { x } from 'my-package-extra'",
        filename: PACKAGE_FILE,
      },
    ],

    invalid: [
      // Exact self-reference via import
      {
        code: `import { helper } from '${PACKAGE_NAME}'`,
        filename: PACKAGE_FILE,
        errors: [
          {
            messageId: 'selfImport',
            data: { importPath: PACKAGE_NAME, packageName: PACKAGE_NAME },
          },
        ],
      },
      // Deep self-reference via import
      {
        code: `import { helper } from '${PACKAGE_NAME}/src/other-file'`,
        filename: PACKAGE_FILE,
        errors: [
          {
            messageId: 'selfImport',
            data: {
              importPath: `${PACKAGE_NAME}/src/other-file`,
              packageName: PACKAGE_NAME,
            },
          },
        ],
      },
      // Exact self-reference via require()
      {
        code: `const x = require('${PACKAGE_NAME}')`,
        filename: PACKAGE_FILE,
        errors: [
          {
            messageId: 'selfImport',
            data: { importPath: PACKAGE_NAME, packageName: PACKAGE_NAME },
          },
        ],
      },
      // Deep self-reference via require()
      {
        code: `const x = require('${PACKAGE_NAME}/deep/path')`,
        filename: PACKAGE_FILE,
        errors: [
          {
            messageId: 'selfImport',
            data: {
              importPath: `${PACKAGE_NAME}/deep/path`,
              packageName: PACKAGE_NAME,
            },
          },
        ],
      },
      // Scoped package self-reference
      {
        code: `import { thing } from '${SCOPED_PACKAGE_NAME}'`,
        filename: SCOPED_PACKAGE_FILE,
        errors: [
          {
            messageId: 'selfImport',
            data: {
              importPath: SCOPED_PACKAGE_NAME,
              packageName: SCOPED_PACKAGE_NAME,
            },
          },
        ],
      },
      // Scoped package deep self-reference
      {
        code: `import { thing } from '${SCOPED_PACKAGE_NAME}/utils'`,
        filename: SCOPED_PACKAGE_FILE,
        errors: [
          {
            messageId: 'selfImport',
            data: {
              importPath: `${SCOPED_PACKAGE_NAME}/utils`,
              packageName: SCOPED_PACKAGE_NAME,
            },
          },
        ],
      },
    ],
  })
})
