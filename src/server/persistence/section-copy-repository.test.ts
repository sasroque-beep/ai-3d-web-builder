import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import {
  companies,
  companySitePageSections,
  companySitePages,
} from "@/server/db/schema";
import {
  createSectionCopyRepository,
  type SectionCopyRepository,
} from "@/server/persistence/section-copy-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    sectionId: "section-1",
    headline: "Pão fresco todos os dias",
    subheadline: "Direto do forno para a sua mesa.",
    body: "Produzimos nosso pão artesanal diariamente.",
    ctaLabel: "Peça agora",
    socialProofText: "Mais de 500 clientes satisfeitos no bairro.",
    notes: "Manter tom acolhedor.",
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: SectionCopyRepository;
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

  await db.insert(companySitePages).values({
    id: "page-1",
    companyId: "company-1",
    slug: "pagina-inicial",
    name: "Página inicial",
    objective: null,
    journeyStage: null,
    position: 1,
  });

  await db.insert(companySitePageSections).values({
    id: "section-1",
    pageId: "page-1",
    sectionKey: "hero",
    name: "Hero",
    objective: null,
    ctaReference: null,
    position: 1,
  });

  return { repository: createSectionCopyRepository(db), db };
}

describe("section copy repository", () => {
  let repository: SectionCopyRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates new content and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.headline).toBe("Pão fresco todos os dias");
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing content instead of duplicating it for the same section", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      headline: "Headline atualizado",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.headline).toBe("Headline atualizado");
  });

  it("finds content by section id", async () => {
    await repository.upsert(baseInput());

    const found = await repository.getBySectionId("section-1");

    expect(found?.sectionId).toBe("section-1");
  });

  it("returns undefined when the section has no content yet", async () => {
    const found = await repository.getBySectionId("unknown-section");

    expect(found).toBeUndefined();
  });
});
