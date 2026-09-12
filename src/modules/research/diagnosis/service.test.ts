import { describe, expect, it } from "vitest";

import {
  checkDiagnosisEligibility,
  createDiagnosisService,
  listMissingEnrichment,
} from "@/modules/research/diagnosis/service";
import type { DiagnosisFormInput } from "@/modules/research/diagnosis/types";
import type { EnrichmentOverview } from "@/modules/research/types";
import type {
  CompanyDiagnostic,
  DiagnosisRepository,
  UpsertCompanyDiagnostic,
} from "@/server/persistence/diagnosis-repository";

function createFakeRepository(): DiagnosisRepository {
  const rows = new Map<string, CompanyDiagnostic>();
  let nextId = 1;

  return {
    async upsert(input: UpsertCompanyDiagnostic) {
      const existing = rows.get(input.companyId);
      const row: CompanyDiagnostic = {
        ...input,
        id: existing?.id ?? `diagnosis-${nextId++}`,
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

function confirmedField(
  fieldKey: EnrichmentOverview[number]["fieldKey"],
  value: string,
): EnrichmentOverview[number] {
  return {
    id: `field-${fieldKey}`,
    companyId: "company-1",
    fieldKey,
    value,
    source: "Google Maps",
    status: "confirmed",
    collectedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function missingField(
  fieldKey: EnrichmentOverview[number]["fieldKey"],
): EnrichmentOverview[number] {
  return {
    id: null,
    companyId: "company-1",
    fieldKey,
    value: null,
    source: null,
    status: "missing",
    collectedAt: null,
    createdAt: null,
    updatedAt: null,
  };
}

function eligibleOverview(): EnrichmentOverview {
  return [
    confirmedField("tradeName", "Padaria do Zé"),
    missingField("businessHours"),
  ];
}

function ineligibleOverview(): EnrichmentOverview {
  return [missingField("tradeName"), missingField("businessHours")];
}

function validInput(
  overrides: Partial<DiagnosisFormInput> = {},
): DiagnosisFormInput {
  return {
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
    ...overrides,
  };
}

describe("checkDiagnosisEligibility", () => {
  it("is eligible when at least one enrichment field is confirmed", () => {
    expect(checkDiagnosisEligibility(eligibleOverview())).toEqual({
      eligible: true,
    });
  });

  it("is not eligible when no enrichment field is confirmed", () => {
    const result = checkDiagnosisEligibility(ineligibleOverview());

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });

  it("is not eligible for a company with no enrichment data at all", () => {
    expect(checkDiagnosisEligibility([]).eligible).toBe(false);
  });
});

describe("listMissingEnrichment", () => {
  it("lists the label of every field that is not confirmed", () => {
    const missing = listMissingEnrichment(eligibleOverview());

    expect(missing).toEqual(["Horário de funcionamento"]);
  });

  it("returns an empty list when everything is confirmed", () => {
    const overview = [
      confirmedField("tradeName", "Padaria do Zé"),
      confirmedField("businessHours", "Seg a Sex, 8h-18h"),
    ];

    expect(listMissingEnrichment(overview)).toEqual([]);
  });
});

describe("diagnosis service", () => {
  it("refuses to create a diagnosis when the company is not eligible", async () => {
    const service = createDiagnosisService(createFakeRepository());

    const result = await service.upsertDiagnosis(
      validInput(),
      ineligibleOverview(),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect("ineligible" in result && result.ineligible).toBe(true);
    }
  });

  it("rejects invalid input without touching the repository", async () => {
    const service = createDiagnosisService(createFakeRepository());

    const result = await service.upsertDiagnosis(
      validInput({ companyId: "" }),
      eligibleOverview(),
    );

    expect(result.success).toBe(false);
    if (!result.success && !("ineligible" in result)) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("creates a diagnosis from valid input for an eligible company", async () => {
    const service = createDiagnosisService(createFakeRepository());

    const result = await service.upsertDiagnosis(
      validInput(),
      eligibleOverview(),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe(
        "Padaria de bairro com forte presença local.",
      );
      expect(result.data.generatedBy).toBe("manual");
    }
  });

  it("updates the same diagnosis instead of duplicating it", async () => {
    const repository = createFakeRepository();
    const service = createDiagnosisService(repository);

    const first = await service.upsertDiagnosis(
      validInput(),
      eligibleOverview(),
    );
    const second = await service.upsertDiagnosis(
      validInput({ summary: "Resumo atualizado." }),
      eligibleOverview(),
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);
    expect(second.data.summary).toBe("Resumo atualizado.");
  });

  it("returns undefined when the company has no diagnosis yet", async () => {
    const service = createDiagnosisService(createFakeRepository());

    const diagnosis = await service.getDiagnosis("company-1");

    expect(diagnosis).toBeUndefined();
  });
});
