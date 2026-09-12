import { describe, expect, it } from "vitest";

import type { StrategyFormInput } from "@/modules/strategy/types";
import { validateStrategyInput } from "@/modules/strategy/validation";

function validInput(
  overrides: Partial<StrategyFormInput> = {},
): StrategyFormInput {
  return {
    companyId: "company-1",
    marketingObjective: "Aumentar reconhecimento de marca na região.",
    conversionObjective: "Gerar agendamentos via WhatsApp.",
    targetAudience: "Famílias de classe média no bairro.",
    painPoints: "Falta de tempo\nDesconfiança de novos fornecedores",
    desires: "Praticidade\nConfiança",
    valueProposition: "Pão fresco entregue no mesmo dia.",
    differentiators: "Receita própria, ingredientes locais.",
    objections: "Preço acima da concorrência",
    salesArguments: "Qualidade comprovada por anos de bairro",
    communicationTone: "Acolhedor e próximo",
    mainOffer: "Cesta de pães frescos semanal",
    desiredConversionActions: "Pedido via WhatsApp\nVisita à loja",
    ctas: "Peça agora\nFale conosco",
    journeyDiscovery: "Anúncio local no Instagram",
    journeyConsideration: "Depoimentos de clientes no site",
    journeyDecision: "Comparação de cesta com concorrentes",
    journeyConversion: "Botão de pedido via WhatsApp",
    journeyPostConversion: "Pesquisa de satisfação pós-entrega",
    ...overrides,
  };
}

describe("validateStrategyInput", () => {
  it("accepts a fully filled input", () => {
    const result = validateStrategyInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingObjective).toBe(
        "Aumentar reconhecimento de marca na região.",
      );
      expect(result.data.journeyConversion).toBe(
        "Botão de pedido via WhatsApp",
      );
    }
  });

  it("requires companyId", () => {
    const result = validateStrategyInput(validInput({ companyId: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("accepts an input with every optional field blank", () => {
    const result = validateStrategyInput(
      validInput({
        marketingObjective: "",
        conversionObjective: "",
        targetAudience: "",
        painPoints: "",
        desires: "",
        valueProposition: "",
        differentiators: "",
        objections: "",
        salesArguments: "",
        communicationTone: "",
        mainOffer: "",
        desiredConversionActions: "",
        ctas: "",
        journeyDiscovery: "",
        journeyConsideration: "",
        journeyDecision: "",
        journeyConversion: "",
        journeyPostConversion: "",
      }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingObjective).toBeNull();
      expect(result.data.journeyDiscovery).toBeNull();
    }
  });

  it("trims surrounding whitespace from optional fields", () => {
    const result = validateStrategyInput(
      validInput({ mainOffer: "  Cesta de pães  " }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mainOffer).toBe("Cesta de pães");
    }
  });
});
