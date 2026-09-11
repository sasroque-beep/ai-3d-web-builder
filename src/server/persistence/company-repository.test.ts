import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import {
  type CompanyRepository,
  createCompanyRepository,
} from "@/server/persistence/company-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    name: "Padaria do Bairro",
    segment: "Alimentação",
    relationshipType: "lead" as const,
    origin: "manual" as const,
    city: null,
    state: null,
    website: null,
    socialMedia: null,
    phone: null,
    email: null,
    address: null,
    description: null,
    mainProducts: null,
    targetAudience: null,
    mainGoal: null,
    notes: null,
  };
}

async function createIsolatedRepository(): Promise<CompanyRepository> {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return createCompanyRepository(db);
}

describe("company repository", () => {
  let repository: CompanyRepository;

  beforeEach(async () => {
    repository = await createIsolatedRepository();
  });

  it("creates a company and assigns id and timestamps", async () => {
    const created = await repository.create(baseInput());

    expect(created.id).toBeTruthy();
    expect(created.name).toBe("Padaria do Bairro");
    expect(created.createdAt).toBeTruthy();
    expect(created.updatedAt).toBeTruthy();
  });

  it("lists created companies", async () => {
    await repository.create(baseInput());
    await repository.create({ ...baseInput(), name: "Outra Empresa" });

    const companies = await repository.list();

    expect(companies).toHaveLength(2);
  });

  it("returns an empty list when nothing was created", async () => {
    const companies = await repository.list();

    expect(companies).toEqual([]);
  });

  it("finds a company by id", async () => {
    const created = await repository.create(baseInput());

    const found = await repository.getById(created.id);

    expect(found?.id).toBe(created.id);
  });

  it("returns undefined for an unknown id", async () => {
    const found = await repository.getById("non-existent-id");

    expect(found).toBeUndefined();
  });
});
