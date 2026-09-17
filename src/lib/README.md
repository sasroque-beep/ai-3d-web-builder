# `lib/` — Pure Utilities

Framework-agnostic, side-effect-free helpers. No imports from any other
`src/` folder; no React, no Next.js, no I/O.

| Path | Purpose |
| --- | --- |
| `text/` | String helpers (e.g. `slugify`). |
| `capability/` | Device/runtime capability detection for the 3D experience (WebGL support, `prefers-reduced-motion`, device tier) and `resolveExperienceMode`, the pure function that turns those signals into one of `FULL_3D` / `REDUCED_3D` / `FALLBACK_2D` (see `../modules/experience-3d/README.md`). |

Everything here is unit-tested (`*.test.ts` next to the source).
