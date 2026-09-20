import { describe, expect, it } from "vitest";

import {
  HERO_SHOWCASE_DEFAULTS,
  HERO_SHOWCASE_MAX_PARTICLES,
  HERO_SHOWCASE_PRESET_KEY,
  heroShowcasePreset,
} from "@/modules/experience-3d/presets/hero-showcase/config";

function parse(input: unknown) {
  return heroShowcasePreset.parseConfig(input);
}

function expectError(input: unknown, fragment: string) {
  const result = parse(input);
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error).toContain(fragment);
}

describe("hero-showcase preset config", () => {
  it("is registered under the hero-showcase key", () => {
    expect(heroShowcasePreset.key).toBe(HERO_SHOWCASE_PRESET_KEY);
    expect(HERO_SHOWCASE_PRESET_KEY).toBe("hero-showcase");
  });

  it("fills every default for an empty config", () => {
    const result = parse({});

    expect(result).toEqual({ success: true, config: HERO_SHOWCASE_DEFAULTS });
  });

  it("does not mutate the shared defaults", () => {
    const result = parse({ shape: "octahedron", particleCount: 0 });

    expect(result.success).toBe(true);
    expect(HERO_SHOWCASE_DEFAULTS.shape).toBe("icosahedron");
    expect(HERO_SHOWCASE_DEFAULTS.particleCount).toBe(40);
  });

  it("accepts a full valid config and lowercases hex colors", () => {
    const result = parse({
      shape: "torus-knot",
      primaryColor: "#ABC",
      accentColor: "#00FF88",
      motionIntensity: 1,
      particleCount: HERO_SHOWCASE_MAX_PARTICLES,
    });

    expect(result).toEqual({
      success: true,
      config: {
        shape: "torus-knot",
        primaryColor: "#abc",
        accentColor: "#00ff88",
        motionIntensity: 1,
        particleCount: HERO_SHOWCASE_MAX_PARTICLES,
      },
    });
  });

  it("accepts the boundary values 0 for intensity and particles", () => {
    const result = parse({ motionIntensity: 0, particleCount: 0 });

    expect(result.success).toBe(true);
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["a string", "hero"],
    ["a number", 3],
    ["undefined", undefined],
  ])("rejects %s as the whole config", (_label, input) => {
    expectError(input, "objeto");
  });

  it("rejects an unknown shape", () => {
    expectError({ shape: "cube" }, "shape");
  });

  it("rejects unknown keys instead of silently ignoring them", () => {
    expectError({ scale: 2 }, "scale");
  });

  it.each([
    "red",
    "#12",
    "#12345",
    "#gggggg",
    "rgb(0,0,0)",
    "url(javascript:alert(1))",
    "#ffffff; background: red",
    "",
    123,
    null,
  ])("rejects %j as a color", (color) => {
    expectError({ primaryColor: color }, "primaryColor");
    expectError({ accentColor: color }, "accentColor");
  });

  it.each([-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY, "0.5", null])(
    "rejects %j as motionIntensity",
    (value) => {
      expectError({ motionIntensity: value }, "motionIntensity");
    },
  );

  it.each([-1, HERO_SHOWCASE_MAX_PARTICLES + 1, 1.5, Number.NaN, "10", null])(
    "rejects %j as particleCount",
    (value) => {
      expectError({ particleCount: value }, "particleCount");
    },
  );

  it("reports every invalid field at once", () => {
    const result = parse({ shape: "cube", motionIntensity: 5 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("shape");
      expect(result.error).toContain("motionIntensity");
    }
  });
});
