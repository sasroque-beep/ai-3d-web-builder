# Design

> Status: **in progress** — page architecture (pages and their ordered
> sections) implemented (Issue #14). Design-token application, theming and
> layout-level accessibility rules are still planned.

## Responsibility

Turn the company's site plan into a structured page architecture: which
pages the site will have, each page's objective and associated
buyer-journey stage, and each page's ordered sections with their own
objective and prioritized CTA. Reusable input for the future modules that
generate copy, apply the design system and assemble the site
(`site-builder`).

## Implemented (Issue #14)

- `types.ts`, `validation.ts`, `service.ts`, `actions.ts` — CRUD of pages
  and page sections, gated on an existing site plan
  (`../site-planning`) for pages, and on an existing page for its
  sections.
- Persistence via `SitePageRepository`
  (`src/server/persistence/site-page-repository.ts`) and
  `SitePageSectionRepository`
  (`src/server/persistence/site-page-section-repository.ts`), tables
  `company_site_pages` and `company_site_page_sections` — see
  [`docs/DATABASE.md`](../../../docs/DATABASE.md) §7.
- UI at `/leads/[id]/design` (`src/app/leads/[id]/design/`).

Unlike the previous modules (one record per company), a company can have
many pages, and each page can have many sections — both are upserted by a
user-chosen key (`slug` for pages, `section_key` for sections scoped to
their page) rather than a single per-company record. There is no delete
in this version, matching every other module implemented so far.

## Belongs here

- Page/section blueprints (structure, objective, order, journey stage)
- Eligibility rules for when pages/sections can be created/updated

## Does NOT belong here

- Site planning (`../site-planning`)
- Design-token application and theming decisions (future issue)
- Reusable presentational components (`src/ui`)
- 3D/motion scenes (`../experience-3d`)
- Copy text (`../copy`)
- Site assembly, editing, rendering or publishing (`../site-builder`)

## Depends on

- `src/lib`, `src/ui`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
