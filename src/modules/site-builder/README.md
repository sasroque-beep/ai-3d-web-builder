# Site Builder

> Status: **in progress** — site preview implemented (Issue #20), with
> inline editing of section content from the preview (Issue #22), a
> section's 3D experience displayed (Issue #45) and now also editable
> inline (Issue #48). Export/render pipeline and page/section/component
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

## Implemented (Issue #45)

- `SectionPreview.experience3d` now carries the section's persisted
  `Experience3DSceneConfig` (`../experience-3d`, Issue #33), or `null` —
  fetched in `/leads/[id]/site-builder/page.tsx` via
  `experience3DService.getSceneConfig`, the same way section copy is
  fetched. `buildSitePreview` composes it; no new persistence, no new
  eligibility rule.
- `SitePreviewViewer` mounts `Experience3DView` (`../experience-3d`)
  under a section's heading when it has a configured 3D experience — a
  visual layer only, never replacing the section's content/CTA. A
  section without one renders exactly as before.
- Only `Experience3DView` and `experience-3d`'s public types are
  imported — never R3F/Drei/Three.js, per that module's isolation
  decision (Issue #26), enforced by its own `isolation.test.ts`.
- No editing UI for the 3D config yet — future Issue, mirroring how
  Issue #22 followed Issue #20 for section content.

## Implemented (Issue #48)

- Each section gained a second action, "Configurar 3D"/"Editar 3D"
  (label depends on whether `experience3d` is set), next to the existing
  "Editar" for content. Both alternate the section into an edit form in
  place — `SectionEditForm` (content, Issue #22) or `SceneConfigEditForm`
  (3D, `../experience-3d`'s public `upsertExperience3DSceneConfigAction`)
  — mutually exclusive: a section shows at most one open form at a time.
- No new persistence, eligibility rule or validation — reuses
  `experience3DService.upsertSceneConfig` (Issue #33) exactly like the
  content form reuses `copyService.upsertSectionCopy`.

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
