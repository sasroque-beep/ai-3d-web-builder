"use server";

import { revalidatePath } from "next/cache";

import { designService } from "@/modules/design/service";
import { HERO_SHOWCASE_PRESET_KEY } from "@/modules/experience-3d/presets/hero-showcase/config";
import { experience3DService } from "@/modules/experience-3d/service";
import type {
  Experience3DSceneConfigFormInput,
  Experience3DSceneConfigInput,
  UpsertExperience3DSceneConfigActionState,
} from "@/modules/experience-3d/types";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormInput(formData: FormData): Experience3DSceneConfigFormInput {
  return {
    sectionId: readFormValue(formData, "sectionId"),
    // Fixed today — only one preset is registered (Issue #37). A preset
    // picker is future work, once a second preset exists to choose from.
    presetKey: readFormValue(formData, "presetKey") || HERO_SHOWCASE_PRESET_KEY,
    shape: readFormValue(formData, "shape"),
    primaryColor: readFormValue(formData, "primaryColor"),
    accentColor: readFormValue(formData, "accentColor"),
    motionIntensity: readFormValue(formData, "motionIntensity"),
    particleCount: readFormValue(formData, "particleCount"),
    fallback2dImageUrl: readFormValue(formData, "fallback2dImageUrl"),
    fallback2dImageAlt: readFormValue(formData, "fallback2dImageAlt"),
  };
}

/**
 * `parseHeroShowcaseConfig` (Issue #37) rejects non-number values, so the
 * numeric coercion happens here. An empty field (cleared, or text the
 * browser's number input could not parse) is left out instead of becoming
 * `Number("") === 0`, so the preset applies its own default rather than
 * silently persisting a static scene / zero particles.
 */
function toOptionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

/**
 * Coerces the raw form strings into the shape `experience3DService.
 * upsertSceneConfig` expects; out-of-range or non-numeric text is still
 * judged (and rejected) by the preset validator.
 */
function toSceneConfigInput(
  form: Experience3DSceneConfigFormInput,
): Experience3DSceneConfigInput {
  const motionIntensity = toOptionalNumber(form.motionIntensity);
  const particleCount = toOptionalNumber(form.particleCount);
  return {
    sectionId: form.sectionId,
    presetKey: form.presetKey,
    config: {
      shape: form.shape,
      primaryColor: form.primaryColor,
      accentColor: form.accentColor,
      ...(motionIntensity === undefined ? {} : { motionIntensity }),
      ...(particleCount === undefined ? {} : { particleCount }),
    },
    fallback2d: {
      imageUrl: form.fallback2dImageUrl,
      imageAlt: form.fallback2dImageAlt,
    },
  };
}

export async function upsertExperience3DSceneConfigAction(
  _prevState: UpsertExperience3DSceneConfigActionState,
  formData: FormData,
): Promise<UpsertExperience3DSceneConfigActionState> {
  const form = parseFormInput(formData);
  const section = await designService.getSectionById(form.sectionId);
  const result = await experience3DService.upsertSceneConfig(
    toSceneConfigInput(form),
    section,
  );

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason, values: form };
    }
    return { status: "error", errors: result.errors, values: form };
  }

  if (section) {
    const page = await designService.getPageById(section.pageId);
    if (page) {
      revalidatePath(`/leads/${page.companyId}/site-builder`);
    }
  }
  return { status: "idle" };
}
