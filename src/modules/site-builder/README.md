# Site Builder

> Status: **in progress** — read-only site preview implemented (Issue
> #20). Editing, export/render pipeline and page/section/component
> generation are still planned.

## Responsibility

Assemble the site plan, page architecture (`../design`), content
(`../copy`) and visual theme (`../design`) into concrete pages, sections
and components, and support later editing of the generated site.

## Implemented (Issue #20)

- `types.ts` — `SitePreview`, `PagePreview`, `SectionPreview`,
  `SitePreviewTheme`, `PreviewEligibility`.
- `service.ts` — `checkPreviewEligibility(pages)` (gated on the company
  having at least one page in its architecture — content and theme are
  optional context, not eligibility) and `buildSitePreview(input)`, a
  pure function that composes already-fetched pages/sections/content/
  theme into a render-ready structure, falling back to the section's
  name/objective when no content has been registered yet, and to `null`
  theme when none exists.
- UI at `/leads/[id]/site-builder` (`src/app/leads/[id]/site-builder/`):
  a read-only preview with page tabs, rendering each section's content
  (or its fallback) with the company's theme applied via CSS custom
  properties.

This issue introduces **no new persistence** — it only reads data
already stored by `design` and `copy` and composes it for rendering.

## Belongs here

- Page/section/component generation from blueprints
- Editor state and persistence (future issue)
- Export/render pipeline for a project's website (future issue)

## Does NOT belong here

- Strategy/copy/design generation (their own modules)
- Deployment (`../../` deploy pipeline — future)
- Analytics wiring (`../analytics`, `../marketing`)

## Depends on

- `src/lib`, `src/ui`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
