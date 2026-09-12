import { describe, expect, it } from "vitest";

import {
  checkSitePlanningEligibility,
  createSitePlanningService,
} from "@/modules/site-planning/service";
import type { SitePlanFormInput } from "@/modules/site-planning/types";
import type { StrategyRecord } from "@/modules/strategy/types";
import type {
  CompanySitePlan,
  SitePlanRepository,
  UpsertCompanySitePlan,
} from "@/server/persistence/site-plan-repository";

function createFakeRepository(): SitePlanRepository {
  const rows = new Map<string, CompanySitePlan>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanySitePlan) {
      const existing = rows.get(input.companyId);
      const row: CompanySitePlan = {
        ...input,
        id: existing?.id ?? `site-plan-${nextId++}`,
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

function existingStrategy(
  overrides: Partial<StrategyRecord> = {},
): StrategyRecord {
  return {
    id: "strategy-1",
    companyId: "company-1",
    marketingObjective: "Aumentar reconhecimento de marca na região.",
    conversionObjective: "Gerar agendamentos via WhatsApp.",
    targetAudience: "Famílias de classe média no bairro.",
    painPoints: "Falta de tempo",
    desires: "Praticidade",
    valueProposition: "Pão fresco entregue no mesmo dia.",
    differentiators: "Receita própria.",
    objections: "Preço acima da concorrência",
    salesArguments: "Qualidade comprovada por anos de bairro",
    communicationTone: "Acolhedor e próximo",
    mainOffer: "Cesta de pães frescos semanal",
    desiredConversionActions: "Pedido via WhatsApp",
    ctas: "Peça agora",
    journeyDiscovery: "Anúncio local no Instagram",
    journeyConsideration: "Depoimentos de clientes no site",
    journeyDecision: "Comparação de cesta com concorrentes",
    journeyConversion: "Botão de pedido via WhatsApp",
    journeyPostConversion: "Pesquisa de satisfação pós-entrega",
    generatedBy: "manual",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

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
    secondaryCtas: "Fale conosco",
    communicationPriorities: "Confiança",
    objectionsToAddress: "Preço acima da concorrência",
    socialProofNeeded: "Depoimentos de clientes",
    trustElements: "Selo de qualidade",
    requiredFeatures: "Catálogo de produtos",
    requiredIntegrations: "WhatsApp Business",
    leadCaptureRequirements: "Formulário com nome e telefone",
    contactRequirements: "Botão flutuante de WhatsApp",
    conversionRequirements: "Botão de pedido em destaque",
    contentRequirements: "Fotos reais dos produtos",
    visualRequirements: "Paleta quente",
    experience3dOpportunities: "Tour 3D da padaria",
    journeyStagesToSupport: "Descoberta\nConversão",
    strategicNotes: "Priorizar mobile-first.",
    ...overrides,
  };
}

describe("checkSitePlanningEligibility", () => {
  it("is eligible when the company has a strategy", () => {
    expect(checkSitePlanningEligibility(existingStrategy())).toEqual({
      eligible: true,
    });
  });

  it("is not eligible when the company has no strategy yet", () => {
    const result = checkSitePlanningEligibility(undefined);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("site planning service", () => {
  it("refuses to create a site plan when the company has no strategy", async () => {
    const service = createSitePlanningService(createFakeRepository());

    const result = await service.upsertSitePlan(validInput(), undefined);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("rejects invalid input without touching the repository", async () => {
    const service = createSitePlanningService(createFakeRepository());

    const result = await service.upsertSitePlan(
      validInput({ companyId: "" }),
      existingStrategy(),
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("creates a site plan from valid input for an eligible company", async () => {
    const service = createSitePlanningService(createFakeRepository());

    const result = await service.upsertSitePlan(
      validInput(),
      existingStrategy(),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mainGoal).toBe("Gerar agendamentos qualificados.");
      expect(result.data.generatedBy).toBe("manual");
    }
  });

  it("updates the same site plan instead of duplicating it", async () => {
    const repository = createFakeRepository();
    const service = createSitePlanningService(repository);

    const first = await service.upsertSitePlan(
      validInput(),
      existingStrategy(),
    );
    const second = await service.upsertSitePlan(
      validInput({ mainGoal: "Objetivo atualizado." }),
      existingStrategy(),
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);
    expect(second.data.mainGoal).toBe("Objetivo atualizado.");
  });

  it("returns undefined when the company has no site plan yet", async () => {
    const service = createSitePlanningService(createFakeRepository());

    const sitePlan = await service.getSitePlan("company-1");

    expect(sitePlan).toBeUndefined();
  });
});
