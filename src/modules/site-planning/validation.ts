import {
  OPTIONAL_TEXT_FIELDS,
  type SitePlanFieldErrors,
  type SitePlanFormInput,
} from "@/modules/site-planning/types";

export type ValidatedSitePlan = { companyId: string } & Record<
  (typeof OPTIONAL_TEXT_FIELDS)[number],
  string | null
>;

export type ValidationResult =
  | { success: true; data: ValidatedSitePlan }
  | { success: false; errors: SitePlanFieldErrors };

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateSitePlanInput(
  input: SitePlanFormInput,
): ValidationResult {
  const errors: SitePlanFieldErrors = {};

  const companyId = input.companyId.trim();
  if (!companyId) {
    errors.companyId = "Empresa não informada.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const normalizedEntries = OPTIONAL_TEXT_FIELDS.map(
    (field) => [field, normalizeOptional(input[field])] as const,
  );

  return {
    success: true,
    data: {
      companyId,
      ...Object.fromEntries(normalizedEntries),
    } as ValidatedSitePlan,
  };
}
