import {
  OPTIONAL_TEXT_FIELDS,
  type SectionCopyFieldErrors,
  type SectionCopyFormInput,
} from "@/modules/copy/types";

export type ValidatedSectionCopy = { sectionId: string } & Record<
  (typeof OPTIONAL_TEXT_FIELDS)[number],
  string | null
>;

export type ValidationResult =
  | { success: true; data: ValidatedSectionCopy }
  | { success: false; errors: SectionCopyFieldErrors };

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateSectionCopyInput(
  input: SectionCopyFormInput,
): ValidationResult {
  const errors: SectionCopyFieldErrors = {};

  const sectionId = input.sectionId.trim();
  if (!sectionId) {
    errors.sectionId = "Seção não informada.";
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
      sectionId,
      ...Object.fromEntries(normalizedEntries),
    } as ValidatedSectionCopy,
  };
}
