import type {
  Experience3DSceneConfig,
  Experience3DSceneConfigFieldErrors,
  Experience3DSceneConfigInput,
} from "@/modules/experience-3d/types";

const PRESET_KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type Experience3DSceneConfigValidationResult =
  | { success: true; data: Experience3DSceneConfig }
  | { success: false; errors: Experience3DSceneConfigFieldErrors };

/**
 * `JSON.stringify` silently *drops* function/symbol/undefined values
 * instead of throwing, so a round-trip through it can't detect them — this
 * walks the value directly instead, rejecting anything that isn't a JSON
 * primitive, array or plain object at every level.
 */
function isJsonSerializableValue(value: unknown): boolean {
  if (value === null) return true;

  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonSerializableValue);
  }

  if (type === "object") {
    return Object.values(value as Record<string, unknown>).every(
      isJsonSerializableValue,
    );
  }

  return false;
}

/**
 * The scene config must always be plain, JSON-serializable data — never
 * arbitrary code (functions, class instances) — since a future AI agent
 * or editor writes through this same validator (confirmed decision: scene
 * config is data-driven and validatable, never generated code).
 */
function isPlainJsonSerializableObject(
  value: unknown,
): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return isJsonSerializableValue(value);
}

export function validateExperience3DSceneConfigInput(
  input: Experience3DSceneConfigInput,
): Experience3DSceneConfigValidationResult {
  const errors: Experience3DSceneConfigFieldErrors = {};

  const sectionId = input.sectionId.trim();
  if (!sectionId) {
    errors.sectionId = "Seção não informada.";
  }

  const presetKey = input.presetKey.trim().toLowerCase();
  if (!presetKey) {
    errors.presetKey = "Selecione um tipo de experiência 3D.";
  } else if (!PRESET_KEY_PATTERN.test(presetKey)) {
    errors.presetKey =
      "Identificador de preset inválido (use letras minúsculas, números e hífens).";
  }

  if (!isPlainJsonSerializableObject(input.config)) {
    errors.config =
      "Configuração da cena inválida — deve ser um objeto de dados serializável.";
  }

  const imageUrl = input.fallback2d.imageUrl.trim();
  const imageAlt = input.fallback2d.imageAlt.trim();
  if (!imageUrl || !imageAlt) {
    errors.fallback2d =
      "Toda experiência 3D precisa de uma imagem de fallback com texto alternativo.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      sectionId,
      presetKey,
      config: input.config as Record<string, unknown>,
      fallback2d: { imageUrl, imageAlt },
      generatedBy: input.generatedBy ?? "manual",
    },
  };
}
