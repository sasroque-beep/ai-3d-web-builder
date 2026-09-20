import type {
  Experience3DPresetDefinition,
  PresetConfigParseResult,
} from "@/modules/experience-3d/presets/types";

export const HERO_SHOWCASE_PRESET_KEY = "hero-showcase";

export const HERO_SHOWCASE_SHAPES = [
  "icosahedron",
  "torus-knot",
  "octahedron",
] as const;

export type HeroShowcaseShape = (typeof HERO_SHOWCASE_SHAPES)[number];

export const HERO_SHOWCASE_MAX_PARTICLES = 120;

export type HeroShowcaseConfig = {
  shape: HeroShowcaseShape;
  primaryColor: string;
  accentColor: string;
  /** 0 (static) to 1 (most lively). */
  motionIntensity: number;
  particleCount: number;
};

export const HERO_SHOWCASE_DEFAULTS: HeroShowcaseConfig = {
  shape: "icosahedron",
  primaryColor: "#6d5efc",
  accentColor: "#22d3ee",
  motionIntensity: 0.5,
  particleCount: 40,
};

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const KNOWN_KEYS = new Set<string>(Object.keys(HERO_SHOWCASE_DEFAULTS));

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Colors are restricted to hex on purpose: the value ends up in the scene
 * (and may be written by an AI agent), so it must never be a free-form CSS
 * string.
 */
function parseHexColor(value: unknown, field: string, errors: string[]) {
  if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value)) {
    errors.push(`${field} deve ser uma cor hexadecimal (ex.: #6d5efc)`);
    return undefined;
  }
  return value.toLowerCase();
}

function parseHeroShowcaseConfig(
  input: unknown,
): PresetConfigParseResult<HeroShowcaseConfig> {
  if (!isPlainObject(input)) {
    return {
      success: false,
      error: "A configuração do Hero Showcase deve ser um objeto.",
    };
  }

  const errors: string[] = [];
  const config: HeroShowcaseConfig = { ...HERO_SHOWCASE_DEFAULTS };

  for (const key of Object.keys(input)) {
    if (!KNOWN_KEYS.has(key)) errors.push(`${key} não é um campo válido`);
  }

  if (input.shape !== undefined) {
    if (!HERO_SHOWCASE_SHAPES.includes(input.shape as HeroShowcaseShape)) {
      errors.push(`shape deve ser um de: ${HERO_SHOWCASE_SHAPES.join(", ")}`);
    } else {
      config.shape = input.shape as HeroShowcaseShape;
    }
  }

  if (input.primaryColor !== undefined) {
    config.primaryColor =
      parseHexColor(input.primaryColor, "primaryColor", errors) ??
      config.primaryColor;
  }

  if (input.accentColor !== undefined) {
    config.accentColor =
      parseHexColor(input.accentColor, "accentColor", errors) ??
      config.accentColor;
  }

  if (input.motionIntensity !== undefined) {
    const value = input.motionIntensity;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push("motionIntensity deve ser um número entre 0 e 1");
    } else if (value < 0 || value > 1) {
      errors.push("motionIntensity deve estar entre 0 e 1");
    } else {
      config.motionIntensity = value;
    }
  }

  if (input.particleCount !== undefined) {
    const value = input.particleCount;
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > HERO_SHOWCASE_MAX_PARTICLES
    ) {
      errors.push(
        `particleCount deve ser um inteiro entre 0 e ${HERO_SHOWCASE_MAX_PARTICLES}`,
      );
    } else {
      config.particleCount = value;
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: `Configuração do Hero Showcase inválida: ${errors.join("; ")}.`,
    };
  }

  return { success: true, config };
}

export const heroShowcasePreset: Experience3DPresetDefinition<HeroShowcaseConfig> =
  {
    key: HERO_SHOWCASE_PRESET_KEY,
    label: "Hero Showcase 3D",
    parseConfig: parseHeroShowcaseConfig,
  };
