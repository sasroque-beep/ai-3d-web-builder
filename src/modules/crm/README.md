# CRM

> Status: **in progress** — company/lead registration implemented (Issue #4).
> Journey-stage tracking and external-CRM integration are still planned.

## Responsibility

Capture and manage leads and their journey through the funnel; the base for
future external-CRM integration.

## Implemented

- `types.ts` — `CompanyFormInput`, `CompanyRecord`, `FieldErrors`.
- `validation.ts` — required-field and format validation for the company
  registration form.
- `service.ts` — `createCrmService()` (create/list/get a company), wired to
  `src/server/persistence/company-repository`.
- `actions.ts` — `createCompanyAction`, the Next.js Server Action used by
  `src/app/leads/new`.

The `companies` record models both an existing client and a prospected lead
via `relationshipType: "client" | "lead"`, and reserves `origin: "manual" |
"public_research"` for when the future Research module can create records
automatically — no journey/funnel state machine is implemented yet.

## Belongs here

- Lead capture, storage contracts and journey state
- Journey-stage transitions and events

## Does NOT belong here

- Marketing tag/pixel wiring (`../marketing`)
- Reporting dashboards (`../analytics`)
- UI screens (those live in `src/app/leads`)

## Depends on

- `src/lib`, `src/server`

See [`src/README.md`](../../README.md) for dependency rules.
