"use server";

import { redirect } from "next/navigation";

import { crmService } from "@/modules/crm/service";
import {
  type CompanyFormInput,
  type CreateCompanyActionState,
  OPTIONAL_TEXT_FIELDS,
} from "@/modules/crm/types";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormInput(formData: FormData): CompanyFormInput {
  const optionalEntries = OPTIONAL_TEXT_FIELDS.map(
    (field) => [field, readFormValue(formData, field)] as const,
  );

  return {
    name: readFormValue(formData, "name"),
    segment: readFormValue(formData, "segment"),
    relationshipType: readFormValue(formData, "relationshipType"),
    ...Object.fromEntries(optionalEntries),
  } as CompanyFormInput;
}

export async function createCompanyAction(
  _prevState: CreateCompanyActionState,
  formData: FormData,
): Promise<CreateCompanyActionState> {
  const input = parseFormInput(formData);
  const result = await crmService.createCompany(input);

  if (!result.success) {
    return { status: "error", errors: result.errors, values: input };
  }

  redirect(`/leads/${result.data.id}?created=1`);
}
