# Contributing

## Prerequisites

- Node.js (version pinned in `package.json`)
- [pnpm](https://pnpm.io/) (version pinned in `package.json`)

## Setup

```sh
git clone https://github.com/SuperKXT/eslint-plugin-monorepo-guard.git
cd eslint-plugin-monorepo-guard
pnpm install
```

## Development

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `pnpm build`      | Compile the plugin with tsup       |
| `pnpm test`       | Run tests once with Vitest         |
| `pnpm test:watch` | Run tests in watch mode            |
| `pnpm typecheck`  | Type-check without emitting output |
| `pnpm lint`       | Lint, format, and spellcheck       |

## Adding a rule

1. Create `src/rules/your-rule-name.ts` and export a `Rule.RuleModule`.
2. Create `src/rules/your-rule-name.test.ts` with `RuleTester` tests.
3. Export the rule from `src/index.ts` and add it to the recommended config if appropriate.
4. Add a docs page at `docs/rules/your-rule-name.md` and link to it from the `url` field in the rule's `meta.docs`.
5. Update the rules table in `README.md`.

## Pull requests

- Keep changes focused — one rule or fix per PR.
- Ensure `pnpm test`, `pnpm typecheck`, and `pnpm lint` all pass before opening a PR.
- Add or update tests for any behavior change.

## License

By contributing you agree that your changes will be licensed under the [MIT License](LICENSE).
