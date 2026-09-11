# `server/` — Server-only Concerns

Code that must never reach the client bundle: persistence, authentication,
authorization and third-party integration clients.

| Concern | Notes |
| --- | --- |
| Persistence | Database access. Engine + ORM **not chosen yet** — future issue. See [`docs/DATABASE.md`](../../docs/DATABASE.md). |
| Auth | Authentication + authorization, with organization isolation. See [`docs/SECURITY.md`](../../docs/SECURITY.md). Future issue. |
| Integrations | Server-side API clients (CRM, marketing, AI providers). |

Rules:

- may import from `src/lib` only
- never imported by `src/ui`
- never logs secrets, tokens, API keys or credentials
  ([`AGENTS.md`](../../AGENTS.md) §13)

Status: **planned** — no implementation yet.
