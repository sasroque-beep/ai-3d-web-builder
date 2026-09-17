import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import {
  type CompanySitePageSectionExperienceRow,
  companySitePageSectionExperiences,
} from "@/server/db/schema";

export type CompanySitePageSectionExperience =
  CompanySitePageSectionExperienceRow;

export type UpsertCompanySitePageSectionExperience = Omit<
  CompanySitePageSectionExperience,
  "id" | "createdAt" | "updatedAt"
>;

export interface Experience3DSceneConfigRepository {
  upsert(
    input: UpsertCompanySitePageSectionExperience,
  ): Promise<CompanySitePageSectionExperience>;
  getBySectionId(
    sectionId: string,
  ): Promise<CompanySitePageSectionExperience | undefined>;
}

export function createExperience3DSceneConfigRepository(
  database: Database = defaultDb,
): Experience3DSceneConfigRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanySitePageSectionExperience = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companySitePageSectionExperiences)
        .values(row)
        .onConflictDoUpdate({
          target: companySitePageSectionExperiences.sectionId,
          set: {
            presetKey: input.presetKey,
            config: input.config,
            fallback2dImageUrl: input.fallback2dImageUrl,
            fallback2dImageAlt: input.fallback2dImageAlt,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanySitePageSectionExperience;
    },

    async getBySectionId(sectionId) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companySitePageSectionExperiences)
        .where(eq(companySitePageSectionExperiences.sectionId, sectionId))
        .limit(1);
      return row;
    },
  };
}

export const experience3DSceneConfigRepository =
  createExperience3DSceneConfigRepository();
