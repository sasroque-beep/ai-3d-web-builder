import type {
  PageArchitectureEligibility,
  SitePageFieldErrors,
  SitePageFormInput,
  SitePageRecord,
  SitePageSectionFieldErrors,
  SitePageSectionFormInput,
  SitePageSectionRecord,
  SiteThemeFieldErrors,
  SiteThemeFormInput,
  SiteThemeRecord,
  ThemeEligibility,
} from "@/modules/design/types";
import {
  validateSitePageInput,
  validateSitePageSectionInput,
  validateSiteThemeInput,
} from "@/modules/design/validation";
import type { SitePlanRecord } from "@/modules/site-planning/types";
import type {
  CompanySitePage,
  SitePageRepository,
} from "@/server/persistence/site-page-repository";
import { sitePageRepository } from "@/server/persistence/site-page-repository";
import type {
  CompanySitePageSection,
  SitePageSectionRepository,
} from "@/server/persistence/site-page-section-repository";
import { sitePageSectionRepository } from "@/server/persistence/site-page-section-repository";
import type {
  CompanySiteTheme,
  SiteThemeRepository,
} from "@/server/persistence/site-theme-repository";
import { siteThemeRepository } from "@/server/persistence/site-theme-repository";

export type UpsertSitePageResult =
  | { success: true; data: SitePageRecord }
  | { success: false; errors: SitePageFieldErrors }
  | { success: false; ineligible: true; reason: string };

export type UpsertSitePageSectionResult =
  | { success: true; data: SitePageSectionRecord }
  | { success: false; errors: SitePageSectionFieldErrors }
  | { success: false; ineligible: true; reason: string };

export type UpsertSiteThemeResult =
  | { success: true; data: SiteThemeRecord }
  | { success: false; errors: SiteThemeFieldErrors }
  | { success: false; ineligible: true; reason: string };

function toSitePageRecord(row: CompanySitePage): SitePageRecord {
  return row;
}

function toSitePageSectionRecord(
  row: CompanySitePageSection,
): SitePageSectionRecord {
  return row;
}

function toSiteThemeRecord(row: CompanySiteTheme): SiteThemeRecord {
  return row;
}

/**
 * A page architecture only makes sense once the company has a site plan to
 * build on (Issue #14 depends on Issue #12), so creating/updating a page is
 * gated on a site plan existing for the company.
 */
export function checkPageArchitectureEligibility(
  sitePlan: SitePlanRecord | undefined,
): PageArchitectureEligibility {
  if (!sitePlan) {
    return {
      eligible: false,
      reason:
        "Crie o planejamento estratégico do site da empresa antes de definir a arquitetura de páginas.",
    };
  }

  return { eligible: true };
}

/**
 * A section belongs to a page, so creating/updating one is gated on that
 * page existing — the page itself was already gated on a site plan when it
 * was created, so this doesn't re-check the site plan.
 */
export function checkSectionEligibility(
  page: SitePageRecord | undefined,
): PageArchitectureEligibility {
  if (!page) {
    return {
      eligible: false,
      reason: "Página não encontrada.",
    };
  }

  return { eligible: true };
}

/**
 * A theme only makes sense once the company has a page architecture to
 * apply it to (Issue #18 depends on Issue #14), so creating/updating it is
 * gated on at least one page existing for the company.
 */
export function checkThemeEligibility(
  pages: SitePageRecord[],
): ThemeEligibility {
  if (pages.length === 0) {
    return {
      eligible: false,
      reason:
        "Defina a arquitetura de páginas da empresa antes de configurar o tema visual do site.",
    };
  }

  return { eligible: true };
}

export function createDesignService(
  pageRepository: SitePageRepository = sitePageRepository,
  sectionRepository: SitePageSectionRepository = sitePageSectionRepository,
  themeRepository: SiteThemeRepository = siteThemeRepository,
) {
  return {
    async upsertPage(
      input: SitePageFormInput,
      sitePlan: SitePlanRecord | undefined,
    ): Promise<UpsertSitePageResult> {
      const eligibility = checkPageArchitectureEligibility(sitePlan);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateSitePageInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const position =
        validation.data.position ??
        (await pageRepository.listByCompany(validation.data.companyId)).length +
          1;

      const saved = await pageRepository.upsert({
        ...validation.data,
        position,
        generatedBy: "manual",
      });

      return { success: true, data: toSitePageRecord(saved) };
    },

    async listPages(companyId: string): Promise<SitePageRecord[]> {
      const rows = await pageRepository.listByCompany(companyId);
      return rows.map(toSitePageRecord).sort((a, b) => a.position - b.position);
    },

    async getPageById(pageId: string): Promise<SitePageRecord | undefined> {
      const row = await pageRepository.getById(pageId);
      return row ? toSitePageRecord(row) : undefined;
    },

    async upsertSection(
      input: SitePageSectionFormInput,
      page: SitePageRecord | undefined,
    ): Promise<UpsertSitePageSectionResult> {
      const eligibility = checkSectionEligibility(page);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateSitePageSectionInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const position =
        validation.data.position ??
        (await sectionRepository.listByPage(validation.data.pageId)).length + 1;

      const saved = await sectionRepository.upsert({
        ...validation.data,
        position,
        generatedBy: "manual",
      });

      return { success: true, data: toSitePageSectionRecord(saved) };
    },

    async listSections(pageId: string): Promise<SitePageSectionRecord[]> {
      const rows = await sectionRepository.listByPage(pageId);
      return rows
        .map(toSitePageSectionRecord)
        .sort((a, b) => a.position - b.position);
    },

    async getSectionById(
      sectionId: string,
    ): Promise<SitePageSectionRecord | undefined> {
      const row = await sectionRepository.getById(sectionId);
      return row ? toSitePageSectionRecord(row) : undefined;
    },

    async upsertTheme(
      input: SiteThemeFormInput,
      pages: SitePageRecord[],
    ): Promise<UpsertSiteThemeResult> {
      const eligibility = checkThemeEligibility(pages);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateSiteThemeInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const saved = await themeRepository.upsert({
        ...validation.data,
        generatedBy: "manual",
      });

      return { success: true, data: toSiteThemeRecord(saved) };
    },

    async getTheme(companyId: string): Promise<SiteThemeRecord | undefined> {
      const row = await themeRepository.getByCompanyId(companyId);
      return row ? toSiteThemeRecord(row) : undefined;
    },
  };
}

export const designService = createDesignService();
