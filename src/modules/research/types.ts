export const ENRICHMENT_FIELD_KEYS = [
  "tradeName",
  "businessHours",
  "apparentAudience",
  "differentiators",
  "additionalInfo",
] as const;

export type EnrichmentFieldKey = (typeof ENRICHMENT_FIELD_KEYS)[number];

export const ENRICHMENT_STATUSES = [
  "confirmed",
  "unverified",
  "missing",
] as const;

export type EnrichmentStatus = (typeof ENRICHMENT_STATUSES)[number];

export const ENRICHMENT_FIELD_LABELS: Record<EnrichmentFieldKey, string> = {
  tradeName: "Nome comercial",
  businessHours: "Horário de funcionamento",
  apparentAudience: "Público aparente",
  differentiators: "Diferenciais identificados",
  additionalInfo: "Informações adicionais relevantes",
};

/** Raw string values as they arrive from an HTML form submission. */
export interface EnrichmentFieldFormInput {
  companyId: string;
  fieldKey: string;
  value: string;
  source: string;
  status: string;
}

export type EnrichmentFieldErrors = Partial<
  Record<keyof EnrichmentFieldFormInput, string>
>;

export type UpsertEnrichmentFieldActionState =
  | { status: "idle" }
  | { status: "error"; errors: EnrichmentFieldErrors };

export const initialUpsertEnrichmentFieldActionState: UpsertEnrichmentFieldActionState =
  {
    status: "idle",
  };

export interface EnrichmentFieldRecord {
  id: string;
  companyId: string;
  fieldKey: EnrichmentFieldKey;
  value: string | null;
  source: string | null;
  status: EnrichmentStatus;
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * One entry per known field key: either the stored record, or a synthesized
 * "missing" placeholder (never persisted) when nothing has been collected
 * yet for that key.
 */
export type EnrichmentOverview = Array<
  | EnrichmentFieldRecord
  | {
      id: null;
      companyId: string;
      fieldKey: EnrichmentFieldKey;
      value: null;
      source: null;
      status: "missing";
      collectedAt: null;
      createdAt: null;
      updatedAt: null;
    }
>;
