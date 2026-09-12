import {
  ENRICHMENT_FIELD_KEYS,
  ENRICHMENT_STATUSES,
  type EnrichmentFieldErrors,
  type EnrichmentFieldFormInput,
  type EnrichmentFieldKey,
  type EnrichmentStatus,
} from "@/modules/research/types";

export type ValidatedEnrichmentField = {
  companyId: string;
  fieldKey: EnrichmentFieldKey;
  status: EnrichmentStatus;
  value: string | null;
  source: string | null;
};

export type ValidationResult =
  | { success: true; data: ValidatedEnrichmentField }
  | { success: false; errors: EnrichmentFieldErrors };

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateEnrichmentFieldInput(
  input: EnrichmentFieldFormInput,
): ValidationResult {
  const errors: EnrichmentFieldErrors = {};

  const companyId = input.companyId.trim();
  if (!companyId) {
    errors.companyId = "Empresa não informada.";
  }

  const fieldKey = input.fieldKey.trim();
  if (!(ENRICHMENT_FIELD_KEYS as readonly string[]).includes(fieldKey)) {
    errors.fieldKey = "Selecione uma informação válida.";
  }

  const status = input.status.trim();
  if (!(ENRICHMENT_STATUSES as readonly string[]).includes(status)) {
    errors.status = "Selecione um status válido.";
  }

  const source = normalizeOptional(input.source);
  const value = normalizeOptional(input.value);

  if (status === "missing") {
    if (value) {
      errors.value = 'Não informe um valor quando o status for "ausente".';
    }
  } else if (!value) {
    errors.value = "Informe o valor encontrado, ou marque como ausente.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      companyId,
      fieldKey: fieldKey as EnrichmentFieldKey,
      status: status as EnrichmentStatus,
      value: status === "missing" ? null : value,
      source,
    },
  };
}
