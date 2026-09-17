import { describe, expect, it } from "vitest";

import { resolveExperienceMode } from "./resolveExperienceMode";
import type { CapabilitySnapshot } from "./types";

const BASE_SNAPSHOT: CapabilitySnapshot = {
  webglSupported: true,
  prefersReducedMotion: false,
  deviceTier: "unknown",
  runtimeFailureReported: false,
  performancePolicyOverride: null,
};

describe("resolveExperienceMode", () => {
  it("returns FULL_3D when every signal is favorable", () => {
    expect(resolveExperienceMode(BASE_SNAPSHOT)).toBe("FULL_3D");
  });

  it("returns FALLBACK_2D when WebGL is unsupported", () => {
    expect(
      resolveExperienceMode({ ...BASE_SNAPSHOT, webglSupported: false }),
    ).toBe("FALLBACK_2D");
  });

  it("returns FALLBACK_2D when a runtime failure was reported, even with WebGL support", () => {
    expect(
      resolveExperienceMode({
        ...BASE_SNAPSHOT,
        runtimeFailureReported: true,
      }),
    ).toBe("FALLBACK_2D");
  });

  it("returns REDUCED_3D on a low device tier, not FALLBACK_2D", () => {
    expect(resolveExperienceMode({ ...BASE_SNAPSHOT, deviceTier: "low" })).toBe(
      "REDUCED_3D",
    );
  });

  it("returns REDUCED_3D when the user prefers reduced motion", () => {
    expect(
      resolveExperienceMode({ ...BASE_SNAPSHOT, prefersReducedMotion: true }),
    ).toBe("REDUCED_3D");
  });

  it("never returns FULL_3D when a runtime failure was reported, regardless of other signals", () => {
    expect(
      resolveExperienceMode({
        ...BASE_SNAPSHOT,
        runtimeFailureReported: true,
        deviceTier: "unknown",
        prefersReducedMotion: false,
      }),
    ).not.toBe("FULL_3D");
  });

  it("lets an explicit performance policy override win over every other signal", () => {
    expect(
      resolveExperienceMode({
        ...BASE_SNAPSHOT,
        webglSupported: false,
        performancePolicyOverride: "FULL_3D",
      }),
    ).toBe("FULL_3D");
  });
});
