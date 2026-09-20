"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { Experience3DSceneProps } from "@/modules/experience-3d/presets/types";

/**
 * The only place scene components are referenced from non-renderer code,
 * and only through `dynamic(..., { ssr: false })` — one lazy chunk per
 * preset, so Three.js/R3F/Drei never reach a route that doesn't render a
 * 3D experience. The scene files themselves are the only ones allowed to
 * import the renderer (enforced by `isolation.test.ts`).
 *
 * `loading` is `null` on purpose: the 2D fallback is already on screen
 * while the chunk loads.
 */
const HeroShowcaseScene = dynamic(
  () =>
    import(
      "@/modules/experience-3d/presets/hero-showcase/HeroShowcaseScene"
    ).then((mod) => mod.HeroShowcaseScene),
  { ssr: false, loading: () => null },
);

/**
 * `Experience3DView` only ever hands a scene the config its own preset's
 * `parseConfig` produced, so widening each scene's props to the generic
 * shape here is safe.
 */
type AnyScene = ComponentType<Experience3DSceneProps>;

const PRESET_RENDERERS: Record<string, AnyScene> = {
  "hero-showcase": HeroShowcaseScene as unknown as AnyScene,
};

export function getPresetRenderer(presetKey: string): AnyScene | undefined {
  return Object.hasOwn(PRESET_RENDERERS, presetKey)
    ? PRESET_RENDERERS[presetKey]
    : undefined;
}
