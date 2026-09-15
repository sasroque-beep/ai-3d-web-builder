import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import {
  type CompanySitePageSectionRow,
  companySitePageSections,
} from "@/server/db/schema";

export type CompanySitePageSection = CompanySitePageSectionRow;

export type UpsertCompanySitePageSection = Omit<
  CompanySitePageSection,
  "id" | "createdAt" | "updatedAt"
>;

export interface SitePageSectionRepository {
  upsert(input: UpsertCompanySitePageSection): Promise<CompanySitePageSection>;
  listByPage(pageId: string): Promise<CompanySitePageSection[]>;
  getById(id: string): Promise<CompanySitePageSection | undefined>;
}

export function createSitePageSectionRepository(
  database: Database = defaultDb,
): SitePageSectionRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanySitePageSection = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companySitePageSections)
        .values(row)
        .onConflictDoUpdate({
          target: [
            companySitePageSections.pageId,
            companySitePageSections.sectionKey,
          ],
          set: {
            name: input.name,
            objective: input.objective,
            ctaReference: input.ctaReference,
            position: input.position,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanySitePageSection;
    },

    async listByPage(pageId) {
      await ensureMigrated(database);
      return database
        .select()
        .from(companySitePageSections)
        .where(eq(companySitePageSections.pageId, pageId))
        .all();
    },

    async getById(id) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companySitePageSections)
        .where(eq(companySitePageSections.id, id))
        .limit(1);
      return row;
    },
  };
}

export const sitePageSectionRepository = createSitePageSectionRepository();
