# `modules/` — Product Domains

Each subfolder is a bounded context from
[`docs/SYSTEM_ARCHITECTURE.md`](../../docs/SYSTEM_ARCHITECTURE.md). Modules are
independent: they share only through `lib/`, `ui/`, `ai/` and `server/`, never
by importing another module's internals.

| Module | Responsibility |
| --- | --- |
| `research/` | Collect public data about companies and leads; business analysis. |
| `strategy/` | Define the conversion strategy for a project. |
| `copy/` | Generate copywriting aligned with the strategy. |
| `design/` | Page architecture and design-system application. |
| `experience-3d/` | 3D and motion experiences. |
| `site-builder/` | Generate and edit pages, sections and components. |
| `marketing/` | Marketing/analytics integrations (GA, GTM, pixels, UTMs, CAPI). |
| `crm/` | Leads and customer-journey management. |
| `analytics/` | Conversion tracking and reporting. |

All modules are **planned** — no implementation yet.
