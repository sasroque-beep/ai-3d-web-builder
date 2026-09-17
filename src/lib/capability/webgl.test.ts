// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { detectWebglSupport } from "./webgl";

describe("detectWebglSupport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when the canvas can't produce a WebGL context (jsdom default)", () => {
    expect(detectWebglSupport()).toBe(false);
  });

  it("returns true when a WebGL2 context is available", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (id: string) => (id === "webgl2" ? ({} as WebGL2RenderingContext) : null),
    );

    expect(detectWebglSupport()).toBe(true);
  });

  it("falls back to a WebGL1 context when WebGL2 is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (id: string) => (id === "webgl" ? ({} as WebGLRenderingContext) : null),
    );

    expect(detectWebglSupport()).toBe(true);
  });

  it("returns false instead of throwing when getContext itself throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => {
        throw new Error("context creation blocked");
      },
    );

    expect(detectWebglSupport()).toBe(false);
  });
});
