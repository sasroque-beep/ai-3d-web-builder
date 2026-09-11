# Interface States

> Status: **planned** — scaffolding only, no code yet.

Primitives for the interface states required across the product:

- `skeleton` — content placeholders during load
- `loading` — spinners / progress indicators
- `empty` — empty states with a clear next action
- `error` — error states with recovery
- `success` — confirmation feedback
- `progress` — multi-step / long-running progress

Each primitive is presentational, accessible, and respects
`prefers-reduced-motion`.
