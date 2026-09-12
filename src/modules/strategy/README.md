# Strategy

> Status: **in progress** — foundational marketing/conversion strategy
> implemented (Issue #10). AI-driven generation, copy generation and
> page-objective definitions are still planned.

## Responsibility

Turn the company's diagnosis into a structured marketing and conversion
strategy: objectives, audience, pains/desires, value proposition,
differentiators, objections, sales arguments, tone, main offer, CTAs and
buyer-journey stages. Reusable input for the future modules that build the
site architecture, copy and conversion elements.

## Implemented (Issue #10)

- `types.ts`, `validation.ts`, `service.ts`, `actions.ts` — CRUD of one
  strategy per company, gated on an existing diagnosis (`../research/diagnosis`).
- Persistence via `StrategyRepository`
  (`src/server/persistence/strategy-repository.ts`) and the
  `company_strategies` table — see [`docs/DATABASE.md`](../../../docs/DATABASE.md) §5.
- UI at `/leads/[id]/strategy` (`src/app/leads/[id]/strategy/`).

## Belongs here

- Strategy models (objectives, audience, offer, objections, CTAs)
- Buyer-journey mapping (discovery → consideration → decision → conversion → post)
- Page-objective definitions consumed by `site-builder` (future issue)

## Does NOT belong here

- Data collection and diagnosis (`../research`)
- AI-driven strategy generation (future issue — this issue is manual only)
- Copy text generation (`../copy`)
- Rendering / editing of sites (`../site-builder`)

## Depends on

- `src/lib`, `src/server`, `src/ai`

See [`src/README.md`](../../README.md) for dependency rules.
