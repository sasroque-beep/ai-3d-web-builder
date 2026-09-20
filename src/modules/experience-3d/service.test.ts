import { describe, expect, it } from "vitest";

import type { SitePageSectionRecord } from "@/modules/design/types";
import { createPresetRegistry } from "@/modules/experience-3d/presets/registry";
import {
  checkExperience3DEligibility,
  createExperience3DService,
} from "@/modules/experience-3d/service";
import type { Experience3DSceneConfigInput } from "@/modules/experience-3d/types";
import type {
  CompanySitePageSectionExperience,
  Experience3DSceneConfigRepository,
  UpsertCompanySitePageSectionExperience,
} from "@/server/persistence/experience-3d-scene-config-repository";

const SECTION: SitePageSectionRecord = {
  id: "section-1",
  pageId: "page-1",
  sectionKey: "hero",
  name: "Hero",
  objective: "Apresentar a empresa",
  ctaReference: null,
  position: 1,
  generatedBy: "manual",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function createFakeRepository(): Experience3DSceneConfigRepository {
  const rows = new Map<string, CompanySitePageSectionExperience>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanySitePageSectionExperience) {
      const existing = rows.get(input.sectionId);
      const row: CompanySitePageSectionExperience = {
        ...input,
        id: existing?.id ?? `experience-${nextId++}`,
        createdAt: existing?.createdAt ?? "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      rows.set(input.sectionId, row);
      return row;
    },
    async getBySectionId(sectionId: string) {
      return rows.get(sectionId);
    },
  };
}

function validInput(
  overrides: Partial<Experience3DSceneConfigInput> = {},
): Experience3DSceneConfigInput {
  return {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    config: { motionIntensity: 0.5 },
    fallback2d: {
      imageUrl: "https://cdn.example.com/fallback.png",
      imageAlt: "Ilustração do produto em destaque",
    },
    ...overrides,
  };
}

describe("checkExperience3DEligibility", () => {
  it("is eligible when the section exists", () => {
    expect(checkExperience3DEligibility(SECTION)).toEqual({ eligible: true });
  });

  it("is not eligible when the section doesn't exist", () => {
    const result = checkExperience3DEligibility(undefined);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("experience-3d service", () => {
  it("refuses to create a scene config when the section doesn't exist", async () => {
    const service = createExperience3DService(createFakeRepository());

    const result = await service.upsertSceneConfig(validInput(), undefined);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("rejects invalid input without touching the repository", async () => {
    const service = createExperience3DService(createFakeRepository());

    const result = await service.upsertSceneConfig(
      validInput({ presetKey: "" }),
      SECTION,
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.presetKey).toBeDefined();
    }
  });

  it("creates a scene config from valid input for an existing section", async () => {
    const service = createExperience3DService(createFakeRepository());

    const result = await service.upsertSceneConfig(validInput(), SECTION);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.presetKey).toBe("hero-showcase");
      expect(result.data.generatedBy).toBe("manual");
    }
  });

  it("updates the same scene config instead of duplicating it", async () => {
    const repository = createFakeRepository();
    const service = createExperience3DService(repository);

    const first = await service.upsertSceneConfig(validInput(), SECTION);
    const second = await service.upsertSceneConfig(
      validInput({ presetKey: "scroll-parallax" }),
      SECTION,
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.sectionId).toBe(first.data.sectionId);
    expect(second.data.presetKey).toBe("scroll-parallax");
  });

  it("returns undefined when the section has no scene config yet", async () => {
    const service = createExperience3DService(createFakeRepository());

    const config = await service.getSceneConfig("section-1");

    expect(config).toBeUndefined();
  });
});

describe("experience-3d service — per-preset config validation (Issue #37)", () => {
  it("rejects an invalid config for a registered preset, without persisting", async () => {
    const repository = createFakeRepository();
    const service = createExperience3DService(repository);

    const result = await service.upsertSceneConfig(
      validInput({ config: { shape: "cube", unknown: true } }),
      SECTION,
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.config).toContain("shape");
    }
    expect(await service.getSceneConfig("section-1")).toBeUndefined();
  });

  it("persists the normalized config (defaults applied) for a registered preset", async () => {
    const service = createExperience3DService(createFakeRepository());

    const result = await service.upsertSceneConfig(
      validInput({ config: { shape: "torus-knot", accentColor: "#FF00AA" } }),
      SECTION,
    );

    if (!result.success) throw new Error("expected the upsert to succeed");
    expect(result.data.config).toEqual({
      shape: "torus-knot",
      primaryColor: "#6d5efc",
      accentColor: "#ff00aa",
      motionIntensity: 0.5,
      particleCount: 40,
    });
  });

  it("still accepts an unregistered preset with any plain config (Issue #30 compat)", async () => {
    const service = createExperience3DService(createFakeRepository());

    const result = await service.upsertSceneConfig(
      validInput({
        presetKey: "scroll-parallax",
        config: { anything: ["goes", 1, true] },
      }),
      SECTION,
    );

    if (!result.success) throw new Error("expected the upsert to succeed");
    expect(result.data.config).toEqual({ anything: ["goes", 1, true] });
  });

  it("uses the injected registry, so a new preset needs no change to validation", async () => {
    const registry = createPresetRegistry([
      {
        key: "custom-preset",
        label: "Custom",
        parseConfig: (config) =>
          typeof config === "object" && config !== null && "ok" in config
            ? { success: true, config: { ok: true } }
            : { success: false, error: "faltou o campo ok" },
      },
    ]);
    const service = createExperience3DService(createFakeRepository(), registry);

    const rejected = await service.upsertSceneConfig(
      validInput({ presetKey: "custom-preset", config: {} }),
      SECTION,
    );
    const accepted = await service.upsertSceneConfig(
      validInput({ presetKey: "custom-preset", config: { ok: 1 } }),
      SECTION,
    );

    expect(rejected.success).toBe(false);
    if (!accepted.success) throw new Error("expected the upsert to succeed");
    expect(accepted.data.config).toEqual({ ok: true });
  });
});
