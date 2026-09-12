import {
  DIGITAL_MATURITY_LEVELS,
  type DiagnosisFieldErrors,
  type DiagnosisFormInput,
  type DigitalMaturityLevel,
} from "@/modules/research/diagnosis/types";

export type ValidatedDiagnosis = {
  companyId: string;
} & Record<
  | "summary"
  | "niche"
  | "valueProposition"
  | "differentiators"
  | "strengths"
  | "weaknesses"
  | "opportunities"
  | "risksOrGaps"
  | "marketingOpportunities"
  | "conversionOpportunities"
  | "recommendations",
  string | null
> & { digitalMaturity: DigitalMaturityLevel | null };

export type ValidationResult =
  | { success: true; data: ValidatedDiagnosis }
  | { success: false; errors: DiagnosisFieldErrors };

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateDiagnosisInput(
  input: DiagnosisFormInput,
): ValidationResult {
  const errors: DiagnosisFieldErrors = {};

  const companyId = input.companyId.trim();
  if (!companyId) {
    errors.companyId = "Empresa não informada.";
  }

  const digitalMaturity = normalizeOptional(input.digitalMaturity);
  if (
    digitalMaturity &&
    !(DIGITAL_MATURITY_LEVELS as readonly string[]).includes(digitalMaturity)
  ) {
    errors.digitalMaturity = "Selecione um nível de maturidade digital válido.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      companyId,
      summary: normalizeOptional(input.summary),
      niche: normalizeOptional(input.niche),
      valueProposition: normalizeOptional(input.valueProposition),
      differentiators: normalizeOptional(input.differentiators),
      strengths: normalizeOptional(input.strengths),
      weaknesses: normalizeOptional(input.weaknesses),
      opportunities: normalizeOptional(input.opportunities),
      risksOrGaps: normalizeOptional(input.risksOrGaps),
      marketingOpportunities: normalizeOptional(input.marketingOpportunities),
      conversionOpportunities: normalizeOptional(input.conversionOpportunities),
      digitalMaturity: digitalMaturity as DigitalMaturityLevel | null,
      recommendations: normalizeOptional(input.recommendations),
    },
  };
}
