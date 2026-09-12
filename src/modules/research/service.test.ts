import { describe, expect, it } from "vitest";

import { createResearchService } from "@/modules/research/service";
import type { EnrichmentFieldFormInput } from "@/modules/research/types";
import type {
  EnrichmentField,
  EnrichmentRepository,
  UpsertEnrichmentField,
} from "@/server/persistence/enrichment-repository";

function createFakeRepository(): EnrichmentRepository {
  const rows = new Map<string, EnrichmentField>();
  let nextId = 1;

  function key(companyId: string, fieldKey: string): string {
    return `${companyId}::${fieldKey}`;
  }

  return {
    async upsert(input: UpsertEnrichmentField) {
      const k = key(input.companyId, input.fieldKey);
      const existing = rows.get(k);
      const row: EnrichmentField = {
        ...input,
        id: existing?.id ?? `field-${nextId++}`,
        createdAt: existing?.createdAt ?? "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      rows.set(k, row);
      return row;
    },
    async listByCompany(companyId: string) {
      return [...rows.values()].filter((row) => row.companyId === companyId);
    },
  };
}

function validInput(
  overrides: Partial<EnrichmentFieldFormInput> = {},
): EnrichmentFieldFormInput {
  return {
    companyId: "company-1",
    fieldKey: "tradeName",
    value: "Padaria do Zé",
    source: "Google Maps",
    status: "confirmed",
    ...overrides,
  };
}

describe("research service", () => {
  it("rejects invalid input without touching the repository", async () => {
    const service = createResearchService(createFakeRepository());

    const result = await service.upsertField(validInput({ companyId: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("creates a field from valid input", async () => {
    const service = createResearchService(createFakeRepository());

    const result = await service.upsertField(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe("Padaria do Zé");
      expect(result.data.status).toBe("confirmed");
    }
  });

  it("updates the same field instead of duplicating it", async () => {
    const repository = createFakeRepository();
    const service = createResearchService(repository);

    const first = await service.upsertField(validInput());
    const second = await service.upsertField(
      validInput({ value: "Padaria do Zé Ltda", status: "unverified" }),
    );

    if (!first.success || !second.success) {
      throw new Error("expected both upserts to succeed");
    }
    expect(second.data.id).toBe(first.data.id);

    const all = await repository.listByCompany("company-1");
    expect(all).toHaveLength(1);
  });

  it("returns an overview with all known fields, filling gaps as missing", async () => {
    const service = createResearchService(createFakeRepository());
    await service.upsertField(validInput());

    const overview = await service.getEnrichmentOverview("company-1");

    expect(overview).toHaveLength(5);
    const tradeName = overview.find((field) => field.fieldKey === "tradeName");
    expect(tradeName?.status).toBe("confirmed");
    expect(tradeName?.value).toBe("Padaria do Zé");

    const businessHours = overview.find(
      (field) => field.fieldKey === "businessHours",
    );
    expect(businessHours?.status).toBe("missing");
    expect(businessHours?.id).toBeNull();
  });

  it("returns an all-missing overview for a company with no enrichment yet", async () => {
    const service = createResearchService(createFakeRepository());

    const overview = await service.getEnrichmentOverview("unknown-company");

    expect(overview).toHaveLength(5);
    expect(overview.every((field) => field.status === "missing")).toBe(true);
  });
});
