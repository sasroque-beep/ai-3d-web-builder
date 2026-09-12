"use server";

import { revalidatePath } from "next/cache";

import { diagnosisService } from "@/modules/research/diagnosis/service";
import {
  type DiagnosisFormInput,
  OPTIONAL_TEXT_FIELDS,
  type UpsertDiagnosisActionState,
} from "@/modules/research/diagnosis/types";
import { researchService } from "@/modules/research/service";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormInput(formData: FormData): DiagnosisFormInput {
  const optionalEntries = OPTIONAL_TEXT_FIELDS.map(
    (field) => [field, readFormValue(formData, field)] as const,
  );

  return {
    companyId: readFormValue(formData, "companyId"),
    digitalMaturity: readFormValue(formData, "digitalMaturity"),
    ...Object.fromEntries(optionalEntries),
  } as DiagnosisFormInput;
}

export async function upsertDiagnosisAction(
  _prevState: UpsertDiagnosisActionState,
  formData: FormData,
): Promise<UpsertDiagnosisActionState> {
  const input = parseFormInput(formData);
  const overview = await researchService.getEnrichmentOverview(input.companyId);
  const result = await diagnosisService.upsertDiagnosis(input, overview);

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason };
    }
    return { status: "error", errors: result.errors, values: input };
  }

  revalidatePath(`/leads/${input.companyId}/diagnosis`);
  return { status: "idle" };
}
