import { describe, expect, it } from "vitest";

import type { SectionCopyRecord } from "@/modules/copy/types";
import type {
  SitePageRecord,
  SitePageSectionRecord,
  SiteThemeRecord,
} from "@/modules/design/types";
import type { Experience3DSceneConfig } from "@/modules/experience-3d/types";
import {
  buildSitePreview,
  checkPreviewEligibility,
} from "@/modules/site-builder/service";

function page(overrides: Partial<SitePageRecord> = {}): SitePageRecord {
  return {
    id: "page-1",
    companyId: "company-1",
    slug: "pagina-inicial",
    name: "Página inicial",
    objective: "Apresentar a padaria e gerar pedidos.",
    journeyStage: "discovery",
    position: 1,
    generatedBy: "manual",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function section(
  overrides: Partial<SitePageSectionRecord> = {},
): SitePageSectionRecord {
  return {
    id: "section-1",
    pageId: "page-1",
    sectionKey: "hero",
    name: "Hero",
    objective: "Comunicar a proposta de valor imediatamente.",
    ctaReference: "Peça agora",
    position: 1,
    generatedBy: "manual",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function copy(overrides: Partial<SectionCopyRecord> = {}): SectionCopyRecord {
  return {
    id: "copy-1",
    sectionId: "section-1",
    headline: "Pão fresco todos os dias",
    subheadline: "Direto do forno para a sua mesa.",
    body: "Produzimos nosso pão artesanal diariamente.",
    ctaLabel: "Peça agora",
    socialProofText: "Mais de 500 clientes satisfeitos.",
    notes: null,
    generatedBy: "manual",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function theme(overrides: Partial<SiteThemeRecord> = {}): SiteThemeRecord {
  return {
    id: "theme-1",
    companyId: "company-1",
    primaryColor: "#8B5E3C",
    secondaryColor: "#F4E9DA",
    accentColor: "#D97706",
    backgroundColor: "#FFFDF9",
    headingFont: "Fraunces",
    bodyFont: "Inter",
    visualStyle: "Acolhedor e artesanal",
    colorModePreference: "light",
    spacingDensity: "comfortable",
    ctaVisualGuidelines: null,
    visualReferences: null,
    accessibilityRequirements: null,
    notes: null,
    generatedBy: "manual",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function experience3d(
  overrides: Partial<Experience3DSceneConfig> = {},
): Experience3DSceneConfig {
  return {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    config: { shape: "icosahedron" },
    fallback2d: {
      imageUrl: "/fallback.svg",
      imageAlt: "Forma geométrica abstrata",
    },
    generatedBy: "manual",
    ...overrides,
  };
}

describe("checkPreviewEligibility", () => {
  it("is eligible when the company has at least one page", () => {
    expect(checkPreviewEligibility([page()])).toEqual({ eligible: true });
  });

  it("is not eligible when the company has no pages yet", () => {
    const result = checkPreviewEligibility([]);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("buildSitePreview", () => {
  it("uses the section's registered content when it exists", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [page()],
      sectionsByPage: new Map([["page-1", [section()]]]),
      copyBySection: new Map([["section-1", copy()]]),
      theme: undefined,
    });

    const renderedPage = preview.pages[0];
    if (!renderedPage) throw new Error("expected a rendered page");
    const renderedSection = renderedPage.sections[0];
    if (!renderedSection) throw new Error("expected a rendered section");
    expect(renderedSection.heading).toBe("Pão fresco todos os dias");
    expect(renderedSection.subheading).toBe("Direto do forno para a sua mesa.");
    expect(renderedSection.ctaLabel).toBe("Peça agora");
    expect(renderedSection.hasContent).toBe(true);
    expect(renderedSection.copy).toEqual({
      headline: "Pão fresco todos os dias",
      subheadline: "Direto do forno para a sua mesa.",
      body: "Produzimos nosso pão artesanal diariamente.",
      ctaLabel: "Peça agora",
      socialProofText: "Mais de 500 clientes satisfeitos.",
      notes: null,
    });
  });

  it("falls back to the section's name/objective when it has no content yet", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [page()],
      sectionsByPage: new Map([["page-1", [section()]]]),
      copyBySection: new Map(),
      theme: undefined,
    });

    const renderedPage = preview.pages[0];
    if (!renderedPage) throw new Error("expected a rendered page");
    const renderedSection = renderedPage.sections[0];
    if (!renderedSection) throw new Error("expected a rendered section");
    expect(renderedSection.heading).toBe("Hero");
    expect(renderedSection.body).toBe(
      "Comunicar a proposta de valor imediatamente.",
    );
    expect(renderedSection.ctaLabel).toBe("Peça agora");
    expect(renderedSection.hasContent).toBe(false);
    expect(renderedSection.copy).toBeNull();
  });

  it("returns a null theme when the company has none yet", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [page()],
      sectionsByPage: new Map(),
      copyBySection: new Map(),
      theme: undefined,
    });

    expect(preview.theme).toBeNull();
  });

  it("maps the company theme when it exists", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [page()],
      sectionsByPage: new Map(),
      copyBySection: new Map(),
      theme: theme(),
    });

    expect(preview.theme).toEqual({
      primaryColor: "#8B5E3C",
      secondaryColor: "#F4E9DA",
      accentColor: "#D97706",
      backgroundColor: "#FFFDF9",
      headingFont: "Fraunces",
      bodyFont: "Inter",
      colorModePreference: "light",
      spacingDensity: "comfortable",
    });
  });

  it("preserves the order of the pages and sections it's given", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [
        page({ id: "page-1", slug: "pagina-inicial", position: 1 }),
        page({ id: "page-2", slug: "contato", position: 2 }),
      ],
      sectionsByPage: new Map([
        [
          "page-1",
          [
            section({ id: "section-1", sectionKey: "hero", position: 1 }),
            section({ id: "section-2", sectionKey: "oferta", position: 2 }),
          ],
        ],
      ]),
      copyBySection: new Map(),
      theme: undefined,
    });

    expect(preview.pages.map((p) => p.slug)).toEqual([
      "pagina-inicial",
      "contato",
    ]);
    expect(preview.pages[0]?.sections.map((s) => s.sectionKey)).toEqual([
      "hero",
      "oferta",
    ]);
  });

  it("returns an empty section list for a page with no sections yet", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [page()],
      sectionsByPage: new Map(),
      copyBySection: new Map(),
      theme: undefined,
    });

    expect(preview.pages[0]?.sections).toEqual([]);
  });

  it("includes the section's persisted 3D experience config when it exists", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [page()],
      sectionsByPage: new Map([["page-1", [section()]]]),
      copyBySection: new Map(),
      experienceBySection: new Map([["section-1", experience3d()]]),
      theme: undefined,
    });

    expect(preview.pages[0]?.sections[0]?.experience3d).toEqual(experience3d());
  });

  it("returns a null 3D experience for a section that has none configured", () => {
    const preview = buildSitePreview({
      company: { id: "company-1", name: "Padaria do Bairro" },
      pages: [page()],
      sectionsByPage: new Map([["page-1", [section()]]]),
      copyBySection: new Map(),
      theme: undefined,
    });

    expect(preview.pages[0]?.sections[0]?.experience3d).toBeNull();
  });
});
