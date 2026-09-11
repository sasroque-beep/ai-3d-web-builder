# `server/` — Server-only Concerns

Code that must never reach the client bundle: persistence, authentication,
authorization and third-party integration clients.

| Concern | Notes |
| --- | --- |
| Persistence | `db/` — SQLite (via `@libsql/client`) + Drizzle ORM, local file, migrated on connect. `persistence/` — repository contracts (e.g. `CompanyRepository`) consumed by `modules/`. Production engine (Postgres or hosted libSQL) **not chosen yet** — future issue. See [`docs/DATABASE.md`](../../docs/DATABASE.md). |
| Auth | Authentication + authorization, with organization isolation. See [`docs/SECURITY.md`](../../docs/SECURITY.md). Future issue. |
| Integrations | Server-side API clients (CRM, marketing, AI providers). |

Rules:

- may import from `src/lib` only
- never imported by `src/ui`
- never logs secrets, tokens, API keys or credentials
  ([`AGENTS.md`](../../AGENTS.md) §13)

Status: **in progress** — `db/` and `persistence/company-repository.ts`
implemented (Issue #4); auth and third-party integrations still planned.
