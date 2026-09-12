"use server";

import { revalidatePath } from "next/cache";

import { sitePlanningService } from "@/modules/site-planning/service";
import type {
  SitePlanFormInput,
  UpsertSitePlanActionState,
} from "@/modules/site-planning/types";
import { OPTIONAL_TEXT_FIELDS } from "@/modules/site-planning/types";
import { strategyService } from "@/modules/strategy/service";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormInput(formData: FormData): SitePlanFormInput {
  const optionalEntries = OPTIONAL_TEXT_FIELDS.map(
    (field) => [field, readFormValue(formData, field)] as const,
  );

  return {
    companyId: readFormValue(formData, "companyId"),
    ...Object.fromEntries(optionalEntries),
  } as SitePlanFormInput;
}

export async function upsertSitePlanAction(
  _prevState: UpsertSitePlanActionState,
  formData: FormData,
): Promise<UpsertSitePlanActionState> {
  const input = parseFormInput(formData);
  const strategy = await strategyService.getStrategy(input.companyId);
  const result = await sitePlanningService.upsertSitePlan(input, strategy);

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason };
    }
    return { status: "error", errors: result.errors, values: input };
  }

  revalidatePath(`/leads/${input.companyId}/site-planning`);
  return { status: "idle" };
}
