"use server";

import { revalidatePath } from "next/cache";

import { designService } from "@/modules/design/service";
import type {
  SitePageFormInput,
  SitePageSectionFormInput,
  SiteThemeFormInput,
  UpsertSitePageActionState,
  UpsertSitePageSectionActionState,
  UpsertSiteThemeActionState,
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

function parseThemeFormInput(formData: FormData): SiteThemeFormInput {
  return {
    companyId: readFormValue(formData, "companyId"),
    primaryColor: readFormValue(formData, "primaryColor"),
    secondaryColor: readFormValue(formData, "secondaryColor"),
    accentColor: readFormValue(formData, "accentColor"),
    backgroundColor: readFormValue(formData, "backgroundColor"),
    headingFont: readFormValue(formData, "headingFont"),
    bodyFont: readFormValue(formData, "bodyFont"),
    visualStyle: readFormValue(formData, "visualStyle"),
    colorModePreference: readFormValue(formData, "colorModePreference"),
    spacingDensity: readFormValue(formData, "spacingDensity"),
    ctaVisualGuidelines: readFormValue(formData, "ctaVisualGuidelines"),
    visualReferences: readFormValue(formData, "visualReferences"),
    accessibilityRequirements: readFormValue(
      formData,
      "accessibilityRequirements",
    ),
    notes: readFormValue(formData, "notes"),
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

export async function upsertSiteThemeAction(
  _prevState: UpsertSiteThemeActionState,
  formData: FormData,
): Promise<UpsertSiteThemeActionState> {
  const input = parseThemeFormInput(formData);
  const pages = await designService.listPages(input.companyId);
  const result = await designService.upsertTheme(input, pages);

  if (!result.success) {
    if ("ineligible" in result) {
      return { status: "ineligible", reason: result.reason };
    }
    return { status: "error", errors: result.errors };
  }

  revalidatePath(`/leads/${input.companyId}/design/theme`);
  return { status: "idle" };
}
