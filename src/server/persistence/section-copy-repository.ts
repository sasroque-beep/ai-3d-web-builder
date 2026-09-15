import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import {
  type CompanySitePageSectionCopyRow,
  companySitePageSectionCopies,
} from "@/server/db/schema";

export type CompanySitePageSectionCopy = CompanySitePageSectionCopyRow;

export type UpsertCompanySitePageSectionCopy = Omit<
  CompanySitePageSectionCopy,
  "id" | "createdAt" | "updatedAt"
>;

export interface SectionCopyRepository {
  upsert(
    input: UpsertCompanySitePageSectionCopy,
  ): Promise<CompanySitePageSectionCopy>;
  getBySectionId(
    sectionId: string,
  ): Promise<CompanySitePageSectionCopy | undefined>;
}

export function createSectionCopyRepository(
  database: Database = defaultDb,
): SectionCopyRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanySitePageSectionCopy = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companySitePageSectionCopies)
        .values(row)
        .onConflictDoUpdate({
          target: companySitePageSectionCopies.sectionId,
          set: {
            headline: input.headline,
            subheadline: input.subheadline,
            body: input.body,
            ctaLabel: input.ctaLabel,
            socialProofText: input.socialProofText,
            notes: input.notes,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanySitePageSectionCopy;
    },

    async getBySectionId(sectionId) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companySitePageSectionCopies)
        .where(eq(companySitePageSectionCopies.sectionId, sectionId))
        .limit(1);
      return row;
    },
  };
}

export const sectionCopyRepository = createSectionCopyRepository();
