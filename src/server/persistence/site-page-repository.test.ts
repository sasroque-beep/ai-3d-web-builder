import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import { companies } from "@/server/db/schema";
import {
  createSitePageRepository,
  type SitePageRepository,
} from "@/server/persistence/site-page-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    companyId: "company-1",
    slug: "pagina-inicial",
    name: "Página inicial",
    objective: "Apresentar a padaria e gerar pedidos.",
    journeyStage: "discovery" as const,
    position: 1,
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: SitePageRepository;
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

  return { repository: createSitePageRepository(db), db };
}

describe("site page repository", () => {
  let repository: SitePageRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new page and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.slug).toBe("pagina-inicial");
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing page instead of duplicating it for the same slug", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      name: "Página inicial atualizada",
      position: 2,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Página inicial atualizada");
    expect(updated.position).toBe(2);
  });

  it("lists all pages for a company", async () => {
    await repository.upsert(baseInput());
    await repository.upsert({
      ...baseInput(),
      slug: "sobre",
      name: "Sobre",
      position: 2,
    });

    const all = await repository.listByCompany("company-1");

    expect(all).toHaveLength(2);
  });

  it("returns an empty list when the company has no pages", async () => {
    const all = await repository.listByCompany("unknown-company");

    expect(all).toEqual([]);
  });

  it("finds a page by id", async () => {
    const created = await repository.upsert(baseInput());

    const found = await repository.getById(created.id);

    expect(found?.slug).toBe("pagina-inicial");
  });

  it("returns undefined when the page id doesn't exist", async () => {
    const found = await repository.getById("unknown-page");

    expect(found).toBeUndefined();
  });
});
