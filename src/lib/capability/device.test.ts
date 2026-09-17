// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { detectDeviceTier } from "./device";

describe("detectDeviceTier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 'unknown' when no device signal is available (jsdom default)", () => {
    expect(detectDeviceTier()).toBe("unknown");
  });

  it("returns 'low' when hardwareConcurrency is at or below the threshold", () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 2 });

    expect(detectDeviceTier()).toBe("low");
  });

  it("returns 'unknown' when hardwareConcurrency is comfortably high", () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 8 });

    expect(detectDeviceTier()).toBe("unknown");
  });

  it("returns 'low' when the connection reports saveData", () => {
    vi.stubGlobal("navigator", { connection: { saveData: true } });

    expect(detectDeviceTier()).toBe("low");
  });

  it("returns 'low' when the connection is a slow effective type", () => {
    vi.stubGlobal("navigator", { connection: { effectiveType: "2g" } });

    expect(detectDeviceTier()).toBe("low");
  });

  it("returns 'unknown' when the connection is a fast effective type", () => {
    vi.stubGlobal("navigator", { connection: { effectiveType: "4g" } });

    expect(detectDeviceTier()).toBe("unknown");
  });
});
