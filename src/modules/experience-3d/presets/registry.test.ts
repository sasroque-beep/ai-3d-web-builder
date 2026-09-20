import { describe, expect, it } from "vitest";

import {
  createPresetRegistry,
  presetRegistry,
} from "@/modules/experience-3d/presets/registry";
import type { Experience3DPresetDefinition } from "@/modules/experience-3d/presets/types";

const FAKE_PRESET: Experience3DPresetDefinition = {
  key: "fake-preset",
  label: "Fake",
  parseConfig: (config) =>
    typeof config === "object" && config !== null && "value" in config
      ? { success: true, config: { value: "normalized" } }
      : { success: false, error: "value obrigatório" },
};

describe("preset registry", () => {
  it("ships hero-showcase in the default registry", () => {
    expect(presetRegistry.has("hero-showcase")).toBe(true);
    expect(presetRegistry.keys()).toEqual(["hero-showcase"]);
  });

  it("reports an unknown key as unregistered instead of throwing", () => {
    expect(presetRegistry.has("scroll-parallax")).toBe(false);
    expect(presetRegistry.parseConfig("scroll-parallax", { a: 1 })).toEqual({
      kind: "unregistered",
    });
  });

  it("does not resolve Object.prototype members as presets", () => {
    expect(presetRegistry.has("constructor")).toBe(false);
    expect(presetRegistry.has("__proto__")).toBe(false);
    expect(presetRegistry.parseConfig("toString", {})).toEqual({
      kind: "unregistered",
    });
  });

  it("returns the normalized config for a valid registered preset", () => {
    const outcome = presetRegistry.parseConfig("hero-showcase", {
      shape: "octahedron",
    });

    expect(outcome.kind).toBe("valid");
    if (outcome.kind === "valid") {
      expect(outcome.config.shape).toBe("octahedron");
      expect(outcome.config.particleCount).toBe(40);
    }
  });

  it("returns the preset's error for an invalid registered config", () => {
    const outcome = presetRegistry.parseConfig("hero-showcase", {
      shape: "cube",
    });

    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") expect(outcome.error).toContain("shape");
  });

  it("is extensible: a new definition works without touching the default registry", () => {
    const registry = createPresetRegistry([FAKE_PRESET]);

    expect(registry.parseConfig("fake-preset", { value: 1 })).toEqual({
      kind: "valid",
      config: { value: "normalized" },
    });
    expect(registry.parseConfig("fake-preset", {})).toEqual({
      kind: "invalid",
      error: "value obrigatório",
    });
    expect(presetRegistry.has("fake-preset")).toBe(false);
  });

  it("refuses two definitions with the same key", () => {
    expect(() => createPresetRegistry([FAKE_PRESET, FAKE_PRESET])).toThrow(
      /duplicado/,
    );
  });
});
