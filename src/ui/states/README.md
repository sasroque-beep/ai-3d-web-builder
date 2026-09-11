# Interface States

> Status: **implemented** (Issue #4) — `progress` (multi-step/long-running)
> is still planned, no use case for it yet.

Primitives for the interface states required across the product:

- `Skeleton` — content placeholder during load (`skeleton`)
- `Spinner` — inline loading indicator (`loading`)
- `EmptyState` — empty state with a clear next action (`empty`)
- `ErrorState` — error state with recovery (`error`)
- `SuccessMessage` — confirmation feedback (`success`)

Each primitive is presentational, accessible (`role="status"` /
`role="alert"` where applicable), and respects `prefers-reduced-motion`
(enforced globally in `src/app/globals.css`).
