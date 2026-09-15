import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import { companies, companySitePages } from "@/server/db/schema";
import {
  createSitePageSectionRepository,
  type SitePageSectionRepository,
} from "@/server/persistence/site-page-section-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    pageId: "page-1",
    sectionKey: "hero",
    name: "Hero",
    objective: "Comunicar a proposta de valor imediatamente.",
    ctaReference: "Peça agora",
    position: 1,
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: SitePageSectionRepository;
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

  return { repository: createSitePageSectionRepository(db), db };
}

describe("site page section repository", () => {
  let repository: SitePageSectionRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new section and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.sectionKey).toBe("hero");
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing section instead of duplicating it for the same key", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      name: "Hero atualizado",
      position: 3,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Hero atualizado");
    expect(updated.position).toBe(3);
  });

  it("lists all sections for a page", async () => {
    await repository.upsert(baseInput());
    await repository.upsert({
      ...baseInput(),
      sectionKey: "oferta",
      name: "Oferta",
      position: 2,
    });

    const all = await repository.listByPage("page-1");

    expect(all).toHaveLength(2);
  });

  it("returns an empty list when the page has no sections", async () => {
    const all = await repository.listByPage("unknown-page");

    expect(all).toEqual([]);
  });
});
