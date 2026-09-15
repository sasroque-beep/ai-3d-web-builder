"use server";

import { revalidatePath } from "next/cache";

import { designService } from "@/modules/design/service";
import type {
  SitePageFormInput,
  SitePageSectionFormInput,
  UpsertSitePageActionState,
  UpsertSitePageSectionActionState,
} from "@/modules/design/types";
import { sitePlanningService } from "@/modules/site-planning/service";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parsePageFormInput(formData: FormData): SitePageFormInput {
  return {
    companyId: readFormValue(formData, "companyId"),
    slug: readFormValue(formData, "slug"),
    name: readFormValue(formData, "name"),
    objective: readFormValue(formData, "objective"),
    journeyStage: readFormValue(formData, "journeyStage"),
    position: readFormValue(formData, "position"),
  };
}

function parseSectionFormInput(formData: FormData): SitePageSectionFormInput {
  return {
    pageId: readFormValue(formData, "pageId"),
    sectionKey: readFormValue(formData, "sectionKey"),
    name: readFormValue(formData, "name"),
    objective: readFormValue(formData, "objective"),
    ctaReference: readFormValue(formData, "ctaReference"),
    position: readFormValue(formData, "position"),
  };
}

export async function upsertSitePageAction(
  _prevState: UpsertSitePageActionState,
  formData: FormData,
): Promise<UpsertSitePageActionState> {
  const input = parsePageFormInput(formData);
  const sitePlan = await sitePlanningService.getSitePlan(input.companyId);
  const result = await designService.upsertPage(input, sitePlan);

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason };
    }
    return { status: "error", errors: result.errors };
  }

  revalidatePath(`/leads/${input.companyId}/design`);
  return { status: "idle" };
}

export async function upsertSitePageSectionAction(
  _prevState: UpsertSitePageSectionActionState,
  formData: FormData,
): Promise<UpsertSitePageSectionActionState> {
  const input = parseSectionFormInput(formData);
  const page = await designService.getPageById(input.pageId);
  const result = await designService.upsertSection(input, page);

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason };
    }
    return { status: "error", errors: result.errors };
  }

  if (page) {
    revalidatePath(`/leads/${page.companyId}/design`);
  }
  return { status: "idle" };
}
