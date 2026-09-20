import type { SitePageSectionRecord } from "@/modules/design/types";
import type { PresetRegistry } from "@/modules/experience-3d/presets/registry";
import { presetRegistry } from "@/modules/experience-3d/presets/registry";
import type {
  Experience3DEligibility,
  Experience3DSceneConfig,
  Experience3DSceneConfigFieldErrors,
  Experience3DSceneConfigInput,
} from "@/modules/experience-3d/types";
import { validateExperience3DSceneConfigInput } from "@/modules/experience-3d/validation";
import type {
  CompanySitePageSectionExperience,
  Experience3DSceneConfigRepository,
} from "@/server/persistence/experience-3d-scene-config-repository";
import { experience3DSceneConfigRepository } from "@/server/persistence/experience-3d-scene-config-repository";

/**
 * A 3D experience only makes sense for a section that already exists in
 * the page architecture — same rule and return shape as copy's
 * `checkSectionContentEligibility`, reusing `SitePageSectionRecord`
 * exactly as that module does. This isn't a violation of experience-3d's
 * module isolation: that decision is about the renderer (R3F/Drei/
 * Three.js) never leaking into other modules, not about the section
 * type from the page architecture.
 */
export function checkExperience3DEligibility(
  section: SitePageSectionRecord | undefined,
): Experience3DEligibility {
  if (!section) {
    return {
      eligible: false,
      reason:
        "A seção precisa existir na arquitetura de páginas antes de configurar uma experiência 3D.",
    };
  }

  return { eligible: true };
}

export type UpsertExperience3DSceneConfigResult =
  | { success: true; data: Experience3DSceneConfig }
  | { success: false; errors: Experience3DSceneConfigFieldErrors }
  | { success: false; ineligible: true; reason: string };

function toExperience3DSceneConfig(
  row: CompanySitePageSectionExperience,
): Experience3DSceneConfig {
  return {
    sectionId: row.sectionId,
    presetKey: row.presetKey,
    config: row.config,
    fallback2d: {
      imageUrl: row.fallback2dImageUrl,
      imageAlt: row.fallback2dImageAlt,
    },
    generatedBy: row.generatedBy,
  };
}

export function createExperience3DService(
  repository: Experience3DSceneConfigRepository = experience3DSceneConfigRepository,
  presets: PresetRegistry = presetRegistry,
) {
  return {
    async upsertSceneConfig(
      input: Experience3DSceneConfigInput,
      section: SitePageSectionRecord | undefined,
    ): Promise<UpsertExperience3DSceneConfigResult> {
      const eligibility = checkExperience3DEligibility(section);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateExperience3DSceneConfigInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      // Registered presets validate (and normalize, filling defaults) their
      // own config; an unregistered key stays accepted, exactly as the
      // Issue #30 contract always allowed — the runtime falls back to 2D.
      const presetOutcome = presets.parseConfig(
        validation.data.presetKey,
        validation.data.config,
      );
      if (presetOutcome.kind === "invalid") {
        return { success: false, errors: { config: presetOutcome.error } };
      }
      const config =
        presetOutcome.kind === "valid"
          ? presetOutcome.config
          : validation.data.config;

      const saved = await repository.upsert({
        sectionId: validation.data.sectionId,
        presetKey: validation.data.presetKey,
        config,
        fallback2dImageUrl: validation.data.fallback2d.imageUrl,
        fallback2dImageAlt: validation.data.fallback2d.imageAlt,
        generatedBy: validation.data.generatedBy,
      });

      return { success: true, data: toExperience3DSceneConfig(saved) };
    },

    async getSceneConfig(
      sectionId: string,
    ): Promise<Experience3DSceneConfig | undefined> {
      const row = await repository.getBySectionId(sectionId);
      return row ? toExperience3DSceneConfig(row) : undefined;
    },
  };
}

export const experience3DService = createExperience3DService();
