# Site Builder

> Status: **in progress** — site preview implemented (Issue #20), with
> inline editing of section content from the preview (Issue #22).
> Export/render pipeline and page/section/component generation are
> still planned.

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

## Implemented (Issue #22)

- `SectionPreview.copy` now also carries the section's raw content
  record (or `null`), alongside the display fields already there — used
  to pre-fill an edit form without ever substituting the section's
  name/objective fallback as if it were authored copy.
- `SectionEditForm.tsx` (`src/app/leads/[id]/site-builder/`) — a
  single-section content form (no page/section picker, unlike
  `../copy`'s `SectionCopyForm`) that reuses the exact same
  `upsertSectionCopyAction` and persistence as Issue #16. No new
  persistence, no new eligibility rule.
- `SitePreviewViewer` gained an "Editar" toggle per section, swapping
  that section's read view for `SectionEditForm` in place; switching
  pages exits any open edit. `upsertSectionCopyAction`
  (`src/modules/copy/actions.ts`) now revalidates both `/copy` and
  `/site-builder` so the two screens never fall out of sync.

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
