// @vitest-environment node
import { describe, expect, it } from "vitest";

import { detectPrefersReducedMotion } from "./motion";

describe("detectPrefersReducedMotion (no DOM)", () => {
  it("returns false instead of throwing when there is no window", () => {
    expect(detectPrefersReducedMotion()).toBe(false);
  });
});
