import {
  OPTIONAL_TEXT_FIELDS,
  type StrategyFieldErrors,
  type StrategyFormInput,
} from "@/modules/strategy/types";

export type ValidatedStrategy = { companyId: string } & Record<
  (typeof OPTIONAL_TEXT_FIELDS)[number],
  string | null
>;

export type ValidationResult =
  | { success: true; data: ValidatedStrategy }
  | { success: false; errors: StrategyFieldErrors };

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateStrategyInput(
  input: StrategyFormInput,
): ValidationResult {
  const errors: StrategyFieldErrors = {};

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
    } as ValidatedStrategy,
  };
}
