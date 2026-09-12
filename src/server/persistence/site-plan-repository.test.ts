import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import { companies } from "@/server/db/schema";
import {
  createSitePlanRepository,
  type SitePlanRepository,
} from "@/server/persistence/site-plan-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    companyId: "company-1",
    mainGoal: "Gerar agendamentos qualificados.",
    conversionGoal: "Agendamento via WhatsApp.",
    priorityAudience: "Famílias de classe média no bairro.",
    siteValueProposition: "Pão fresco entregue no mesmo dia.",
    featuredOffer: "Cesta de pães frescos semanal",
    primaryCta: "Peça agora",
    secondaryCtas: "Fale conosco\nConheça o cardápio",
    communicationPriorities: "Confiança\nProximidade",
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
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: SitePlanRepository;
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

  return { repository: createSitePlanRepository(db), db };
}

describe("site plan repository", () => {
  let repository: SitePlanRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new site plan and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.mainGoal).toBe("Gerar agendamentos qualificados.");
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing site plan instead of duplicating it for the same company", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      mainGoal: "Objetivo atualizado.",
      primaryCta: "Fale com a gente",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.mainGoal).toBe("Objetivo atualizado.");
    expect(updated.primaryCta).toBe("Fale com a gente");
  });

  it("finds a site plan by company id", async () => {
    await repository.upsert(baseInput());

    const found = await repository.getByCompanyId("company-1");

    expect(found?.companyId).toBe("company-1");
  });

  it("returns undefined when the company has no site plan yet", async () => {
    const found = await repository.getByCompanyId("unknown-company");

    expect(found).toBeUndefined();
  });
});
