"use client";

import { useMemo, useState } from "react";

import type { ExperienceRuntimeMode } from "@/lib/capability";
import { Canvas3DErrorBoundary } from "@/modules/experience-3d/Canvas3DErrorBoundary";
import { presetRegistry } from "@/modules/experience-3d/presets/registry";
import { getPresetRenderer } from "@/modules/experience-3d/presets/renderers";
import type { Experience3DSceneConfig } from "@/modules/experience-3d/types";
import { useExperienceMode } from "@/modules/experience-3d/useExperienceMode";

interface Experience3DViewProps {
  /** The public, persisted contract — never renderer types. */
  sceneConfig: Experience3DSceneConfig;
  /** Sizes the box (e.g. `aspect-video`); the 3D layer fills it. */
  className?: string;
  /** See `useExperienceMode` — a policy override or a manual demo control. */
  modeOverride?: ExperienceRuntimeMode | null;
}

/**
 * Visual layer only. It never wraps or replaces content or CTAs: those stay
 * in the server-rendered DOM around it, so nothing in the buying journey
 * depends on WebGL.
 *
 * The 2D fallback `<img>` is always in the DOM — on the server, on the
 * first client render, when 3D is unsupported, and even while 3D is
 * running (so assistive tech and crawlers always have the same content).
 * The 3D canvas is an `aria-hidden` layer mounted on top only after
 * capabilities are detected client-side, and it steps away again on any
 * runtime failure.
 */
export function Experience3DView({
  sceneConfig,
  className,
  modeOverride,
}: Experience3DViewProps) {
  const { mode, reportRuntimeFailure } = useExperienceMode({ modeOverride });
  const [readyPresetKey, setReadyPresetKey] = useState<string | null>(null);

  const presetKey = sceneConfig.presetKey;
  const outcome = useMemo(
    () => presetRegistry.parseConfig(presetKey, sceneConfig.config),
    [presetKey, sceneConfig.config],
  );

  const Scene = getPresetRenderer(presetKey);
  const sceneMode = mode === "FALLBACK_2D" ? null : mode;
  // Unknown preset, invalid config or no renderer all end at the 2D fallback.
  const canRenderScene =
    sceneMode !== null && outcome.kind === "valid" && Scene !== undefined;

  const showing3D = canRenderScene && readyPresetKey === presetKey;

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      data-experience-mode={showing3D ? mode : "FALLBACK_2D"}
    >
      {/* biome-ignore lint/performance/noImgElement: fallback URLs are operator-provided and may be external; next/image needs a fixed remotePatterns allowlist */}
      <img
        src={sceneConfig.fallback2d.imageUrl}
        alt={sceneConfig.fallback2d.imageAlt}
        className={`h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
          showing3D ? "opacity-0" : "opacity-100"
        }`}
      />

      {canRenderScene ? (
        <div aria-hidden="true" className="absolute inset-0">
          <Canvas3DErrorBoundary onError={reportRuntimeFailure}>
            <Scene
              key={presetKey}
              config={outcome.config}
              mode={sceneMode}
              onReady={() => setReadyPresetKey(presetKey)}
              onRuntimeFailure={reportRuntimeFailure}
            />
          </Canvas3DErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
