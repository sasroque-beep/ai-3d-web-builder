# Contributing

## Prerequisites

- **Node 22** (see `.nvmrc` — `nvm use` picks it up)
- **pnpm** via Corepack: `corepack enable`

## Setup

```bash
pnpm install
```

This also installs the Git hooks (Lefthook).

## Development flow

The mandatory flow is defined in [`AGENTS.md`](./AGENTS.md) and
[`docs/DEVELOPMENT_WORKFLOW.md`](./docs/DEVELOPMENT_WORKFLOW.md):

> Issue → Branch → Development → Tests → Pull Request → Review → Merge → Deploy

- Never work on `main`. Create one branch per issue:
  `feature/<n>-slug`, `fix/<n>-slug`, `improvement/<n>-slug`,
  `refactor/<n>-slug`, `chore/<n>-slug`, `tech/<n>-slug`.
- Keep changes small and scoped to the issue.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm check` | Biome lint + format + assist (the CI gate) |
| `pnpm check:fix` | Biome, apply safe fixes |
| `pnpm test` | Run unit tests |
| `pnpm test:coverage` | Unit tests with coverage |

Run `pnpm check && pnpm typecheck && pnpm test && pnpm build` before opening a
PR — CI runs the same steps.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), enforced by
commitlint. Allowed types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`,
`build`, `ci`, `chore`, `style`, `revert`.

## Pull requests

Fill in [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md)
and reference the issue with `Closes #<n>`.

## Code style

- LF line endings, UTF-8, 2-space indent, double quotes (enforced by Biome and
  `.editorconfig`).
- Never commit secrets. Copy `.env.example` to `.env.local` for local values.
