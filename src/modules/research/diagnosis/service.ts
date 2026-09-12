import type {
  DiagnosisEligibility,
  DiagnosisFieldErrors,
  DiagnosisFormInput,
  DiagnosisRecord,
} from "@/modules/research/diagnosis/types";
import { validateDiagnosisInput } from "@/modules/research/diagnosis/validation";
import {
  ENRICHMENT_FIELD_LABELS,
  type EnrichmentOverview,
} from "@/modules/research/types";
import type {
  CompanyDiagnostic,
  DiagnosisRepository,
} from "@/server/persistence/diagnosis-repository";
import { diagnosisRepository } from "@/server/persistence/diagnosis-repository";

export type UpsertDiagnosisResult =
  | { success: true; data: DiagnosisRecord }
  | { success: false; errors: DiagnosisFieldErrors }
  | { success: false; ineligible: true; reason: string };

function toDiagnosisRecord(row: CompanyDiagnostic): DiagnosisRecord {
  return row;
}

/**
 * A diagnosis must not be generated from insufficient data (Issue #8): the
 * company's own required fields (name/segment) are already enforced at
 * registration time (Issue #4), so the only condition worth checking here is
 * that at least one enrichment field (Issue #6) has been confirmed.
 */
export function checkDiagnosisEligibility(
  overview: EnrichmentOverview,
): DiagnosisEligibility {
  const hasConfirmedField = overview.some(
    (field) => field.status === "confirmed",
  );

  if (!hasConfirmedField) {
    return {
      eligible: false,
      reason:
        "Confirme ao menos uma informação de enriquecimento antes de gerar o diagnóstico.",
    };
  }

  return { eligible: true };
}

export function listMissingEnrichment(overview: EnrichmentOverview): string[] {
  return overview
    .filter((field) => field.status !== "confirmed")
    .map((field) => ENRICHMENT_FIELD_LABELS[field.fieldKey]);
}

export function createDiagnosisService(
  repository: DiagnosisRepository = diagnosisRepository,
) {
  return {
    async upsertDiagnosis(
      input: DiagnosisFormInput,
      overview: EnrichmentOverview,
    ): Promise<UpsertDiagnosisResult> {
      const eligibility = checkDiagnosisEligibility(overview);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateDiagnosisInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const saved = await repository.upsert({
        ...validation.data,
        generatedBy: "manual",
      });

      return { success: true, data: toDiagnosisRecord(saved) };
    },

    async getDiagnosis(
      companyId: string,
    ): Promise<DiagnosisRecord | undefined> {
      const row = await repository.getByCompanyId(companyId);
      return row ? toDiagnosisRecord(row) : undefined;
    },
  };
}

export const diagnosisService = createDiagnosisService();
