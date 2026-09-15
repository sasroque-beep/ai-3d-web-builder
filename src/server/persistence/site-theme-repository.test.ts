import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeEach, describe, expect, it } from "vitest";

import * as schema from "@/server/db/schema";
import { companies } from "@/server/db/schema";
import {
  createSiteThemeRepository,
  type SiteThemeRepository,
} from "@/server/persistence/site-theme-repository";

const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function baseInput() {
  return {
    companyId: "company-1",
    primaryColor: "#8B5E3C",
    secondaryColor: "#F4E9DA",
    accentColor: "#D97706",
    backgroundColor: "#FFFDF9",
    headingFont: "Fraunces",
    bodyFont: "Inter",
    visualStyle: "Acolhedor e artesanal",
    colorModePreference: "light" as const,
    spacingDensity: "comfortable" as const,
    ctaVisualGuidelines: "Botão sólido laranja, cantos arredondados",
    visualReferences: "Padarias artesanais europeias",
    accessibilityRequirements: "Contraste mínimo AA",
    notes: "Priorizar mobile-first.",
    generatedBy: "manual" as const,
  };
}

async function createIsolatedRepository(): Promise<{
  repository: SiteThemeRepository;
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

  return { repository: createSiteThemeRepository(db), db };
}

describe("site theme repository", () => {
  let repository: SiteThemeRepository;

  beforeEach(async () => {
    ({ repository } = await createIsolatedRepository());
  });

  it("creates a new theme and assigns id and timestamps", async () => {
    const saved = await repository.upsert(baseInput());

    expect(saved.id).toBeTruthy();
    expect(saved.primaryColor).toBe("#8B5E3C");
    expect(saved.generatedBy).toBe("manual");
    expect(saved.createdAt).toBeTruthy();
    expect(saved.updatedAt).toBeTruthy();
  });

  it("updates the existing theme instead of duplicating it for the same company", async () => {
    const created = await repository.upsert(baseInput());
    const updated = await repository.upsert({
      ...baseInput(),
      primaryColor: "#000000",
      colorModePreference: "dark",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.primaryColor).toBe("#000000");
    expect(updated.colorModePreference).toBe("dark");
  });

  it("finds a theme by company id", async () => {
    await repository.upsert(baseInput());

    const found = await repository.getByCompanyId("company-1");

    expect(found?.companyId).toBe("company-1");
  });

  it("returns undefined when the company has no theme yet", async () => {
    const found = await repository.getByCompanyId("unknown-company");

    expect(found).toBeUndefined();
  });
});
