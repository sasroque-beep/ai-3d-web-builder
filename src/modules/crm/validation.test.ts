import { describe, expect, it } from "vitest";

import type { CompanyFormInput } from "@/modules/crm/types";
import { validateCompanyInput } from "@/modules/crm/validation";

function validInput(
  overrides: Partial<CompanyFormInput> = {},
): CompanyFormInput {
  return {
    name: "Padaria do Bairro",
    segment: "Alimentação",
    relationshipType: "lead",
    city: "",
    state: "",
    website: "",
    socialMedia: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    mainProducts: "",
    targetAudience: "",
    mainGoal: "",
    notes: "",
    ...overrides,
  };
}

describe("validateCompanyInput", () => {
  it("accepts a valid input with only required fields", () => {
    const result = validateCompanyInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Padaria do Bairro");
      expect(result.data.city).toBeNull();
    }
  });

  it("requires name", () => {
    const result = validateCompanyInput(validInput({ name: "  " }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("requires segment", () => {
    const result = validateCompanyInput(validInput({ segment: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.segment).toBeDefined();
    }
  });

  it("requires a valid relationshipType", () => {
    const result = validateCompanyInput(
      validInput({ relationshipType: "prospect" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.relationshipType).toBeDefined();
    }
  });

  it("rejects an invalid email when provided", () => {
    const result = validateCompanyInput(validInput({ email: "not-an-email" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it("accepts a valid email when provided", () => {
    const result = validateCompanyInput(
      validInput({ email: "contato@padaria.com" }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects a website without protocol", () => {
    const result = validateCompanyInput(validInput({ website: "padaria.com" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.website).toBeDefined();
    }
  });

  it("rejects a state that is not a 2-letter UF", () => {
    const result = validateCompanyInput(validInput({ state: "São Paulo" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.state).toBeDefined();
    }
  });

  it("normalizes a valid state to uppercase", () => {
    const result = validateCompanyInput(validInput({ state: "sp" }));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.state).toBe("SP");
    }
  });

  it("leaves optional fields as null when blank", () => {
    const result = validateCompanyInput(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBeNull();
      expect(result.data.notes).toBeNull();
    }
  });
});
