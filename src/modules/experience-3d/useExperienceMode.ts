"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  CapabilitySnapshot,
  ExperienceRuntimeMode,
} from "@/lib/capability";
import {
  detectDeviceTier,
  detectPrefersReducedMotion,
  detectWebglSupport,
  resolveExperienceMode,
} from "@/lib/capability";

type DetectedCapabilities = Pick<
  CapabilitySnapshot,
  "webglSupported" | "prefersReducedMotion" | "deviceTier"
>;

export interface UseExperienceModeOptions {
  /**
   * Reserved account/performance-policy override (Issue #28), passed
   * straight to `resolveExperienceMode`. Also what the dev demo uses to
   * force a mode for manual validation.
   */
  modeOverride?: ExperienceRuntimeMode | null;
}

export interface UseExperienceModeResult {
  mode: ExperienceRuntimeMode;
  /** False until capabilities were actually detected on the client. */
  resolved: boolean;
  /** Called on context loss or a render/load crash — forces `FALLBACK_2D`. */
  reportRuntimeFailure: () => void;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Hydration-safe: until capabilities are detected in an effect, the mode is
 * always `FALLBACK_2D` — exactly what the server rendered — so 3D can only
 * ever appear as an enhancement after mount, never as a hydration mismatch.
 */
export function useExperienceMode({
  modeOverride = null,
}: UseExperienceModeOptions = {}): UseExperienceModeResult {
  const [capabilities, setCapabilities] = useState<DetectedCapabilities | null>(
    null,
  );
  const [runtimeFailureReported, setRuntimeFailureReported] = useState(false);

  useEffect(() => {
    setCapabilities({
      webglSupported: detectWebglSupport(),
      prefersReducedMotion: detectPrefersReducedMotion(),
      deviceTier: detectDeviceTier(),
    });

    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => {
      setCapabilities((current) =>
        current
          ? { ...current, prefersReducedMotion: detectPrefersReducedMotion() }
          : current,
      );
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const reportRuntimeFailure = useCallback(() => {
    setRuntimeFailureReported(true);
  }, []);

  if (!capabilities) {
    return { mode: "FALLBACK_2D", resolved: false, reportRuntimeFailure };
  }

  return {
    mode: resolveExperienceMode({
      ...capabilities,
      runtimeFailureReported,
      performancePolicyOverride: modeOverride,
    }),
    resolved: true,
    reportRuntimeFailure,
  };
}
