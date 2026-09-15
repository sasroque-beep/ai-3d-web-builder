import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import { type CompanySitePageRow, companySitePages } from "@/server/db/schema";

export type CompanySitePage = CompanySitePageRow;

export type UpsertCompanySitePage = Omit<
  CompanySitePage,
  "id" | "createdAt" | "updatedAt"
>;

export interface SitePageRepository {
  upsert(input: UpsertCompanySitePage): Promise<CompanySitePage>;
  listByCompany(companyId: string): Promise<CompanySitePage[]>;
  getById(id: string): Promise<CompanySitePage | undefined>;
}

export function createSitePageRepository(
  database: Database = defaultDb,
): SitePageRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanySitePage = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companySitePages)
        .values(row)
        .onConflictDoUpdate({
          target: [companySitePages.companyId, companySitePages.slug],
          set: {
            name: input.name,
            objective: input.objective,
            journeyStage: input.journeyStage,
            position: input.position,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanySitePage;
    },

    async listByCompany(companyId) {
      await ensureMigrated(database);
      return database
        .select()
        .from(companySitePages)
        .where(eq(companySitePages.companyId, companyId))
        .all();
    },

    async getById(id) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companySitePages)
        .where(eq(companySitePages.id, id))
        .limit(1);
      return row;
    },
  };
}

export const sitePageRepository = createSitePageRepository();
