# Experience 3D

> Status: **in progress** — technical foundation (Issue #24): React
> Three Fiber + Drei installed and validated with an isolated
> smoke-test scene. No scene config contract, persistence or
> integration with `site-builder` yet.

## Responsibility

3D and motion experiences that increase perceived value without hurting
performance, accessibility, conversion or mobile (see
[`AGENTS.md`](../../../AGENTS.md) §11).

## Belongs here

- 3D scene definitions and loaders
- Motion/scroll experience composition
- Performance budgets and asset-optimization rules for 3D

## Does NOT belong here

- Layout/page architecture (`../design`)
- Generic UI animation primitives (`src/ui`)

## Implemented (Issue #24)

- **Rendering stack**: [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
  + [Drei](https://github.com/pmndrs/drei), on top of Three.js. Chosen
  over raw Three.js (imperative lifecycle, more friction with React's
  component model) and engine-first alternatives (Babylon.js,
  PlayCanvas, A-Frame, Spline embeds — they fight Next.js SSR/hydration
  or aren't data-drivable for future AI-generated scene configs)
  because R3F's declarative reconciler fits this project's existing
  pattern of typed, composable data → render (e.g. `buildSitePreview`
  in `../site-builder/service.ts`), and Drei ships the perf/a11y-facing
  helpers (`useGLTF`/`Preload`, `Detailed` for LOD,
  `AdaptiveDpr`/`PerformanceMonitor`, `Html` for in-canvas accessible
  UI) this module will need later.
- `SmokeTestScene.tsx` — a minimal rotating-cube scene proving the
  stack renders correctly under Next.js 15 (App Router) + React 19 +
  TypeScript strict, animated via R3F's `useFrame` render loop (not
  React state, to avoid re-rendering on every frame — the pattern any
  future real scene must follow).
- Mounted only from an isolated dev route
  (`src/app/dev/experience-3d-smoke-test/`) via `next/dynamic(...,
  { ssr: false })`, so the Three.js/R3F/Drei bundle never reaches any
  product route. No integration with `site-builder`, `design` or
  persistence — that is explicitly out of scope for this issue.

## Open decisions (not yet made)

- 3D asset storage/CDN.
- Config granularity (recommended: per section, mirroring
  `company_site_page_section_copies`) — pending confirmation.
- Playwright/E2E adoption for validating real 3D scenes (Vitest +
  jsdom has no WebGL context; only composition/import logic is
  unit-tested today, see `SmokeTestScene.test.tsx`).
- Whether/how `experience3dOpportunities`
  (`../site-planning/types.ts`) gets structured beyond free text.

## Depends on

- `src/lib`, `src/ui`

See [`src/README.md`](../../README.md) for dependency rules.
