import { describe, expect, it } from "vitest";

import type { EnrichmentFieldFormInput } from "@/modules/research/types";
import { validateEnrichmentFieldInput } from "@/modules/research/validation";

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

describe("validateEnrichmentFieldInput", () => {
  it("accepts a valid confirmed input", () => {
    const result = validateEnrichmentFieldInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fieldKey).toBe("tradeName");
      expect(result.data.value).toBe("Padaria do Zé");
      expect(result.data.source).toBe("Google Maps");
    }
  });

  it("requires companyId", () => {
    const result = validateEnrichmentFieldInput(validInput({ companyId: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.companyId).toBeDefined();
    }
  });

  it("rejects an unknown fieldKey", () => {
    const result = validateEnrichmentFieldInput(
      validInput({ fieldKey: "unknownField" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.fieldKey).toBeDefined();
    }
  });

  it("rejects an unknown status", () => {
    const result = validateEnrichmentFieldInput(
      validInput({ status: "verified" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.status).toBeDefined();
    }
  });

  it("requires a value unless status is missing", () => {
    const result = validateEnrichmentFieldInput(validInput({ value: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.value).toBeDefined();
    }
  });

  it("accepts an empty value when status is missing", () => {
    const result = validateEnrichmentFieldInput(
      validInput({ value: "", status: "missing" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBeNull();
    }
  });

  it("rejects a value when status is missing", () => {
    const result = validateEnrichmentFieldInput(
      validInput({ status: "missing" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.value).toBeDefined();
    }
  });

  it("leaves source as null when blank", () => {
    const result = validateEnrichmentFieldInput(validInput({ source: "" }));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBeNull();
    }
  });
});
