# Specialized Agents

> Status: **planned** — scaffolding only, no code yet.

One agent per responsibility, from
[`docs/AI_AGENTS.md`](../../../docs/AI_AGENTS.md) §2:

`research` · `strategy` · `copy` · `design` · `seo` · `3d` · `qa` · `deploy`

Each agent:

- has a single, well-defined task
- receives context from the orchestrator, returns a structured result
- does not call other agents directly (the orchestrator coordinates)

## Depends on

- `src/lib`, `src/server`
