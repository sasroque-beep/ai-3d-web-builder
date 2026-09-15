import {
  COLOR_MODE_KEYS,
  type ColorModeKey,
  JOURNEY_STAGE_KEYS,
  type JourneyStageKey,
  type SitePageFieldErrors,
  type SitePageFormInput,
  type SitePageSectionFieldErrors,
  type SitePageSectionFormInput,
  type SiteThemeFieldErrors,
  type SiteThemeFormInput,
  SPACING_DENSITY_KEYS,
  type SpacingDensityKey,
} from "@/modules/design/types";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Returns `null` when the field was left blank (the caller assigns the
 * next available position), or `undefined` when it's present but not a
 * valid positive integer.
 */
function parsePosition(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return parsed > 0 ? parsed : undefined;
}

export type ValidatedSitePage = {
  companyId: string;
  slug: string;
  name: string;
  objective: string | null;
  journeyStage: JourneyStageKey | null;
  position: number | null;
};

export type SitePageValidationResult =
  | { success: true; data: ValidatedSitePage }
  | { success: false; errors: SitePageFieldErrors };

export function validateSitePageInput(
  input: SitePageFormInput,
): SitePageValidationResult {
  const errors: SitePageFieldErrors = {};

  const companyId = input.companyId.trim();
  if (!companyId) {
    errors.companyId = "Empresa não informada.";
  }

  const slug = input.slug.trim().toLowerCase();
  if (!slug) {
    errors.slug = "Informe um identificador para a página.";
  } else if (!SLUG_PATTERN.test(slug)) {
    errors.slug =
      "Use apenas letras minúsculas, números e hífens (ex.: pagina-inicial).";
  }

  const name = input.name.trim();
  if (!name) {
    errors.name = "Informe o nome da página.";
  }

  const journeyStageInput = input.journeyStage.trim();
  const journeyStage = journeyStageInput === "" ? null : journeyStageInput;
  if (
    journeyStage !== null &&
    !(JOURNEY_STAGE_KEYS as readonly string[]).includes(journeyStage)
  ) {
    errors.journeyStage = "Selecione uma etapa da jornada válida.";
  }

  const position = parsePosition(input.position);
  if (position === undefined) {
    errors.position = "Informe um número inteiro positivo, ou deixe em branco.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      companyId,
      slug,
      name,
      objective: normalizeOptional(input.objective),
      journeyStage: journeyStage as JourneyStageKey | null,
      position: position ?? null,
    },
  };
}

export type ValidatedSitePageSection = {
  pageId: string;
  sectionKey: string;
  name: string;
  objective: string | null;
  ctaReference: string | null;
  position: number | null;
};

export type SitePageSectionValidationResult =
  | { success: true; data: ValidatedSitePageSection }
  | { success: false; errors: SitePageSectionFieldErrors };

export function validateSitePageSectionInput(
  input: SitePageSectionFormInput,
): SitePageSectionValidationResult {
  const errors: SitePageSectionFieldErrors = {};

  const pageId = input.pageId.trim();
  if (!pageId) {
    errors.pageId = "Selecione uma página.";
  }

  const sectionKey = input.sectionKey.trim().toLowerCase();
  if (!sectionKey) {
    errors.sectionKey = "Informe um identificador para a seção.";
  } else if (!SLUG_PATTERN.test(sectionKey)) {
    errors.sectionKey =
      "Use apenas letras minúsculas, números e hífens (ex.: prova-social).";
  }

  const name = input.name.trim();
  if (!name) {
    errors.name = "Informe o nome da seção.";
  }

  const position = parsePosition(input.position);
  if (position === undefined) {
    errors.position = "Informe um número inteiro positivo, ou deixe em branco.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      pageId,
      sectionKey,
      name,
      objective: normalizeOptional(input.objective),
      ctaReference: normalizeOptional(input.ctaReference),
      position: position ?? null,
    },
  };
}

export type ValidatedSiteTheme = {
  companyId: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  visualStyle: string | null;
  colorModePreference: ColorModeKey | null;
  spacingDensity: SpacingDensityKey | null;
  ctaVisualGuidelines: string | null;
  visualReferences: string | null;
  accessibilityRequirements: string | null;
  notes: string | null;
};

export type SiteThemeValidationResult =
  | { success: true; data: ValidatedSiteTheme }
  | { success: false; errors: SiteThemeFieldErrors };

export function validateSiteThemeInput(
  input: SiteThemeFormInput,
): SiteThemeValidationResult {
  const errors: SiteThemeFieldErrors = {};

  const companyId = input.companyId.trim();
  if (!companyId) {
    errors.companyId = "Empresa não informada.";
  }

  const colorModeInput = input.colorModePreference.trim();
  const colorModePreference = colorModeInput === "" ? null : colorModeInput;
  if (
    colorModePreference !== null &&
    !(COLOR_MODE_KEYS as readonly string[]).includes(colorModePreference)
  ) {
    errors.colorModePreference = "Selecione um modo de cor válido.";
  }

  const spacingDensityInput = input.spacingDensity.trim();
  const spacingDensity =
    spacingDensityInput === "" ? null : spacingDensityInput;
  if (
    spacingDensity !== null &&
    !(SPACING_DENSITY_KEYS as readonly string[]).includes(spacingDensity)
  ) {
    errors.spacingDensity = "Selecione uma densidade de espaçamento válida.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      companyId,
      primaryColor: normalizeOptional(input.primaryColor),
      secondaryColor: normalizeOptional(input.secondaryColor),
      accentColor: normalizeOptional(input.accentColor),
      backgroundColor: normalizeOptional(input.backgroundColor),
      headingFont: normalizeOptional(input.headingFont),
      bodyFont: normalizeOptional(input.bodyFont),
      visualStyle: normalizeOptional(input.visualStyle),
      colorModePreference: colorModePreference as ColorModeKey | null,
      spacingDensity: spacingDensity as SpacingDensityKey | null,
      ctaVisualGuidelines: normalizeOptional(input.ctaVisualGuidelines),
      visualReferences: normalizeOptional(input.visualReferences),
      accessibilityRequirements: normalizeOptional(
        input.accessibilityRequirements,
      ),
      notes: normalizeOptional(input.notes),
    },
  };
}
