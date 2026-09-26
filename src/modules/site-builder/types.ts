import type {
  ColorModeKey,
  JourneyStageKey,
  SpacingDensityKey,
} from "@/modules/design/types";
import type { Experience3DSceneConfig } from "@/modules/experience-3d/types";

export interface SectionPreviewCopy {
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  ctaLabel: string | null;
  socialProofText: string | null;
  notes: string | null;
}

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
  /**
   * The raw, unmodified content record (or `null` when none exists yet) —
   * for pre-filling an edit form. Unlike the display fields above, this
   * never falls back to the section's name/objective: editing without
   * changing anything must not persist the architecture's placeholder
   * text as if it were authored copy.
   */
  copy: SectionPreviewCopy | null;
  /**
   * The section's persisted 3D experience config (Issue #33), or `null` for
   * a section that has none configured. Read-only here — only the public
   * `experience-3d` contract, never renderer internals; editing it from the
   * preview is a future Issue (mirrors `copy` above).
   */
  experience3d: Experience3DSceneConfig | null;
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
