export const DIGITAL_MATURITY_LEVELS = [
  "none",
  "basic",
  "intermediate",
  "advanced",
] as const;

export type DigitalMaturityLevel = (typeof DIGITAL_MATURITY_LEVELS)[number];

export const DIGITAL_MATURITY_LABELS: Record<DigitalMaturityLevel, string> = {
  none: "Inexistente",
  basic: "Básica",
  intermediate: "Intermediária",
  advanced: "Avançada",
};

/** Raw string values as they arrive from an HTML form submission. */
export interface DiagnosisFormInput {
  companyId: string;
  summary: string;
  niche: string;
  valueProposition: string;
  differentiators: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  risksOrGaps: string;
  marketingOpportunities: string;
  conversionOpportunities: string;
  digitalMaturity: string;
  recommendations: string;
}

export const OPTIONAL_TEXT_FIELDS = [
  "summary",
  "niche",
  "valueProposition",
  "differentiators",
  "strengths",
  "weaknesses",
  "opportunities",
  "risksOrGaps",
  "marketingOpportunities",
  "conversionOpportunities",
  "recommendations",
] as const satisfies readonly (keyof DiagnosisFormInput)[];

export type DiagnosisFieldErrors = Partial<
  Record<keyof DiagnosisFormInput, string>
>;

export type UpsertDiagnosisActionState =
  | { status: "idle" }
  | {
      status: "error";
      errors: DiagnosisFieldErrors;
      values: DiagnosisFormInput;
    }
  | { status: "ineligible"; reason: string };

/**
 * Kept out of actions.ts: a "use server" module may only export async
 * functions, and this is a plain constant consumed by the client form.
 */
export const initialUpsertDiagnosisActionState: UpsertDiagnosisActionState = {
  status: "idle",
};

export interface DiagnosisRecord {
  id: string;
  companyId: string;
  summary: string | null;
  niche: string | null;
  valueProposition: string | null;
  differentiators: string | null;
  strengths: string | null;
  weaknesses: string | null;
  opportunities: string | null;
  risksOrGaps: string | null;
  marketingOpportunities: string | null;
  conversionOpportunities: string | null;
  digitalMaturity: DigitalMaturityLevel | null;
  recommendations: string | null;
  generatedBy: "manual" | "ai";
  createdAt: string;
  updatedAt: string;
}

export type DiagnosisEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };
