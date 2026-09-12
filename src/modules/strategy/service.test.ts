import { describe, expect, it } from "vitest";

import type { DiagnosisRecord } from "@/modules/research/diagnosis/types";
import {
  checkStrategyEligibility,
  createStrategyService,
} from "@/modules/strategy/service";
import type { StrategyFormInput } from "@/modules/strategy/types";
import type {
  CompanyStrategy,
  StrategyRepository,
  UpsertCompanyStrategy,
} from "@/server/persistence/strategy-repository";

function createFakeRepository(): StrategyRepository {
  const rows = new Map<string, CompanyStrategy>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanyStrategy) {
      const existing = rows.get(input.companyId);
      const row: CompanyStrategy = {
        ...input,
        id: existing?.id ?? `strategy-${nextId++}`,
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

function existingDiagnosis(
  overrides: Partial<DiagnosisRecord> = {},
): DiagnosisRecord {
  return {
    id: "diagnosis-1",
    companyId: "company-1",
    summary: "Padaria de bairro com forte presença local.",
    niche: "Panificação artesanal",
    valueProposition: "Pão fresco entregue no mesmo dia.",
    differentiators: "Receita própria.",
    strengths: "Atendimento próximo",
    weaknesses: "Sem presença digital",
    opportunities: "Delivery próprio",
    risksOrGaps: "Dependência de um único ponto físico",
    marketingOpportunities: "Instagram de bastidores",
    conversionOpportunities: "Pedido via WhatsApp",
    digitalMaturity: "basic",
    recommendations: "Criar catálogo online",
    generatedBy: "manual",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function validInput(
  overrides: Partial<StrategyFormInput> = {},
): StrategyFormInput {
  return {
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
    ...overrides,
  };
}

describe("checkStrategyEligibility", () => {
  it("is eligible when the company has a diagnosis", () => {
    expect(checkStrategyEligibility(existingDiagnosis())).toEqual({
      eligible: true,
    });
  });

  it("is not eligible when the company has no diagnosis yet", () => {
    const result = checkStrategyEligibility(undefined);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});

describe("strategy service", () => {
  it("refuses to create a strategy when the company has no diagnosis", async () => {
    const service = createStrategyService(createFakeRepository());

    const result = await service.upsertStrategy(validInput(), undefined);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("rejects invalid input without touching the repository", async () => {
    const service = createStrategyService(createFakeRepository());

    const result = await service.upsertStrategy(
      validInput({ companyId: "" }),
      existingDiagnosis(),
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("creates a strategy from valid input for an eligible company", async () => {
    const service = createStrategyService(createFakeRepository());

    const result = await service.upsertStrategy(
      validInput(),
      existingDiagnosis(),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingObjective).toBe(
        "Aumentar reconhecimento de marca na região.",
      );
      expect(result.data.generatedBy).toBe("manual");
    }
  });

  it("updates the same strategy instead of duplicating it", async () => {
    const repository = createFakeRepository();
    const service = createStrategyService(repository);

    const first = await service.upsertStrategy(
      validInput(),
      existingDiagnosis(),
    );
    const second = await service.upsertStrategy(
      validInput({ marketingObjective: "Objetivo atualizado." }),
      existingDiagnosis(),
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);
    expect(second.data.marketingObjective).toBe("Objetivo atualizado.");
  });

  it("returns undefined when the company has no strategy yet", async () => {
    const service = createStrategyService(createFakeRepository());

    const strategy = await service.getStrategy("company-1");

    expect(strategy).toBeUndefined();
  });
});
