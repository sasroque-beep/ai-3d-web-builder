import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import { companies } from "@/server/db/schema";
import {
  createDiagnosisRepository,
  type DiagnosisRepository,
} from "@/server/persistence/diagnosis-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    companyId: "company-1",
    summary: "Padaria de bairro com forte presença local.",
    niche: "Panificação artesanal",
    valueProposition: "Pão fresco entregue no mesmo dia.",
    differentiators: "Receita própria, ingredientes locais.",
    strengths: "Atendimento próximo\nQualidade reconhecida",
    weaknesses: "Sem presença digital",
    opportunities: "Delivery próprio",
    risksOrGaps: "Dependência de um único ponto físico",
    marketingOpportunities: "Instagram de bastidores",
    conversionOpportunities: "Pedido via WhatsApp",
    digitalMaturity: "basic" as const,
    recommendations: "Criar catálogo online",
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: DiagnosisRepository;
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

  return { repository: createDiagnosisRepository(db), db };
}

describe("diagnosis repository", () => {
  let repository: DiagnosisRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new diagnostic and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.summary).toBe("Padaria de bairro com forte presença local.");
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing diagnostic instead of duplicating it for the same company", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      summary: "Resumo atualizado após novo enriquecimento.",
      digitalMaturity: "intermediate",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.summary).toBe("Resumo atualizado após novo enriquecimento.");
    expect(updated.digitalMaturity).toBe("intermediate");
  });

  it("finds a diagnostic by company id", async () => {
    await repository.upsert(baseInput());

    const found = await repository.getByCompanyId("company-1");

    expect(found?.companyId).toBe("company-1");
  });

  it("returns undefined when the company has no diagnostic yet", async () => {
    const found = await repository.getByCompanyId("unknown-company");

    expect(found).toBeUndefined();
  });
});
