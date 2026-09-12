# Site Planning

> Status: **in progress** — foundational strategic site plan implemented
> (Issue #12). AI-driven generation and page-architecture derivation are
> still planned.

## Responsibility

Turn the company's marketing and conversion strategy into a structured
plan for the site that will later be built: main site goal, priority
conversion goal, priority audience, value proposition applied to the
site, featured offer, primary/secondary CTAs, communication priorities,
objections to address, social proof and trust elements, required
features and integrations, lead-capture/contact/conversion/content/visual
requirements, 3D experience opportunities, which customer-journey stages
the site should support, and strategic notes. Structured, machine-readable
input for the future modules that build the page architecture, content,
design and 3D experience.

## Implemented (Issue #12)

- `types.ts`, `validation.ts`, `service.ts`, `actions.ts` — CRUD of one
  site plan per company, gated on an existing strategy (`../strategy`).
- Persistence via `SitePlanRepository`
  (`src/server/persistence/site-plan-repository.ts`) and the
  `company_site_plans` table — see [`docs/DATABASE.md`](../../../docs/DATABASE.md) §6.
- UI at `/leads/[id]/site-planning` (`src/app/leads/[id]/site-planning/`).

## Belongs here

- Site planning models (goals, audience, offer, CTAs, requirements)
- Eligibility rules for when a site plan can be created/updated
- Structured data consumable by future page-architecture/content/design/3D
  modules

## Does NOT belong here

- Strategy definition (`../strategy`)
- AI-driven plan generation (future issue — this issue is manual only)
- Page architecture, copy, design or 3D generation (future modules)
- Site assembly, editing, rendering or publishing (`../site-builder`)

## Depends on

- `src/lib`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
