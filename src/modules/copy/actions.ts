"use server";

import { revalidatePath } from "next/cache";

import { copyService } from "@/modules/copy/service";
import type {
  SectionCopyFormInput,
  UpsertSectionCopyActionState,
} from "@/modules/copy/types";
import { OPTIONAL_TEXT_FIELDS } from "@/modules/copy/types";
import { designService } from "@/modules/design/service";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseFormInput(formData: FormData): SectionCopyFormInput {
  const optionalEntries = OPTIONAL_TEXT_FIELDS.map(
    (field) => [field, readFormValue(formData, field)] as const,
  );

  return {
    sectionId: readFormValue(formData, "sectionId"),
    ...Object.fromEntries(optionalEntries),
  } as SectionCopyFormInput;
}

export async function upsertSectionCopyAction(
  _prevState: UpsertSectionCopyActionState,
  formData: FormData,
): Promise<UpsertSectionCopyActionState> {
  const input = parseFormInput(formData);
  const section = await designService.getSectionById(input.sectionId);
  const result = await copyService.upsertSectionCopy(input, section);

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason };
    }
    return { status: "error", errors: result.errors };
  }

  if (section) {
    const page = await designService.getPageById(section.pageId);
    if (page) {
      revalidatePath(`/leads/${page.companyId}/copy`);
    }
  }
  return { status: "idle" };
}
