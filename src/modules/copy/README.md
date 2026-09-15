# Copy

> Status: **in progress** — manual content/copy per section implemented
> (Issue #16). AI-driven copy generation, multiple copy variations and SEO
> metadata are still planned.

## Responsibility

Register the textual content (copy) of each section defined by the page
architecture (`../design`): headline, subheadline, body, CTA label and
section-specific social proof. Reusable input for the future modules that
apply the design system and 3D experience and assemble the site
(`site-builder`).

## Implemented (Issue #16)

- `types.ts`, `validation.ts`, `service.ts`, `actions.ts` — CRUD of one
  content block per section, gated on the section existing in the page
  architecture (`../design`).
- Persistence via `SectionCopyRepository`
  (`src/server/persistence/section-copy-repository.ts`) and the
  `company_site_page_section_copies` table — see
  [`docs/DATABASE.md`](../../../docs/DATABASE.md) §8.
- UI at `/leads/[id]/copy` (`src/app/leads/[id]/copy/`).

Unlike page/section architecture (many per company/page, upserted by a
user-chosen key), a section has exactly one content block, upserted by
`section_id` — the same "one record per parent" shape already used by
`diagnosis`, `strategy` and `site-planning`. There is no delete in this
version, matching every other module implemented so far.

## Belongs here

- Copy generation and revision logic
- Copy blocks/types consumed by `site-builder`
- Tone/voice configuration

## Does NOT belong here

- Strategy decisions (`../strategy`)
- Page/section architecture (`../design`)
- Visual design or layout
- SEO metadata rules (handled in `design` / `site-builder`)

## Depends on

- `src/lib`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
