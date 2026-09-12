/** Raw string values as they arrive from an HTML form submission. */
export interface SitePlanFormInput {
  companyId: string;
  mainGoal: string;
  conversionGoal: string;
  priorityAudience: string;
  siteValueProposition: string;
  featuredOffer: string;
  primaryCta: string;
  secondaryCtas: string;
  communicationPriorities: string;
  objectionsToAddress: string;
  socialProofNeeded: string;
  trustElements: string;
  requiredFeatures: string;
  requiredIntegrations: string;
  leadCaptureRequirements: string;
  contactRequirements: string;
  conversionRequirements: string;
  contentRequirements: string;
  visualRequirements: string;
  experience3dOpportunities: string;
  journeyStagesToSupport: string;
  strategicNotes: string;
}

export const OPTIONAL_TEXT_FIELDS = [
  "mainGoal",
  "conversionGoal",
  "priorityAudience",
  "siteValueProposition",
  "featuredOffer",
  "primaryCta",
  "secondaryCtas",
  "communicationPriorities",
  "objectionsToAddress",
  "socialProofNeeded",
  "trustElements",
  "requiredFeatures",
  "requiredIntegrations",
  "leadCaptureRequirements",
  "contactRequirements",
  "conversionRequirements",
  "contentRequirements",
  "visualRequirements",
  "experience3dOpportunities",
  "journeyStagesToSupport",
  "strategicNotes",
] as const satisfies readonly (keyof SitePlanFormInput)[];

export type SitePlanFieldErrors = Partial<
  Record<keyof SitePlanFormInput, string>
>;

export type UpsertSitePlanActionState =
  | { status: "idle" }
  | {
      status: "error";
      errors: SitePlanFieldErrors;
      values: SitePlanFormInput;
    }
  | { status: "ineligible"; reason: string };

/**
 * Kept out of actions.ts: a "use server" module may only export async
 * functions, and this is a plain constant consumed by the client form.
 */
export const initialUpsertSitePlanActionState: UpsertSitePlanActionState = {
  status: "idle",
};

export interface SitePlanRecord {
  id: string;
  companyId: string;
  mainGoal: string | null;
  conversionGoal: string | null;
  priorityAudience: string | null;
  siteValueProposition: string | null;
  featuredOffer: string | null;
  primaryCta: string | null;
  secondaryCtas: string | null;
  communicationPriorities: string | null;
  objectionsToAddress: string | null;
  socialProofNeeded: string | null;
  trustElements: string | null;
  requiredFeatures: string | null;
  requiredIntegrations: string | null;
  leadCaptureRequirements: string | null;
  contactRequirements: string | null;
  conversionRequirements: string | null;
  contentRequirements: string | null;
  visualRequirements: string | null;
  experience3dOpportunities: string | null;
  journeyStagesToSupport: string | null;
  strategicNotes: string | null;
  generatedBy: "manual" | "ai";
  createdAt: string;
  updatedAt: string;
}

export type SitePlanEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };
