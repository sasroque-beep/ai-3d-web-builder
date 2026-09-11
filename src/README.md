# `src/` — Source Layout

This folder holds all application code. The structure mirrors the modules
described in [`docs/SYSTEM_ARCHITECTURE.md`](../docs/SYSTEM_ARCHITECTURE.md)
and [`docs/AI_AGENTS.md`](../docs/AI_AGENTS.md).

> Most folders below are **scaffolding only** (a README, no code). Each
> module will be implemented in its own issue. This structure exists so
> that future work has a clear, agreed place to land — see
> [`AGENTS.md`](../AGENTS.md) §6.

## Folders

| Path | Purpose |
| --- | --- |
| `app/` | Next.js App Router — routes, layouts, route handlers only. |
| `modules/` | Product domains (bounded contexts). One folder per context. |
| `ai/` | AI Orchestrator and specialized agents. |
| `ui/` | Shared presentational components and interface states. |
| `server/` | Server-only concerns (persistence, auth, integrations). |
| `lib/` | Framework-agnostic pure utilities. |

## Dependency rules

Enforcement (e.g. dependency-cruiser) is a **future issue**; until then these
are conventions every change must respect.

- `app/` may import from `modules/`, `ai/`, `ui/`, `lib/`. Nothing imports
  from `app/`.
- `modules/<x>/` may import from `ai/`, `ui/`, `lib/`, `server/`. A module
  must **not** import from `app/` or reach into another `modules/<y>/`
  internals.
- `ai/` may import from `lib/` and `server/`. Not from `modules/`, `ui/` or
  `app/`.
- `ui/` may import from `lib/` only. Presentational; no data fetching.
- `server/` may import from `lib/`. Never imported by `ui/`.
- `lib/` is pure: no imports from any other `src/` folder, no framework code.

Path alias: `@/*` maps to `src/*`.
