import { describe, expect, it } from "vitest";

import { createCrmService } from "@/modules/crm/service";
import type { CompanyFormInput } from "@/modules/crm/types";
import type {
  Company,
  CompanyRepository,
  NewCompany,
} from "@/server/persistence/company-repository";

function createFakeRepository(): CompanyRepository {
  const rows: Company[] = [];
  let nextId = 1;

  return {
    async create(input: NewCompany) {
      const row: Company = {
        ...input,
        id: `company-${nextId++}`,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };
      rows.push(row);
      return row;
    },
    async list() {
      return [...rows];
    },
    async getById(id: string) {
      return rows.find((row) => row.id === id);
    },
  };
}

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

describe("crm service", () => {
  it("rejects invalid input without touching the repository", async () => {
    const service = createCrmService(createFakeRepository());

    const result = await service.createCompany(validInput({ name: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("creates a company from valid input and returns it without the origin field", async () => {
    const service = createCrmService(createFakeRepository());

    const result = await service.createCompany(validInput());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Padaria do Bairro");
      expect("origin" in result.data).toBe(false);
    }
  });

  it("always persists new companies with origin=manual", async () => {
    const repository = createFakeRepository();
    const service = createCrmService(repository);

    await service.createCompany(validInput());

    const [stored] = await repository.list();
    expect(stored?.origin).toBe("manual");
  });

  it("lists created companies", async () => {
    const service = createCrmService(createFakeRepository());
    await service.createCompany(validInput({ name: "Empresa A" }));
    await service.createCompany(validInput({ name: "Empresa B" }));

    const companies = await service.listCompanies();

    expect(companies).toHaveLength(2);
  });

  it("finds a company by id", async () => {
    const service = createCrmService(createFakeRepository());
    const created = await service.createCompany(validInput());
    if (!created.success) throw new Error("expected creation to succeed");

    const found = await service.getCompanyById(created.data.id);

    expect(found?.id).toBe(created.data.id);
  });

  it("returns undefined for an unknown id", async () => {
    const service = createCrmService(createFakeRepository());

    const found = await service.getCompanyById("unknown");

    expect(found).toBeUndefined();
  });
});
