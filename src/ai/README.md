# `ai/` — Orchestration and Agents

Implements the agent architecture from
[`docs/AI_AGENTS.md`](../../docs/AI_AGENTS.md).

| Path | Purpose |
| --- | --- |
| `orchestrator/` | Coordinates agents: understands the goal, picks agents, orders execution, passes context, tracks results. |
| `agents/` | Specialized agents (research, strategy, copy, design, seo, 3d, qa, deploy), each with a single responsibility. |

`ai/` may depend on `src/lib` and `src/server` only. It must not import from
`modules/`, `ui/` or `app/` — modules call into `ai/`, not the other way
around.

Status: **planned** — no implementation yet.
