import { describe, expect, it } from "vitest";

import {
  checkSectionContentEligibility,
  createCopyService,
} from "@/modules/copy/service";
import type { SectionCopyFormInput } from "@/modules/copy/types";
import type { SitePageSectionRecord } from "@/modules/design/types";
import type {
  CompanySitePageSectionCopy,
  SectionCopyRepository,
  UpsertCompanySitePageSectionCopy,
} from "@/server/persistence/section-copy-repository";

function createFakeRepository(): SectionCopyRepository {
  const rows = new Map<string, CompanySitePageSectionCopy>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanySitePageSectionCopy) {
      const existing = rows.get(input.sectionId);
      const row: CompanySitePageSectionCopy = {
        ...input,
        id: existing?.id ?? `copy-${nextId++}`,
        createdAt: existing?.createdAt ?? "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      rows.set(input.sectionId, row);
      return row;
    },
    async getBySectionId(sectionId: string) {
      return rows.get(sectionId);
    },
  };
}

function existingSection(
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

function validInput(
  overrides: Partial<SectionCopyFormInput> = {},
): SectionCopyFormInput {
  return {
    sectionId: "section-1",
    headline: "Pão fresco todos os dias",
    subheadline: "Direto do forno para a sua mesa.",
    body: "Produzimos nosso pão artesanal diariamente.",
    ctaLabel: "Peça agora",
    socialProofText: "Mais de 500 clientes satisfeitos no bairro.",
    notes: "Manter tom acolhedor.",
    ...overrides,
  };
}

describe("checkSectionContentEligibility", () => {
  it("is eligible when the section exists", () => {
    expect(checkSectionContentEligibility(existingSection())).toEqual({
      eligible: true,
    });
  });

  it("is not eligible when the section doesn't exist", () => {
    const result = checkSectionContentEligibility(undefined);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("copy service", () => {
  it("refuses to create content when the section doesn't exist", async () => {
    const service = createCopyService(createFakeRepository());

    const result = await service.upsertSectionCopy(validInput(), undefined);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("rejects invalid input without touching the repository", async () => {
    const service = createCopyService(createFakeRepository());

    const result = await service.upsertSectionCopy(
      validInput({ sectionId: "" }),
      existingSection(),
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.sectionId).toBeDefined();
    }
  });

  it("creates content from valid input for an existing section", async () => {
    const service = createCopyService(createFakeRepository());

    const result = await service.upsertSectionCopy(
      validInput(),
      existingSection(),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headline).toBe("Pão fresco todos os dias");
      expect(result.data.generatedBy).toBe("manual");
    }
  });

  it("updates the same content instead of duplicating it", async () => {
    const repository = createFakeRepository();
    const service = createCopyService(repository);

    const first = await service.upsertSectionCopy(
      validInput(),
      existingSection(),
    );
    const second = await service.upsertSectionCopy(
      validInput({ headline: "Headline atualizado" }),
      existingSection(),
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);
    expect(second.data.headline).toBe("Headline atualizado");
  });

  it("returns undefined when the section has no content yet", async () => {
    const service = createCopyService(createFakeRepository());

    const copy = await service.getSectionCopy("section-1");

    expect(copy).toBeUndefined();
  });
});
