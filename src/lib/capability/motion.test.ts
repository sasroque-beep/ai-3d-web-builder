// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { detectPrefersReducedMotion } from "./motion";

describe("detectPrefersReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true when the media query matches", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));

    expect(detectPrefersReducedMotion()).toBe(true);
  });

  it("returns false when the media query doesn't match", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));

    expect(detectPrefersReducedMotion()).toBe(false);
  });

  it("returns false instead of throwing when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);

    expect(detectPrefersReducedMotion()).toBe(false);
  });
});
