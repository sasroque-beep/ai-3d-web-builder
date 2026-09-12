import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import { companies } from "@/server/db/schema";
import {
  createEnrichmentRepository,
  type EnrichmentRepository,
} from "@/server/persistence/enrichment-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    companyId: "company-1",
    fieldKey: "tradeName" as const,
    value: "Padaria do Zé",
    source: "manual",
    status: "confirmed" as const,
    collectedAt: "2026-01-01T00:00:00.000Z",
  };
}

async function createIsolatedRepository(): Promise<{
  repository: EnrichmentRepository;
  db: ReturnType<typeof drizzle>;
}> {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  await db.insert(companies).values({
    id: "company-1",
    name: "Padaria do Bairro",
    segment: "Alimentação",
    relationshipType: "lead",
    origin: "manual",
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
  });

  return { repository: createEnrichmentRepository(db), db };
}

describe("enrichment repository", () => {
  let repository: EnrichmentRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new enrichment field and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.value).toBe("Padaria do Zé");
    expect(saved.status).toBe("confirmed");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing field instead of duplicating it on the same key", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      value: "Padaria do Zé Ltda",
      status: "unverified" as const,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.value).toBe("Padaria do Zé Ltda");
    expect(updated.status).toBe("unverified");

    const all = await repository.listByCompany("company-1");
    expect(all).toHaveLength(1);
  });

  it("lists all enrichment fields for a company", async () => {
    await repository.upsert(baseInput());
    await repository.upsert({
      ...baseInput(),
      fieldKey: "businessHours" as const,
      value: "Seg a Sex, 8h-18h",
    });

    const all = await repository.listByCompany("company-1");

    expect(all).toHaveLength(2);
  });

  it("returns an empty list when the company has no enrichment fields", async () => {
    const all = await repository.listByCompany("unknown-company");

    expect(all).toEqual([]);
  });
});
