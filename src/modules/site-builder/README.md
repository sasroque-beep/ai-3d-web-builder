# Site Builder

> Status: **planned** — scaffolding only, no code yet.

## Responsibility

Assemble strategy + copy + design + 3D into concrete pages, sections and
components, and support later editing of the generated site.

## Belongs here

- Page/section/component generation from blueprints
- Editor state and persistence
- Export/render pipeline for a project's website

## Does NOT belong here

- Strategy/copy/design generation (their own modules)
- Deployment (`../../` deploy pipeline — future)
- Analytics wiring (`../analytics`, `../marketing`)

## Depends on

- `src/lib`, `src/ui`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
