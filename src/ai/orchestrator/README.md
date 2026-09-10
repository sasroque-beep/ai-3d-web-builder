# AI Orchestrator

> Status: **planned** — scaffolding only, no code yet.

## Responsibility

Coordinate the specialized agents (see [`docs/AI_AGENTS.md`](../../../docs/AI_AGENTS.md) §1):

- understand the user's goal and the project state
- decide which agents run and in what order
- pass each agent the context it needs
- track results, request revisions, avoid duplicate work

## Does NOT belong here

- Task-specific logic that belongs to an individual agent (`../agents`)
- Product-domain logic (`src/modules`)

## Depends on

- `src/lib`, `src/server`, `../agents`
