"use server";

import { revalidatePath } from "next/cache";

import { diagnosisService } from "@/modules/research/diagnosis/service";
import { strategyService } from "@/modules/strategy/service";
import type {
  StrategyFormInput,
  UpsertStrategyActionState,
} from "@/modules/strategy/types";
import { OPTIONAL_TEXT_FIELDS } from "@/modules/strategy/types";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormInput(formData: FormData): StrategyFormInput {
  const optionalEntries = OPTIONAL_TEXT_FIELDS.map(
    (field) => [field, readFormValue(formData, field)] as const,
  );

  return {
    companyId: readFormValue(formData, "companyId"),
    ...Object.fromEntries(optionalEntries),
  } as StrategyFormInput;
}

export async function upsertStrategyAction(
  _prevState: UpsertStrategyActionState,
  formData: FormData,
): Promise<UpsertStrategyActionState> {
  const input = parseFormInput(formData);
  const diagnosis = await diagnosisService.getDiagnosis(input.companyId);
  const result = await strategyService.upsertStrategy(input, diagnosis);

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason };
    }
    return { status: "error", errors: result.errors, values: input };
  }

  revalidatePath(`/leads/${input.companyId}/strategy`);
  return { status: "idle" };
}
