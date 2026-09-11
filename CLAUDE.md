# CLAUDE.md

Guidance for Claude Code and other AI agents working in this repository.

## Source of truth

**[`AGENTS.md`](./AGENTS.md) is the primary instruction file.** Read it before
making any change. This file only adds practical, tool-level notes.

## Mandatory flow

Issue → Branch → Development → Tests → Commit → Push → Pull Request → Checks →
Merge. Never commit to `main`. One branch per issue
(`feature/…`, `fix/…`, `improvement/…`, `refactor/…`, `chore/…`, `tech/…`).

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4
- Biome (lint + format) · Vitest (unit tests) · Lefthook + commitlint
- Package manager: pnpm (via Corepack) · Node 22 (`.nvmrc`)

## Commands

```bash
corepack enable          # once, provisions pnpm
pnpm install             # installs deps + git hooks (lefthook)
pnpm dev                 # dev server
pnpm build               # production build
pnpm typecheck           # tsc --noEmit
pnpm check               # Biome lint + format + assist (CI gate)
pnpm check:fix           # Biome autofix
pnpm test                # Vitest run
pnpm test:coverage       # Vitest + v8 coverage
```

## Structure

Application code lives in `src/`. See [`src/README.md`](./src/README.md) for the
module map and dependency-direction rules. Most module folders are scaffolding
(README only) until their dedicated issue.

## Conventions

- Conventional Commits, enforced by commitlint on `commit-msg`.
- Biome runs on staged files on `pre-commit`; `pnpm typecheck` on `pre-push`.
- LF line endings (`.gitattributes`), 2-space indent, double quotes.
- Never commit secrets. `.env.example` is the template; real values go in
  `.env.local` (git-ignored).
