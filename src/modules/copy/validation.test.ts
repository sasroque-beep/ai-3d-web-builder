import { describe, expect, it } from "vitest";

import type { SectionCopyFormInput } from "@/modules/copy/types";
import { validateSectionCopyInput } from "@/modules/copy/validation";

function validInput(
  overrides: Partial<SectionCopyFormInput> = {},
): SectionCopyFormInput {
  return {
    sectionId: "section-1",
    headline: "Pão fresco todos os dias",
    subheadline: "Direto do forno para a sua mesa.",
    body: "Produzimos nosso pão artesanal diariamente, com ingredientes locais.",
    ctaLabel: "Peça agora",
    socialProofText: "Mais de 500 clientes satisfeitos no bairro.",
    notes: "Manter tom acolhedor e próximo.",
    ...overrides,
  };
}

describe("validateSectionCopyInput", () => {
  it("accepts a fully filled input", () => {
    const result = validateSectionCopyInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headline).toBe("Pão fresco todos os dias");
      expect(result.data.ctaLabel).toBe("Peça agora");
    }
  });

  it("requires sectionId", () => {
    const result = validateSectionCopyInput(validInput({ sectionId: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.sectionId).toBeDefined();
    }
  });

  it("accepts an input with every optional field blank", () => {
    const result = validateSectionCopyInput(
      validInput({
        headline: "",
        subheadline: "",
        body: "",
        ctaLabel: "",
        socialProofText: "",
        notes: "",
      }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headline).toBeNull();
      expect(result.data.ctaLabel).toBeNull();
    }
  });

  it("trims surrounding whitespace from optional fields", () => {
    const result = validateSectionCopyInput(
      validInput({ headline: "  Pão fresco  " }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headline).toBe("Pão fresco");
    }
  });
});
