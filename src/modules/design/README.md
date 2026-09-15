# Design

> Status: **implemented** — page architecture (Issue #14) and visual
> theme/design tokens (Issue #18) implemented. Actual application of the
> theme to rendered CSS/components is still planned (`site-builder`).

## Responsibility

Turn the company's site plan into a structured page architecture (pages,
objectives, buyer-journey stages, ordered sections) and, from that
architecture and its content, a structured visual theme: color palette,
typography, visual style, color-mode preference, spacing density and CTA
visual guidelines. Reusable input for the future modules that apply the
design system and 3D experience and assemble the site (`site-builder`).

## Implemented

- **Page architecture (Issue #14)**: `types.ts`, `validation.ts`,
  `service.ts`, `actions.ts` — CRUD of pages and page sections, gated on
  an existing site plan (`../site-planning`) for pages, and on an
  existing page for its sections. Persistence via `SitePageRepository`
  and `SitePageSectionRepository`
  (`src/server/persistence/site-page-repository.ts`,
  `site-page-section-repository.ts`), tables `company_site_pages` and
  `company_site_page_sections` — see
  [`docs/DATABASE.md`](../../../docs/DATABASE.md) §7. UI at
  `/leads/[id]/design`.
- **Visual theme (Issue #18)**: one theme per company (`checkThemeEligibility`
  — gated on the company having at least one page in its architecture),
  in the same `types.ts`/`validation.ts`/`service.ts`/`actions.ts` files.
  Persistence via `SiteThemeRepository`
  (`src/server/persistence/site-theme-repository.ts`), table
  `company_site_themes` — see
  [`docs/DATABASE.md`](../../../docs/DATABASE.md) §9. UI at
  `/leads/[id]/design/theme`.

Unlike page/section architecture (many per company/page, upserted by a
user-chosen key), the theme is a single record per company, upserted by
`company_id` — the same "one record per parent" shape used by
`diagnosis`/`strategy`/`site-planning`. There is no delete in this
version, matching every other module implemented so far.

## Belongs here

- Page/section blueprints (structure, objective, order, journey stage)
- Visual theme/design tokens (palette, typography, style, color mode,
  spacing density, CTA visual guidelines)
- Eligibility rules for when pages/sections/theme can be created/updated

## Does NOT belong here

- Site planning (`../site-planning`)
- AI-driven generation of the theme or the architecture (future issue —
  this issue is manual only)
- Actual application of the theme to rendered CSS/components (`../site-builder`)
- Reusable presentational components (`src/ui`)
- 3D/motion scenes (`../experience-3d`)
- Copy text (`../copy`)
- Site assembly, editing, rendering or publishing (`../site-builder`)

## Depends on

- `src/lib`, `src/ui`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
