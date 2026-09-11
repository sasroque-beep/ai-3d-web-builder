# `ui/` — Shared Presentational Components

Reusable, presentational-only building blocks. No data fetching, no
domain logic. May import from `src/lib` only.

| Path | Purpose |
| --- | --- |
| `states/` | Interface-state primitives: skeleton, loading, empty, error, success, progress. |

Guidelines (see [`AGENTS.md`](../../AGENTS.md) §9–§10 and
[`docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md)):

- every interactive component covers its states (default, hover, focus,
  active, disabled, loading, success, error, empty)
- animations honour `prefers-reduced-motion`
- accessible and responsive by default

Status: **planned** — no components implemented yet.
