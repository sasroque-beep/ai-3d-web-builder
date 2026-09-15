import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import {
  type CompanySiteThemeRow,
  companySiteThemes,
} from "@/server/db/schema";

export type CompanySiteTheme = CompanySiteThemeRow;

export type UpsertCompanySiteTheme = Omit<
  CompanySiteTheme,
  "id" | "createdAt" | "updatedAt"
>;

export interface SiteThemeRepository {
  upsert(input: UpsertCompanySiteTheme): Promise<CompanySiteTheme>;
  getByCompanyId(companyId: string): Promise<CompanySiteTheme | undefined>;
}

export function createSiteThemeRepository(
  database: Database = defaultDb,
): SiteThemeRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanySiteTheme = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companySiteThemes)
        .values(row)
        .onConflictDoUpdate({
          target: companySiteThemes.companyId,
          set: {
            primaryColor: input.primaryColor,
            secondaryColor: input.secondaryColor,
            accentColor: input.accentColor,
            backgroundColor: input.backgroundColor,
            headingFont: input.headingFont,
            bodyFont: input.bodyFont,
            visualStyle: input.visualStyle,
            colorModePreference: input.colorModePreference,
            spacingDensity: input.spacingDensity,
            ctaVisualGuidelines: input.ctaVisualGuidelines,
            visualReferences: input.visualReferences,
            accessibilityRequirements: input.accessibilityRequirements,
            notes: input.notes,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanySiteTheme;
    },

    async getByCompanyId(companyId) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companySiteThemes)
        .where(eq(companySiteThemes.companyId, companyId))
        .limit(1);
      return row;
    },
  };
}

export const siteThemeRepository = createSiteThemeRepository();
