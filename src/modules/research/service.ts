import {
  ENRICHMENT_FIELD_KEYS,
  type EnrichmentFieldErrors,
  type EnrichmentFieldFormInput,
  type EnrichmentFieldRecord,
  type EnrichmentOverview,
} from "@/modules/research/types";
import { validateEnrichmentFieldInput } from "@/modules/research/validation";
import type {
  EnrichmentField,
  EnrichmentRepository,
} from "@/server/persistence/enrichment-repository";
import { enrichmentRepository } from "@/server/persistence/enrichment-repository";

export type UpsertEnrichmentFieldResult =
  | { success: true; data: EnrichmentFieldRecord }
  | { success: false; errors: EnrichmentFieldErrors };

function toEnrichmentFieldRecord(row: EnrichmentField): EnrichmentFieldRecord {
  return row;
}

export function createResearchService(
  repository: EnrichmentRepository = enrichmentRepository,
) {
  return {
    async upsertField(
      input: EnrichmentFieldFormInput,
    ): Promise<UpsertEnrichmentFieldResult> {
      const validation = validateEnrichmentFieldInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const saved = await repository.upsert({
        ...validation.data,
        collectedAt: new Date().toISOString(),
      });

      return { success: true, data: toEnrichmentFieldRecord(saved) };
    },

    async getEnrichmentOverview(
      companyId: string,
    ): Promise<EnrichmentOverview> {
      const rows = await repository.listByCompany(companyId);
      const byKey = new Map(rows.map((row) => [row.fieldKey, row]));

      return ENRICHMENT_FIELD_KEYS.map((fieldKey) => {
        const existing = byKey.get(fieldKey);
        if (existing) {
          return toEnrichmentFieldRecord(existing);
        }

        return {
          id: null,
          companyId,
          fieldKey,
          value: null,
          source: null,
          status: "missing" as const,
          collectedAt: null,
          createdAt: null,
          updatedAt: null,
        };
      });
    },
  };
}

export const researchService = createResearchService();
