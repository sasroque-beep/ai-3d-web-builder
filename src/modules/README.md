# `modules/` — Product Domains

Each subfolder is a bounded context from
[`docs/SYSTEM_ARCHITECTURE.md`](../../docs/SYSTEM_ARCHITECTURE.md). Modules are
independent: they share only through `lib/`, `ui/`, `ai/` and `server/`, never
by importing another module's internals.

| Module | Responsibility |
| --- | --- |
| `crm/` | Leads and customer-journey management. **Implemented.** |
| `research/` | Collect public data about companies and leads; business analysis, including strategic diagnosis. **Implemented.** |
| `strategy/` | Define the conversion strategy for a project. **Implemented.** |
| `site-planning/` | Turn the strategy into a structured plan for the site to be built. **Implemented.** |
| `design/` | Page architecture and design-system application. **Implemented (page architecture).** |
| `copy/` | Generate copywriting aligned with the strategy. |
| `experience-3d/` | 3D and motion experiences. |
| `site-builder/` | Generate and edit pages, sections and components. |
| `marketing/` | Marketing/analytics integrations (GA, GTM, pixels, UTMs, CAPI). |
| `analytics/` | Conversion tracking and reporting. |

Modules marked **Implemented** above have code; the rest are still
**planned** — scaffolding (README) only.
