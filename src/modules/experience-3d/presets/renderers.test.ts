import { describe, expect, it } from "vitest";

import { getPresetRenderer } from "@/modules/experience-3d/presets/renderers";

describe("presets/renderers", () => {
  it("has a renderer for the registered hero-showcase preset", () => {
    expect(getPresetRenderer("hero-showcase")).toBeDefined();
  });

  it("has no renderer for an unknown preset", () => {
    expect(getPresetRenderer("scroll-parallax")).toBeUndefined();
  });

  it("does not resolve Object.prototype members as renderers", () => {
    expect(getPresetRenderer("constructor")).toBeUndefined();
    expect(getPresetRenderer("toString")).toBeUndefined();
    expect(getPresetRenderer("__proto__")).toBeUndefined();
  });
});
