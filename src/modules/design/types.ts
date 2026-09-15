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
