import { describe, expect, it } from "vitest";

import {
  checkPageArchitectureEligibility,
  checkSectionEligibility,
  checkThemeEligibility,
  createDesignService,
} from "@/modules/design/service";
import type {
  SitePageFormInput,
  SitePageRecord,
  SitePageSectionFormInput,
  SiteThemeFormInput,
} from "@/modules/design/types";
import type { SitePlanRecord } from "@/modules/site-planning/types";
import type {
  CompanySitePage,
  SitePageRepository,
  UpsertCompanySitePage,
} from "@/server/persistence/site-page-repository";
import type {
  CompanySitePageSection,
  SitePageSectionRepository,
  UpsertCompanySitePageSection,
} from "@/server/persistence/site-page-section-repository";
import type {
  CompanySiteTheme,
  SiteThemeRepository,
  UpsertCompanySiteTheme,
} from "@/server/persistence/site-theme-repository";

function createFakePageRepository(): SitePageRepository {
  const rows = new Map<string, CompanySitePage>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanySitePage) {
      const existing = [...rows.values()].find(
        (row) => row.companyId === input.companyId && row.slug === input.slug,
      );
      const row: CompanySitePage = {
        ...input,
        id: existing?.id ?? `page-${nextId++}`,
        createdAt: existing?.createdAt ?? "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      rows.set(row.id, row);
      return row;
    },
    async listByCompany(companyId: string) {
      return [...rows.values()].filter((row) => row.companyId === companyId);
    },
    async getById(id: string) {
      return rows.get(id);
    },
  };
}

function createFakeSectionRepository(): SitePageSectionRepository {
  const rows = new Map<string, CompanySitePageSection>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanySitePageSection) {
      const existing = [...rows.values()].find(
        (row) =>
          row.pageId === input.pageId && row.sectionKey === input.sectionKey,
      );
      const row: CompanySitePageSection = {
        ...input,
        id: existing?.id ?? `section-${nextId++}`,
        createdAt: existing?.createdAt ?? "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      rows.set(row.id, row);
      return row;
    },
    async listByPage(pageId: string) {
      return [...rows.values()].filter((row) => row.pageId === pageId);
    },
    async getById(id: string) {
      return rows.get(id);
    },
  };
}

function createFakeThemeRepository(): SiteThemeRepository {
  const rows = new Map<string, CompanySiteTheme>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanySiteTheme) {
      const existing = rows.get(input.companyId);
      const row: CompanySiteTheme = {
        ...input,
        id: existing?.id ?? `theme-${nextId++}`,
        createdAt: existing?.createdAt ?? "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      rows.set(input.companyId, row);
      return row;
    },
    async getByCompanyId(companyId: string) {
      return rows.get(companyId);
    },
  };
}

function existingSitePlan(
  overrides: Partial<SitePlanRecord> = {},
): SitePlanRecord {
  return {
    id: "site-plan-1",
    companyId: "company-1",
    mainGoal: "Gerar agendamentos qualificados.",
    conversionGoal: null,
    priorityAudience: null,
    siteValueProposition: null,
    featuredOffer: null,
    primaryCta: "Peça agora",
    secondaryCtas: null,
    communicationPriorities: null,
    objectionsToAddress: null,
    socialProofNeeded: null,
    trustElements: null,
    requiredFeatures: null,
    requiredIntegrations: null,
    leadCaptureRequirements: null,
    contactRequirements: null,
    conversionRequirements: null,
    contentRequirements: null,
    visualRequirements: null,
    experience3dOpportunities: null,
    journeyStagesToSupport: null,
    strategicNotes: null,
    generatedBy: "manual",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function validPageInput(
  overrides: Partial<SitePageFormInput> = {},
): SitePageFormInput {
  return {
    companyId: "company-1",
    slug: "pagina-inicial",
    name: "Página inicial",
    objective: "Apresentar a padaria e gerar pedidos.",
    journeyStage: "discovery",
    position: "",
    ...overrides,
  };
}

function validSectionInput(
  overrides: Partial<SitePageSectionFormInput> = {},
): SitePageSectionFormInput {
  return {
    pageId: "page-1",
    sectionKey: "hero",
    name: "Hero",
    objective: "Comunicar a proposta de valor imediatamente.",
    ctaReference: "Peça agora",
    position: "",
    ...overrides,
  };
}

function validThemeInput(
  overrides: Partial<SiteThemeFormInput> = {},
): SiteThemeFormInput {
  return {
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
    ctaVisualGuidelines: "Botão sólido laranja, cantos arredondados",
    visualReferences: "Padarias artesanais europeias",
    accessibilityRequirements: "Contraste mínimo AA",
    notes: "Priorizar mobile-first.",
    ...overrides,
  };
}

describe("checkPageArchitectureEligibility", () => {
  it("is eligible when the company has a site plan", () => {
    expect(checkPageArchitectureEligibility(existingSitePlan())).toEqual({
      eligible: true,
    });
  });

  it("is not eligible when the company has no site plan yet", () => {
    const result = checkPageArchitectureEligibility(undefined);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("checkSectionEligibility", () => {
  it("is eligible when the page exists", () => {
    const page: SitePageRecord = {
      id: "page-1",
      companyId: "company-1",
      slug: "pagina-inicial",
      name: "Página inicial",
      objective: null,
      journeyStage: null,
      position: 1,
      generatedBy: "manual",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    expect(checkSectionEligibility(page)).toEqual({ eligible: true });
  });

  it("is not eligible when the page doesn't exist", () => {
    const result = checkSectionEligibility(undefined);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("design service — pages", () => {
  it("refuses to create a page when the company has no site plan", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );

    const result = await service.upsertPage(validPageInput(), undefined);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("rejects invalid input without touching the repository", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );

    const result = await service.upsertPage(
      validPageInput({ slug: "" }),
      existingSitePlan(),
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.slug).toBeDefined();
    }
  });

  it("creates a page and assigns the next position when left blank", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );

    const first = await service.upsertPage(
      validPageInput({ slug: "pagina-inicial" }),
      existingSitePlan(),
    );
    const second = await service.upsertPage(
      validPageInput({ slug: "sobre", name: "Sobre" }),
      existingSitePlan(),
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(first.data.position).toBe(1);
    expect(second.data.position).toBe(2);
  });

  it("updates the same page instead of duplicating it for the same slug", async () => {
    const repository = createFakePageRepository();
    const service = createDesignService(repository);

    const first = await service.upsertPage(
      validPageInput(),
      existingSitePlan(),
    );
    const second = await service.upsertPage(
      validPageInput({ name: "Página inicial atualizada" }),
      existingSitePlan(),
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);
    expect(second.data.name).toBe("Página inicial atualizada");

    const pages = await service.listPages("company-1");
    expect(pages).toHaveLength(1);
  });

  it("lists pages ordered by position", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );

    await service.upsertPage(
      validPageInput({ slug: "contato", position: "2" }),
      existingSitePlan(),
    );
    await service.upsertPage(
      validPageInput({ slug: "pagina-inicial", position: "1" }),
      existingSitePlan(),
    );

    const pages = await service.listPages("company-1");

    expect(pages.map((page) => page.slug)).toEqual([
      "pagina-inicial",
      "contato",
    ]);
  });
});

describe("design service — sections", () => {
  async function createEligiblePage(
    designService: ReturnType<typeof createDesignService>,
  ) {
    const result = await designService.upsertPage(
      validPageInput(),
      existingSitePlan(),
    );
    if (!result.success) {
      throw new Error("expected page creation to succeed");
    }
    return result.data;
  }

  it("refuses to create a section when the page doesn't exist", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );

    const result = await service.upsertSection(validSectionInput(), undefined);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("creates a section and assigns the next position when left blank", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );
    const page = await createEligiblePage(service);

    const first = await service.upsertSection(
      validSectionInput({ pageId: page.id, sectionKey: "hero" }),
      page,
    );
    const second = await service.upsertSection(
      validSectionInput({ pageId: page.id, sectionKey: "oferta" }),
      page,
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(first.data.position).toBe(1);
    expect(second.data.position).toBe(2);
  });

  it("updates the same section instead of duplicating it for the same key", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );
    const page = await createEligiblePage(service);

    const first = await service.upsertSection(
      validSectionInput({ pageId: page.id }),
      page,
    );
    const second = await service.upsertSection(
      validSectionInput({ pageId: page.id, name: "Hero atualizado" }),
      page,
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);

    const sections = await service.listSections(page.id);
    expect(sections).toHaveLength(1);
  });

  it("finds a section by id", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );
    const page = await createEligiblePage(service);
    const created = await service.upsertSection(
      validSectionInput({ pageId: page.id }),
      page,
    );
    if (!created.success) {
      throw new Error("expected section creation to succeed");
    }

    const found = await service.getSectionById(created.data.id);

    expect(found?.sectionKey).toBe("hero");
  });

  it("returns undefined when the section id doesn't exist", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
    );

    const found = await service.getSectionById("unknown-section");

    expect(found).toBeUndefined();
  });
});

describe("checkThemeEligibility", () => {
  it("is eligible when the company has at least one page", () => {
    const page: SitePageRecord = {
      id: "page-1",
      companyId: "company-1",
      slug: "pagina-inicial",
      name: "Página inicial",
      objective: null,
      journeyStage: null,
      position: 1,
      generatedBy: "manual",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    expect(checkThemeEligibility([page])).toEqual({ eligible: true });
  });

  it("is not eligible when the company has no pages yet", () => {
    const result = checkThemeEligibility([]);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("design service — theme", () => {
  async function createEligiblePage(
    designService: ReturnType<typeof createDesignService>,
  ) {
    const result = await designService.upsertPage(
      validPageInput(),
      existingSitePlan(),
    );
    if (!result.success) {
      throw new Error("expected page creation to succeed");
    }
    return result.data;
  }

  it("refuses to create a theme when the company has no pages", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
      createFakeThemeRepository(),
    );

    const result = await service.upsertTheme(validThemeInput(), []);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("rejects invalid input without touching the repository", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
      createFakeThemeRepository(),
    );
    const page = await createEligiblePage(service);

    const result = await service.upsertTheme(
      validThemeInput({ colorModePreference: "rainbow" }),
      [page],
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.colorModePreference).toBeDefined();
    }
  });

  it("creates a theme from valid input for an eligible company", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
      createFakeThemeRepository(),
    );
    const page = await createEligiblePage(service);

    const result = await service.upsertTheme(validThemeInput(), [page]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.primaryColor).toBe("#8B5E3C");
      expect(result.data.generatedBy).toBe("manual");
    }
  });

  it("updates the same theme instead of duplicating it for the same company", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
      createFakeThemeRepository(),
    );
    const page = await createEligiblePage(service);

    const first = await service.upsertTheme(validThemeInput(), [page]);
    const second = await service.upsertTheme(
      validThemeInput({ primaryColor: "#000000" }),
      [page],
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);
    expect(second.data.primaryColor).toBe("#000000");
  });

  it("returns undefined when the company has no theme yet", async () => {
    const service = createDesignService(
      createFakePageRepository(),
      createFakeSectionRepository(),
      createFakeThemeRepository(),
    );

    const theme = await service.getTheme("company-1");

    expect(theme).toBeUndefined();
  });
});
