import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import { companies } from "@/server/db/schema";
import {
  createStrategyRepository,
  type StrategyRepository,
} from "@/server/persistence/strategy-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    companyId: "company-1",
    marketingObjective: "Aumentar reconhecimento de marca na região.",
    conversionObjective: "Gerar agendamentos via WhatsApp.",
    targetAudience: "Famílias de classe média no bairro.",
    painPoints: "Falta de tempo\nDesconfiança de novos fornecedores",
    desires: "Praticidade\nConfiança",
    valueProposition: "Pão fresco entregue no mesmo dia.",
    differentiators: "Receita própria, ingredientes locais.",
    objections: "Preço acima da concorrência",
    salesArguments: "Qualidade comprovada por anos de bairro",
    communicationTone: "Acolhedor e próximo",
    mainOffer: "Cesta de pães frescos semanal",
    desiredConversionActions: "Pedido via WhatsApp\nVisita à loja",
    ctas: "Peça agora\nFale conosco",
    journeyDiscovery: "Anúncio local no Instagram",
    journeyConsideration: "Depoimentos de clientes no site",
    journeyDecision: "Comparação de cesta com concorrentes",
    journeyConversion: "Botão de pedido via WhatsApp",
    journeyPostConversion: "Pesquisa de satisfação pós-entrega",
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: StrategyRepository;
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

  return { repository: createStrategyRepository(db), db };
}

describe("strategy repository", () => {
  let repository: StrategyRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new strategy and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.marketingObjective).toBe(
      "Aumentar reconhecimento de marca na região.",
    );
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing strategy instead of duplicating it for the same company", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      marketingObjective: "Objetivo de marketing atualizado.",
      journeyConversion: "Novo CTA de conversão",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.marketingObjective).toBe(
      "Objetivo de marketing atualizado.",
    );
    expect(updated.journeyConversion).toBe("Novo CTA de conversão");
  });

  it("finds a strategy by company id", async () => {
    await repository.upsert(baseInput());

    const found = await repository.getByCompanyId("company-1");

    expect(found?.companyId).toBe("company-1");
  });

  it("returns undefined when the company has no strategy yet", async () => {
    const found = await repository.getByCompanyId("unknown-company");

    expect(found).toBeUndefined();
  });
});
