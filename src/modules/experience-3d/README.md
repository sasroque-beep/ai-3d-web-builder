# Experience 3D

> Status: **in progress** — technical foundation (Issue #24): React
> Three Fiber + Drei installed and validated with an isolated
> smoke-test scene. Architectural decisions governing every future
> Issue documented below (Issue #26). Capability detection and the
> `FULL_3D`/`REDUCED_3D`/`FALLBACK_2D` decision function implemented in
> `src/lib/capability` (Issue #28). No scene config contract,
> persistence or integration with `site-builder` yet.

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

## Implemented (Issue #28)

- `src/lib/capability/` — framework-agnostic, SSR-safe capability
  detection: `detectWebglSupport`, `detectPrefersReducedMotion`,
  `detectDeviceTier` (only ever asserts `"low"` on a technically
  reliable signal — a low core count or an explicit save-data/slow
  connection hint — never claims a device is capable, treating every
  other case as `"unknown"`), and the pure decision function
  `resolveExperienceMode`, which combines those signals (plus a
  reserved runtime-failure flag and a reserved performance-policy
  override) into one of `FULL_3D` / `REDUCED_3D` / `FALLBACK_2D`.
- No React/R3F/Drei/`experience-3d` import in this module — it lives
  entirely in `src/lib`, consumed later by whatever mounts the actual
  `<Canvas>` (a future `site-builder` integration issue).

## Confirmed architectural decisions (Issue #26)

These decisions are binding for every future Issue in this module
(capability detection, the scene config contract, persistence, the
first preset, `site-builder` integration, AI-assisted generation).
They exist so this module's design doesn't have to be re-derived from
conversation history in each new Issue.

- **Module isolation.** `experience-3d` stays fully self-contained.
  `site-builder` (and any other future consumer) may depend only on
  this module's *public config contract* — never on renderer internals
  (no importing R3F/Drei/Three.js types or components from outside
  this module). See "Belongs here"/"Does NOT belong here" above; this
  decision makes that boundary a hard rule, not just a convention.
- **Granularity.** The **section** is the primary unit a 3D experience
  attaches to (mirrors `company_site_page_section_copies`'s per-section
  content model). The data/API shape must not *foreclose* future
  page-level or company-level configuration or rules — e.g. avoid
  naming/typing the config contract in a way that only ever makes
  sense keyed by `section_id`. This module must **not** build a
  page/company abstraction now; only avoid choices that would make
  adding one later a breaking change.
- **3D is always progressive enhancement.** Content, CTA and the
  conversion journey must never depend on WebGL or on the 3D
  experience actually running. The server-rendered DOM content
  (already implemented in `site-builder`) is always the source of
  truth; 3D is layered on top of it, never a replacement for it.
- **Every experience must ship a working 2D fallback.** Not optional,
  not a placeholder image with no content — the fallback must carry
  the same information the 3D experience would have shown.
- **Capability detection must consider, at minimum:** WebGL support;
  `prefers-reduced-motion`; device characteristics *only when
  technically reliable* (don't over-trust flaky signals like
  `navigator.deviceMemory`); load/render **failure at runtime** (not
  just an upfront capability check — a context loss or render crash
  must also trigger the fallback); and room for future
  performance/account-level policies without redesigning the
  detection contract.
- **Runtime decision is a tri-state, not a boolean.** The system must
  eventually be able to resolve to one of `FULL_3D`, `REDUCED_3D` or
  `FALLBACK_2D` — capability detection and the rendering-decision
  contract should be shaped around this tri-state from the start, even
  before `REDUCED_3D` has distinct behavior, to avoid a
  boolean-to-enum breaking change later.
- **Performance and conversion outrank visual complexity.** This is
  the tie-breaker for every future preset/feature decision in this
  module — see `AGENTS.md` §11/§12.
- **3D asset storage/CDN is explicitly deferred**, not decided by
  omission. It needs its own dedicated architectural Issue before the
  first preset that depends on external assets (GLTF/GLB, textures).
- **Future AI behavior is opportunity-driven, not preset-driven.** A
  future AI agent must not simply "add 3D" to a page/section. It must
  identify *opportunities* for 3D grounded in diagnosis, strategy,
  site planning, page architecture, content and theme, and justify the
  *purpose* of the experience it proposes — mirroring how every other
  `generatedBy: "ai"` field in this project reserves automation without
  changing the human-authored contract it writes through.
- **Scene configuration is data-driven and validatable — never
  arbitrary generated code.** Whatever an AI agent (or a human, via
  the future editor) produces must be a validated config value
  (a closed preset key + a typed/validated parameter blob), never
  Three.js/JSX/arbitrary code stored or executed from data.
- **The editor must be able to edit 3D config without coupling to the
  renderer.** The future `site-builder` editing UX (mirroring the
  Issue #22 inline-edit pattern) talks to the same public config
  contract as the runtime consumer — never to R3F/Drei/Three.js
  directly.

## Still open (not yet decided)

- Concrete shape of the 3D asset storage/CDN (deferred above, not
  resolved).
- Playwright/E2E adoption for validating real 3D scenes (Vitest +
  jsdom has no WebGL context; only composition/import logic is
  unit-tested today, see `SmokeTestScene.test.tsx`).
- Whether/how `experience3dOpportunities`
  (`../site-planning/types.ts`) gets structured beyond free text.

## Depends on

- `src/lib`, `src/ui`

See [`src/README.md`](../../README.md) for dependency rules.
