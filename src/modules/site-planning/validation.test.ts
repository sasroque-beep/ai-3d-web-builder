import { describe, expect, it } from "vitest";

import type { SitePlanFormInput } from "@/modules/site-planning/types";
import { validateSitePlanInput } from "@/modules/site-planning/validation";

function validInput(
  overrides: Partial<SitePlanFormInput> = {},
): SitePlanFormInput {
  return {
    companyId: "company-1",
    mainGoal: "Gerar agendamentos qualificados.",
    conversionGoal: "Agendamento via WhatsApp.",
    priorityAudience: "Famílias de classe média no bairro.",
    siteValueProposition: "Pão fresco entregue no mesmo dia.",
    featuredOffer: "Cesta de pães frescos semanal",
    primaryCta: "Peça agora",
    secondaryCtas: "Fale conosco\nConheça o cardápio",
    communicationPriorities: "Confiança\nProximidade",
    objectionsToAddress: "Preço acima da concorrência",
    socialProofNeeded: "Depoimentos de clientes\nFotos do ateliê",
    trustElements: "Selo de qualidade\nAno de fundação",
    requiredFeatures: "Catálogo de produtos\nFormulário de contato",
    requiredIntegrations: "WhatsApp Business",
    leadCaptureRequirements: "Formulário com nome e telefone",
    contactRequirements: "Botão flutuante de WhatsApp",
    conversionRequirements: "Botão de pedido em destaque",
    contentRequirements: "Fotos reais dos produtos",
    visualRequirements: "Paleta quente, tipografia acolhedora",
    experience3dOpportunities: "Tour 3D da padaria",
    journeyStagesToSupport: "Descoberta\nConversão",
    strategicNotes: "Priorizar mobile-first.",
    ...overrides,
  };
}

describe("validateSitePlanInput", () => {
  it("accepts a fully filled input", () => {
    const result = validateSitePlanInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mainGoal).toBe("Gerar agendamentos qualificados.");
      expect(result.data.journeyStagesToSupport).toBe("Descoberta\nConversão");
    }
  });

  it("requires companyId", () => {
    const result = validateSitePlanInput(validInput({ companyId: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("accepts an input with every optional field blank", () => {
    const result = validateSitePlanInput(
      validInput({
        mainGoal: "",
        conversionGoal: "",
        priorityAudience: "",
        siteValueProposition: "",
        featuredOffer: "",
        primaryCta: "",
        secondaryCtas: "",
        communicationPriorities: "",
        objectionsToAddress: "",
        socialProofNeeded: "",
        trustElements: "",
        requiredFeatures: "",
        requiredIntegrations: "",
        leadCaptureRequirements: "",
        contactRequirements: "",
        conversionRequirements: "",
        contentRequirements: "",
        visualRequirements: "",
        experience3dOpportunities: "",
        journeyStagesToSupport: "",
        strategicNotes: "",
      }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mainGoal).toBeNull();
      expect(result.data.journeyStagesToSupport).toBeNull();
    }
  });

  it("trims surrounding whitespace from optional fields", () => {
    const result = validateSitePlanInput(
      validInput({ primaryCta: "  Peça agora  " }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.primaryCta).toBe("Peça agora");
    }
  });
});
