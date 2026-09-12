"use server";

import { revalidatePath } from "next/cache";

import { researchService } from "@/modules/research/service";
import type {
  EnrichmentFieldFormInput,
  UpsertEnrichmentFieldActionState,
} from "@/modules/research/types";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormInput(formData: FormData): EnrichmentFieldFormInput {
  return {
    companyId: readFormValue(formData, "companyId"),
    fieldKey: readFormValue(formData, "fieldKey"),
    value: readFormValue(formData, "value"),
    source: readFormValue(formData, "source"),
    status: readFormValue(formData, "status"),
  };
}

export async function upsertEnrichmentFieldAction(
  _prevState: UpsertEnrichmentFieldActionState,
  formData: FormData,
): Promise<UpsertEnrichmentFieldActionState> {
  const input = parseFormInput(formData);
  const result = await researchService.upsertField(input);

  if (!result.success) {
    return { status: "error", errors: result.errors };
  }

  revalidatePath(`/leads/${input.companyId}/research`);
  return { status: "idle" };
}
