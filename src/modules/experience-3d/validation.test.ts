import { describe, expect, it } from "vitest";

import type { Experience3DSceneConfigInput } from "@/modules/experience-3d/types";
import { validateExperience3DSceneConfigInput } from "@/modules/experience-3d/validation";

function validInput(
  overrides: Partial<Experience3DSceneConfigInput> = {},
): Experience3DSceneConfigInput {
  return {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    config: { intensity: "standard" },
    fallback2d: {
      imageUrl: "https://cdn.example.com/fallback.png",
      imageAlt: "Ilustração do produto em destaque",
    },
    ...overrides,
  };
}

describe("validateExperience3DSceneConfigInput", () => {
  it("accepts a fully valid input, defaulting generatedBy to manual", () => {
    const result = validateExperience3DSceneConfigInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.presetKey).toBe("hero-showcase");
      expect(result.data.generatedBy).toBe("manual");
    }
  });

  it("respects an explicit generatedBy of 'ai'", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ generatedBy: "ai" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.generatedBy).toBe("ai");
    }
  });

  it("requires sectionId", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ sectionId: "" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.sectionId).toBeDefined();
    }
  });

  it("rejects a presetKey that isn't a valid slug", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ presetKey: "Hero Showcase!" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.presetKey).toBeDefined();
    }
  });

  it("requires a presetKey", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ presetKey: "  " }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.presetKey).toBeDefined();
    }
  });

  it("rejects a config that isn't a plain object", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ config: ["not", "an", "object"] }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.config).toBeDefined();
    }
  });

  it("rejects a config that isn't JSON-serializable (e.g. contains a function)", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ config: { onClick: () => {} } }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.config).toBeDefined();
    }
  });

  it("rejects a config with a function nested inside an object", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ config: { nested: { onClick: () => {} } } }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.config).toBeDefined();
    }
  });

  it("accepts an empty config object", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({ config: {} }),
    );

    expect(result.success).toBe(true);
  });

  it("requires fallback2d.imageUrl", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({
        fallback2d: { imageUrl: "", imageAlt: "Texto alternativo" },
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fallback2d).toBeDefined();
    }
  });

  it("requires fallback2d.imageAlt", () => {
    const result = validateExperience3DSceneConfigInput(
      validInput({
        fallback2d: {
          imageUrl: "https://cdn.example.com/fallback.png",
          imageAlt: "",
        },
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fallback2d).toBeDefined();
    }
  });
});
