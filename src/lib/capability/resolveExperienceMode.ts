import type { CapabilitySnapshot, ExperienceRuntimeMode } from "./types";

/**
 * Pure decision function — no DOM access, fully testable with plain
 * objects. Order matters: an explicit policy override always wins, a
 * reported runtime failure or missing WebGL always forces the full
 * fallback, and only then do the softer signals (device tier, reduced
 * motion) apply, downgrading to REDUCED_3D rather than cutting 3D
 * entirely — performance/conversion outrank visual complexity, but a
 * lower-fidelity/static 3D experience is still preferable to none when
 * WebGL is actually available (AGENTS.md §11/§12).
 */
export function resolveExperienceMode(
  snapshot: CapabilitySnapshot,
): ExperienceRuntimeMode {
  if (snapshot.performancePolicyOverride) {
    return snapshot.performancePolicyOverride;
  }

  if (snapshot.runtimeFailureReported) return "FALLBACK_2D";
  if (!snapshot.webglSupported) return "FALLBACK_2D";

  if (snapshot.deviceTier === "low") return "REDUCED_3D";
  if (snapshot.prefersReducedMotion) return "REDUCED_3D";

  return "FULL_3D";
}
