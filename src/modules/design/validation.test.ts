import { describe, expect, it } from "vitest";

import type {
  SitePageFormInput,
  SitePageSectionFormInput,
} from "@/modules/design/types";
import {
  validateSitePageInput,
  validateSitePageSectionInput,
} from "@/modules/design/validation";

function validPageInput(
  overrides: Partial<SitePageFormInput> = {},
): SitePageFormInput {
  return {
    companyId: "company-1",
    slug: "pagina-inicial",
    name: "Página inicial",
    objective: "Apresentar a padaria e gerar pedidos.",
    journeyStage: "discovery",
    position: "1",
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
    position: "1",
    ...overrides,
  };
}

describe("validateSitePageInput", () => {
  it("accepts a fully filled input", () => {
    const result = validateSitePageInput(validPageInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("pagina-inicial");
      expect(result.data.journeyStage).toBe("discovery");
      expect(result.data.position).toBe(1);
    }
  });

  it("requires companyId, slug and name", () => {
    const result = validateSitePageInput(
      validPageInput({ companyId: "", slug: "", name: "" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.companyId).toBeDefined();
      expect(result.errors.slug).toBeDefined();
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects a slug with invalid characters", () => {
    const result = validateSitePageInput(
      validPageInput({ slug: "Página Inicial!" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.slug).toBeDefined();
    }
  });

  it("rejects an invalid journey stage", () => {
    const result = validateSitePageInput(
      validPageInput({ journeyStage: "not-a-stage" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.journeyStage).toBeDefined();
    }
  });

  it("accepts a blank journey stage and a blank position", () => {
    const result = validateSitePageInput(
      validPageInput({ journeyStage: "", position: "" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.journeyStage).toBeNull();
      expect(result.data.position).toBeNull();
    }
  });

  it("rejects a non-numeric or non-positive position", () => {
    const nonNumeric = validateSitePageInput(
      validPageInput({ position: "abc" }),
    );
    const zero = validateSitePageInput(validPageInput({ position: "0" }));

    expect(nonNumeric.success).toBe(false);
    expect(zero.success).toBe(false);
  });

  it("lowercases the slug", () => {
    const result = validateSitePageInput(
      validPageInput({ slug: "Pagina-Inicial" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("pagina-inicial");
    }
  });
});

describe("validateSitePageSectionInput", () => {
  it("accepts a fully filled input", () => {
    const result = validateSitePageSectionInput(validSectionInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sectionKey).toBe("hero");
      expect(result.data.position).toBe(1);
    }
  });

  it("requires pageId, sectionKey and name", () => {
    const result = validateSitePageSectionInput(
      validSectionInput({ pageId: "", sectionKey: "", name: "" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.pageId).toBeDefined();
      expect(result.errors.sectionKey).toBeDefined();
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects a section key with invalid characters", () => {
    const result = validateSitePageSectionInput(
      validSectionInput({ sectionKey: "Prova Social!" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.sectionKey).toBeDefined();
    }
  });

  it("accepts a blank objective, CTA reference and position", () => {
    const result = validateSitePageSectionInput(
      validSectionInput({ objective: "", ctaReference: "", position: "" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.objective).toBeNull();
      expect(result.data.ctaReference).toBeNull();
      expect(result.data.position).toBeNull();
    }
  });
});
