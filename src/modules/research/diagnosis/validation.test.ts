import { describe, expect, it } from "vitest";

import type { DiagnosisFormInput } from "@/modules/research/diagnosis/types";
import { validateDiagnosisInput } from "@/modules/research/diagnosis/validation";

function validInput(
  overrides: Partial<DiagnosisFormInput> = {},
): DiagnosisFormInput {
  return {
    companyId: "company-1",
    summary: "Padaria de bairro com forte presença local.",
    niche: "Panificação artesanal",
    valueProposition: "Pão fresco entregue no mesmo dia.",
    differentiators: "Receita própria.",
    strengths: "Atendimento próximo\nQualidade reconhecida",
    weaknesses: "Sem presença digital",
    opportunities: "Delivery próprio",
    risksOrGaps: "Dependência de um único ponto físico",
    marketingOpportunities: "Instagram de bastidores",
    conversionOpportunities: "Pedido via WhatsApp",
    digitalMaturity: "basic",
    recommendations: "Criar catálogo online",
    ...overrides,
  };
}

describe("validateDiagnosisInput", () => {
  it("accepts a fully filled input", () => {
    const result = validateDiagnosisInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe(
        "Padaria de bairro com forte presença local.",
      );
      expect(result.data.digitalMaturity).toBe("basic");
    }
  });

  it("requires companyId", () => {
    const result = validateDiagnosisInput(validInput({ companyId: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("accepts an input with every optional field blank", () => {
    const result = validateDiagnosisInput(
      validInput({
        summary: "",
        niche: "",
        valueProposition: "",
        differentiators: "",
        strengths: "",
        weaknesses: "",
        opportunities: "",
        risksOrGaps: "",
        marketingOpportunities: "",
        conversionOpportunities: "",
        digitalMaturity: "",
        recommendations: "",
      }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBeNull();
      expect(result.data.digitalMaturity).toBeNull();
    }
  });

  it("rejects an unknown digital maturity level", () => {
    const result = validateDiagnosisInput(
      validInput({ digitalMaturity: "expert" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.digitalMaturity).toBeDefined();
    }
  });
});
