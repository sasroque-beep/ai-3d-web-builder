import type { SectionCopyRecord } from "@/modules/copy/types";
import type {
  SitePageRecord,
  SitePageSectionRecord,
  SiteThemeRecord,
} from "@/modules/design/types";
import type {
  PagePreview,
  PreviewEligibility,
  SectionPreview,
  SitePreview,
  SitePreviewTheme,
} from "@/modules/site-builder/types";

/**
 * A preview only makes sense once the company has a page architecture to
 * render (Issue #20 depends on Issue #14), so it's gated on at least one
 * page existing for the company. Content (Issue #16) and theme (Issue #18)
 * are optional context, applied with fallback by buildSitePreview instead
 * of gating the preview.
 */
export function checkPreviewEligibility(
  pages: SitePageRecord[],
): PreviewEligibility {
  if (pages.length === 0) {
    return {
      eligible: false,
      reason:
        "Defina a arquitetura de páginas da empresa antes de gerar o preview do site.",
    };
  }

  return { eligible: true };
}

function toSectionPreview(
  section: SitePageSectionRecord,
  copy: SectionCopyRecord | undefined,
): SectionPreview {
  return {
    id: section.id,
    sectionKey: section.sectionKey,
    position: section.position,
    heading: copy?.headline ?? section.name,
    subheading: copy?.subheadline ?? null,
    body: copy?.body ?? section.objective ?? null,
    ctaLabel: copy?.ctaLabel ?? section.ctaReference ?? null,
    socialProofText: copy?.socialProofText ?? null,
    hasContent: Boolean(copy),
    copy: copy
      ? {
          headline: copy.headline,
          subheadline: copy.subheadline,
          body: copy.body,
          ctaLabel: copy.ctaLabel,
          socialProofText: copy.socialProofText,
          notes: copy.notes,
        }
      : null,
  };
}

function toSitePreviewTheme(theme: SiteThemeRecord): SitePreviewTheme {
  return {
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    headingFont: theme.headingFont,
    bodyFont: theme.bodyFont,
    colorModePreference: theme.colorModePreference,
    spacingDensity: theme.spacingDensity,
  };
}

export interface BuildSitePreviewInput {
  company: { id: string; name: string };
  pages: SitePageRecord[];
  sectionsByPage: Map<string, SitePageSectionRecord[]>;
  copyBySection: Map<string, SectionCopyRecord | undefined>;
  theme: SiteThemeRecord | undefined;
}

/**
 * Pure composition: assembles already-fetched pages/sections/content/theme
 * into a render-ready preview, applying fallback for missing content and
 * theme instead of requiring them. Trusts the order of `pages` and of each
 * page's sections in `sectionsByPage` — designService.listPages/
 * listSections already sort by position, so this doesn't re-sort.
 */
export function buildSitePreview(input: BuildSitePreviewInput): SitePreview {
  const pages: PagePreview[] = input.pages.map((page) => {
    const sections = input.sectionsByPage.get(page.id) ?? [];
    return {
      id: page.id,
      slug: page.slug,
      name: page.name,
      objective: page.objective,
      journeyStage: page.journeyStage,
      position: page.position,
      sections: sections.map((section) =>
        toSectionPreview(section, input.copyBySection.get(section.id)),
      ),
    };
  });

  return {
    companyId: input.company.id,
    companyName: input.company.name,
    pages,
    theme: input.theme ? toSitePreviewTheme(input.theme) : null,
  };
}
