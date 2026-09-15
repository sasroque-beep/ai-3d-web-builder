import type {
  ColorModeKey,
  JourneyStageKey,
  SpacingDensityKey,
} from "@/modules/design/types";

export interface SectionPreview {
  id: string;
  sectionKey: string;
  position: number;
  heading: string;
  subheading: string | null;
  body: string | null;
  ctaLabel: string | null;
  socialProofText: string | null;
  hasContent: boolean;
}

export interface PagePreview {
  id: string;
  slug: string;
  name: string;
  objective: string | null;
  journeyStage: JourneyStageKey | null;
  position: number;
  sections: SectionPreview[];
}

export interface SitePreviewTheme {
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  colorModePreference: ColorModeKey | null;
  spacingDensity: SpacingDensityKey | null;
}

export interface SitePreview {
  companyId: string;
  companyName: string;
  pages: PagePreview[];
  theme: SitePreviewTheme | null;
}

export type PreviewEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };
