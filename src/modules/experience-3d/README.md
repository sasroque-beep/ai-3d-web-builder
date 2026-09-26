# Experience 3D

> Status: **in progress** — technical foundation (Issue #24): React
> Three Fiber + Drei installed and validated with an isolated
> smoke-test scene. Architectural decisions governing every future
> Issue documented below (Issue #26). Capability detection and the
> `FULL_3D`/`REDUCED_3D`/`FALLBACK_2D` decision function implemented in
> `src/lib/capability` (Issue #28). The scene config data contract
> (`types.ts`/`validation.ts`/eligibility) is implemented (Issue #30).
> Persistence (table, repository, CRUD in `service.ts`) is implemented
> (Issue #33). The first real preset (`hero-showcase`, procedural) and
> the runtime that renders it with a working 2D fallback are implemented
> (Issue #37). Real-browser E2E coverage (Issue #41) found and Issue #42
> fixed a runtime bug. The site preview now renders a section's 3D
> experience read-only (Issue #45). No editing UI yet.

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

## Implemented (Issue #30)

- `types.ts` — `Experience3DSceneConfig`/`Experience3DSceneConfigInput`
  (config is inherently a JSON object, not a form-textarea string),
  `Experience3DFallback2D` (image + alt text, both required — no
  config value can exist without a working 2D fallback), and
  `Experience3DEligibility`.
- `validation.ts` — `validateExperience3DSceneConfigInput`: `presetKey`
  validated as a slug (no closed enum yet — no real preset exists to
  enumerate), `config` validated as a plain JSON-serializable object
  (rejects functions/class instances — never arbitrary code),
  `fallback2d.imageUrl`/`imageAlt` both required.
- `service.ts` — `checkExperience3DEligibility(section)`: a 3D
  experience can only be configured for a section that already exists
  in the page architecture, reusing `SitePageSectionRecord` from
  `../design/types` exactly like `../copy/service.ts`'s
  `checkSectionContentEligibility` does. This isn't a violation of this
  module's isolation decision (below) — that decision is about the
  renderer (R3F/Drei/Three.js) never leaking outward, not about
  importing the page-architecture section type for an eligibility
  check the same way every other section-scoped module already does.
- No persistence, no repository, no real preset, no integration with
  `site-builder` yet.

## Implemented (Issue #33)

- `src/server/db/schema.ts` — `company_site_page_section_experiences`:
  one optional row per section (unique index on `section_id`, upsert),
  same shape as `company_site_page_section_copies`. `config` uses
  Drizzle's `text(..., { mode: "json" })`, so domain code never touches
  the serialized string directly.
- `src/server/persistence/experience-3d-scene-config-repository.ts` —
  `upsert`/`getBySectionId`, structurally identical to
  `section-copy-repository.ts`.
- `service.ts` — `createExperience3DService`/`experience3DService`:
  `upsertSceneConfig` (eligibility → validation → persistence) and
  `getSceneConfig`, same shape as `copyService`.
- `docs/DATABASE.md` §11 documents the table.
- No `actions.ts`/server action and no UI yet — that's the manual
  editing Issue, once there's an actual form to wire one to.

## Implemented (Issue #37)

First real preset and the runtime that executes it. Everything renders
from the public `Experience3DSceneConfig` contract; the renderer stays
private to this module.

### Preset registry (renderer-free)

- `presets/types.ts` — `Experience3DPresetDefinition` (`key`, `label`,
  `parseConfig`) and the props every scene receives.
- `presets/registry.ts` — `createPresetRegistry(definitions)` and the
  default `presetRegistry`. **Not an enum**: `presetKey` is still a free
  slug (Issue #30). `parseConfig(key, config)` answers `unregistered`,
  `valid` (normalized, defaults applied) or `invalid` (with a message).
- `service.upsertSceneConfig` runs the preset's validation after the
  generic Issue #30 validation, and persists the **normalized** config.
  An **unregistered** `presetKey` is still accepted with any plain-JSON
  config — `validation.ts` is untouched and old data never becomes
  unreadable; at runtime such a section simply shows its 2D fallback.
- `hero-showcase` config (`presets/hero-showcase/config.ts`): `shape`
  (`icosahedron` | `torus-knot` | `octahedron`), `primaryColor` /
  `accentColor` (hex only — never a free CSS string), `motionIntensity`
  (0–1), `particleCount` (integer 0–120). Missing fields get defaults;
  unknown keys and out-of-range values are rejected.

**Adding a preset** = one definition in `presets/<key>/config.ts`
registered in `registry.ts`, one scene file `presets/<key>/<Name>Scene.tsx`
and one `dynamic()` entry in `presets/renderers.ts`. No change to
`validation.ts`, `service.ts` or `Experience3DView`.

### Runtime

- `useExperienceMode` — hydration-safe: until capabilities are detected
  in an effect the mode is always `FALLBACK_2D` (what the server
  rendered). Then `resolveExperienceMode` (Issue #28) decides. Reacts to
  `prefers-reduced-motion` changes. `reportRuntimeFailure` feeds
  `runtimeFailureReported`; `modeOverride` feeds the reserved
  `performancePolicyOverride`.
- `Experience3DView` — the component a future consumer mounts, given an
  `Experience3DSceneConfig`. The 2D fallback `<img>` (with its alt) is
  **always in the DOM** — server render, first client render, no WebGL,
  even while 3D runs — and the canvas is an `aria-hidden` layer on top,
  mounted only after detection and lazily loaded. It draws the visual
  layer only: content and CTAs live outside it, so nothing in the buying
  journey depends on WebGL.
- Falls back to 2D on: no WebGL, `webglcontextlost`, a scene render error
  or a failed lazy-chunk load (`Canvas3DErrorBoundary`), an invalid
  config, or an unregistered preset. None of these breaks the page.
- `REDUCED_3D` (reduced motion or a reliably low-end device) renders one
  static frame: `frameloop="demand"`, DPR 1, no particles, no float/spin.
  `FULL_3D` also drops to `demand` when `motionIntensity` is 0.
- `HeroShowcaseScene` — abstract shape + orbital ring + particles, lights
  only; no models, textures or HDR environment, so the scene makes no
  network request. Motion runs through `useFrame` (not React state);
  particle positions are deterministic.
- `isolation.test.ts` enforces the boundary as a test: only scene files
  import `three`/`@react-three/*`, nothing outside this module does, and
  nothing reachable by static imports from `Experience3DView`,
  `presets/registry.ts`, `service.ts` or `validation.ts` is a scene.
- Manual validation route: `/dev/experience-3d-hero-showcase` (mode and
  shape overrides). Like the Issue #24 smoke test, `/dev` routes are part
  of the production build. Manually checked against a production build in
  headless Edge: with WebGL the scene renders (`FULL_3D`); with WebGL
  disabled the 2D fallback shows; the server HTML has the `<img>` + alt,
  no `<canvas>` and no 3D chunk. **Not** checked in a real browser:
  animation, the mode/shape override buttons and `REDUCED_3D` visually —
  that gap was closed afterwards by the Playwright suite (Issue #41,
  see the note under "Still open").

### Bundle impact (measured, Issue #37)

Method: `next build` on `main` (`b5b5444`) vs. this branch; sizes are
**gzip bytes** of the JS the browser fetches, taken from
`app-build-manifest.json` (route first load) and
`react-loadable-manifest.json` (each `dynamic()` import's chunks). Next's
own "First Load JS" figures are rounded to 1 kB and shift by ±1 kB
between identical builds (e.g. `/leads/[id]/site-builder` printed 108 kB
on one `main` build and 109 kB on another), so exact bytes are used.

| Route | Before | After |
| --- | --- | --- |
| `/` | 142,732 | 142,542 |
| `/leads/[id]/site-builder` (largest product route) | 148,579 | 148,379 |
| `/leads/new` | 144,467 | 144,289 |
| `/dev/experience-3d-smoke-test` | 144,195 | 144,032 |
| `/dev/experience-3d-hero-showcase` (new) | — | 146,270 |

All 13 routes that don't render 3D moved by −175 to −200 bytes (no
increase); the shared First Load JS stays at Next's 103 kB. Three.js,
R3F and Drei are only in lazy chunks, loaded when the hero-showcase scene
is first mounted:

| Lazy payload | Raw | gzip |
| --- | --- | --- |
| Smoke test scene (before; includes Drei `OrbitControls`) | 932,564 | 246,976 |
| `hero-showcase` scene (after) | 919,762 | 243,630 |
| of which Three/R3F/Drei vendor chunks (unchanged) | 903,268 | 236,955 |
| of which preset-specific (scene + shared R3F helper) | 16,494 | 6,675 |

The route's own eager code (registry, hook, view, boundary, demo) is the
only thing added to a page that mounts the view: +2.2 kB gzip over the
smoke-test route. Drei's `Float` was kept after measuring: it lives in
the 1.5 kB-gzip scene chunk. The ≈ 244 kB-gzip lazy vendor payload is the
real cost of any 3D preset. Only `FALLBACK_2D` (no WebGL, failure, invalid
config) avoids it entirely — `REDUCED_3D` still mounts the scene, so it
saves GPU/CPU work, not download size.

## Implemented (Issue #45)

Read-only integration with `site-builder`'s preview — the first real
consumer outside this module and its `/dev` demo route.

- `site-builder`'s `SectionPreview` (its own public type, not this
  module's) now carries the section's `Experience3DSceneConfig | null`,
  fetched via `experience3DService.getSceneConfig` exactly like it
  already fetches section copy. `buildSitePreview` stays a pure
  composition function — no new persistence, no new eligibility rule.
- `SitePreviewViewer` mounts `Experience3DView` for a section that has a
  config, right under its heading — an additional visual layer, never in
  place of the section's content/CTA (Issue #26's progressive-enhancement
  decision applies to every consumer, not just the `/dev` demo).
- `site-builder` only imports `Experience3DView` (the public component)
  and this module's public types — never R3F/Drei/Three.js. Already
  enforced by this module's own `isolation.test.ts`, which scans all of
  `src/` (not just this module) for that boundary.
- No editing UI/server action for the 3D config yet — a future Issue,
  mirroring how `site-builder`'s inline content editing (Issue #22)
  followed its own read-only preview (Issue #20).

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
- Real-browser validation is now automated with Playwright (Issue #41):
  `e2e/experience-3d/` runs against the production build in Chromium (the
  only mandatory browser; Firefox/WebKit are declared in
  `playwright.config.ts` but not validated). See
  `docs/QUALITY_ASSURANCE.md` §9 for the tool justification, what is
  covered and how to run it. No pixel/screenshot regression by design.
  That suite found (and Issue #42 fixed) a runtime bug: R3F force-loses the
  WebGL context ~500 ms after a Canvas unmounts, and the scene took that for
  a real failure and latched `FALLBACK_2D`. The scene now listens for
  `webglcontextlost` only while mounted (`HeroShowcaseScene`), so a new
  preset's scene must do the same: **never register a context-loss listener
  that outlives the scene**.
- Whether/how `experience3dOpportunities`
  (`../site-planning/types.ts`) gets structured beyond free text.
- Closing `presetKey` into a fixed enum — still deferred. Issue #37 chose
  a registry with per-preset validation instead, keeping the key a free
  slug (Issue #30 contract); revisit only if a closed set becomes useful.
- The manual editing UI/server action (editing `config` through the
  preset's validation, from the `site-builder` preview) — next Issue.
  `site-builder` preview integration itself is done (Issue #45, above).
- Pausing/deferring the render loop while the hero is off-screen (lazy
  mount by visibility) — not done in Issue #37.

## Depends on

- `src/lib`, `src/ui`

See [`src/README.md`](../../README.md) for dependency rules.
