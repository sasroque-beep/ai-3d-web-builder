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
  createExperience3DSceneConfigRepository,
  type Experience3DSceneConfigRepository,
} from "@/server/persistence/experience-3d-scene-config-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    sectionId: "section-1",
    presetKey: "hero-showcase",
    config: { intensity: "standard", assets: ["model.glb"] },
    fallback2dImageUrl: "https://cdn.example.com/fallback.png",
    fallback2dImageAlt: "Ilustração do produto em destaque",
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: Experience3DSceneConfigRepository;
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

  return { repository: createExperience3DSceneConfigRepository(db), db };
}

describe("experience 3D scene config repository", () => {
  let repository: Experience3DSceneConfigRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new scene config and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.presetKey).toBe("hero-showcase");
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("round-trips the config JSON payload as an object", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.config).toEqual({
      intensity: "standard",
      assets: ["model.glb"],
    });
  });

  it("updates the existing scene config instead of duplicating it for the same section", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      presetKey: "scroll-parallax",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.presetKey).toBe("scroll-parallax");
  });

  it("finds a scene config by section id", async () => {
    await repository.upsert(baseInput());

    const found = await repository.getBySectionId("section-1");

    expect(found?.sectionId).toBe("section-1");
  });

  it("returns undefined when the section has no scene config yet", async () => {
    const found = await repository.getBySectionId("unknown-section");

    expect(found).toBeUndefined();
  });
});
