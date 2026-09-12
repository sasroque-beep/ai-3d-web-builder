/** Raw string values as they arrive from an HTML form submission. */
export interface StrategyFormInput {
  companyId: string;
  marketingObjective: string;
  conversionObjective: string;
  targetAudience: string;
  painPoints: string;
  desires: string;
  valueProposition: string;
  differentiators: string;
  objections: string;
  salesArguments: string;
  communicationTone: string;
  mainOffer: string;
  desiredConversionActions: string;
  ctas: string;
  journeyDiscovery: string;
  journeyConsideration: string;
  journeyDecision: string;
  journeyConversion: string;
  journeyPostConversion: string;
}

export const OPTIONAL_TEXT_FIELDS = [
  "marketingObjective",
  "conversionObjective",
  "targetAudience",
  "painPoints",
  "desires",
  "valueProposition",
  "differentiators",
  "objections",
  "salesArguments",
  "communicationTone",
  "mainOffer",
  "desiredConversionActions",
  "ctas",
  "journeyDiscovery",
  "journeyConsideration",
  "journeyDecision",
  "journeyConversion",
  "journeyPostConversion",
] as const satisfies readonly (keyof StrategyFormInput)[];

export const JOURNEY_FIELDS = [
  ["journeyDiscovery", "Descoberta"],
  ["journeyConsideration", "Consideração"],
  ["journeyDecision", "Decisão"],
  ["journeyConversion", "Conversão"],
  ["journeyPostConversion", "Pós-conversão"],
] as const satisfies ReadonlyArray<[keyof StrategyFormInput, string]>;

export type StrategyFieldErrors = Partial<
  Record<keyof StrategyFormInput, string>
>;

export type UpsertStrategyActionState =
  | { status: "idle" }
  | {
      status: "error";
      errors: StrategyFieldErrors;
      values: StrategyFormInput;
    }
  | { status: "ineligible"; reason: string };

/**
 * Kept out of actions.ts: a "use server" module may only export async
 * functions, and this is a plain constant consumed by the client form.
 */
export const initialUpsertStrategyActionState: UpsertStrategyActionState = {
  status: "idle",
};

export interface StrategyRecord {
  id: string;
  companyId: string;
  marketingObjective: string | null;
  conversionObjective: string | null;
  targetAudience: string | null;
  painPoints: string | null;
  desires: string | null;
  valueProposition: string | null;
  differentiators: string | null;
  objections: string | null;
  salesArguments: string | null;
  communicationTone: string | null;
  mainOffer: string | null;
  desiredConversionActions: string | null;
  ctas: string | null;
  journeyDiscovery: string | null;
  journeyConsideration: string | null;
  journeyDecision: string | null;
  journeyConversion: string | null;
  journeyPostConversion: string | null;
  generatedBy: "manual" | "ai";
  createdAt: string;
  updatedAt: string;
}

export type StrategyEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };
