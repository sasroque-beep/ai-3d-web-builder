export const JOURNEY_STAGE_KEYS = [
  "discovery",
  "consideration",
  "decision",
  "conversion",
  "post_conversion",
] as const;

export type JourneyStageKey = (typeof JOURNEY_STAGE_KEYS)[number];

export const JOURNEY_STAGE_LABELS: Record<JourneyStageKey, string> = {
  discovery: "Descoberta",
  consideration: "Consideração",
  decision: "Decisão",
  conversion: "Conversão",
  post_conversion: "Pós-conversão",
};

/** Raw string values as they arrive from an HTML form submission. */
export interface SitePageFormInput {
  companyId: string;
  slug: string;
  name: string;
  objective: string;
  journeyStage: string;
  position: string;
}

export type SitePageFieldErrors = Partial<
  Record<keyof SitePageFormInput, string>
>;

export type UpsertSitePageActionState =
  | { status: "idle" }
  | { status: "error"; errors: SitePageFieldErrors }
  | { status: "ineligible"; reason: string };

export const initialUpsertSitePageActionState: UpsertSitePageActionState = {
  status: "idle",
};

export interface SitePageRecord {
  id: string;
  companyId: string;
  slug: string;
  name: string;
  objective: string | null;
  journeyStage: JourneyStageKey | null;
  position: number;
  generatedBy: "manual" | "ai";
  createdAt: string;
  updatedAt: string;
}

export type PageArchitectureEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };

/** Raw string values as they arrive from an HTML form submission. */
export interface SitePageSectionFormInput {
  pageId: string;
  sectionKey: string;
  name: string;
  objective: string;
  ctaReference: string;
  position: string;
}

export type SitePageSectionFieldErrors = Partial<
  Record<keyof SitePageSectionFormInput, string>
>;

export type UpsertSitePageSectionActionState =
  | { status: "idle" }
  | { status: "error"; errors: SitePageSectionFieldErrors }
  | { status: "ineligible"; reason: string };

export const initialUpsertSitePageSectionActionState: UpsertSitePageSectionActionState =
  {
    status: "idle",
  };

export interface SitePageSectionRecord {
  id: string;
  pageId: string;
  sectionKey: string;
  name: string;
  objective: string | null;
  ctaReference: string | null;
  position: number;
  generatedBy: "manual" | "ai";
  createdAt: string;
  updatedAt: string;
}

export const COLOR_MODE_KEYS = ["light", "dark", "both"] as const;

export type ColorModeKey = (typeof COLOR_MODE_KEYS)[number];

export const COLOR_MODE_LABELS: Record<ColorModeKey, string> = {
  light: "Claro",
  dark: "Escuro",
  both: "Ambos",
};

export const SPACING_DENSITY_KEYS = [
  "compact",
  "comfortable",
  "spacious",
] as const;

export type SpacingDensityKey = (typeof SPACING_DENSITY_KEYS)[number];

export const SPACING_DENSITY_LABELS: Record<SpacingDensityKey, string> = {
  compact: "Compacto",
  comfortable: "Confortável",
  spacious: "Generoso",
};

/** Raw string values as they arrive from an HTML form submission. */
export interface SiteThemeFormInput {
  companyId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  visualStyle: string;
  colorModePreference: string;
  spacingDensity: string;
  ctaVisualGuidelines: string;
  visualReferences: string;
  accessibilityRequirements: string;
  notes: string;
}

export type SiteThemeFieldErrors = Partial<
  Record<keyof SiteThemeFormInput, string>
>;

export type UpsertSiteThemeActionState =
  | { status: "idle" }
  | { status: "error"; errors: SiteThemeFieldErrors }
  | { status: "ineligible"; reason: string };

export const initialUpsertSiteThemeActionState: UpsertSiteThemeActionState = {
  status: "idle",
};

export interface SiteThemeRecord {
  id: string;
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
  generatedBy: "manual" | "ai";
  createdAt: string;
  updatedAt: string;
}

export type ThemeEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };
