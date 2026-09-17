export const EXPERIENCE_RUNTIME_MODES = [
  "FULL_3D",
  "REDUCED_3D",
  "FALLBACK_2D",
] as const;

/**
 * Tri-state runtime decision for a 3D experience — never a boolean, so a
 * future "reduced" behavior (lower fidelity, no camera drift) doesn't
 * require a breaking change later.
 */
export type ExperienceRuntimeMode = (typeof EXPERIENCE_RUNTIME_MODES)[number];

/**
 * Deliberately has no "high" value: this module only ever asserts a
 * device is "low" when a technically reliable signal says so (e.g. a
 * low core count or a slow/save-data connection). Absence or
 * inconsistency of those signals is "unknown", never treated as
 * confirmation of capable hardware.
 */
export type DeviceSignal = "low" | "unknown";

export interface CapabilitySnapshot {
  webglSupported: boolean;
  prefersReducedMotion: boolean;
  deviceTier: DeviceSignal;
  /** Set by the future Canvas error boundary/context-loss handler. */
  runtimeFailureReported: boolean;
  /** Reserved for a future account/server-level performance policy. */
  performancePolicyOverride: ExperienceRuntimeMode | null;
}
