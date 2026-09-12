import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import {
  type CompanyEnrichmentFieldRow,
  companyEnrichmentFields,
} from "@/server/db/schema";

export type EnrichmentField = CompanyEnrichmentFieldRow;

export type UpsertEnrichmentField = Omit<
  EnrichmentField,
  "id" | "createdAt" | "updatedAt"
>;

export interface EnrichmentRepository {
  upsert(input: UpsertEnrichmentField): Promise<EnrichmentField>;
  listByCompany(companyId: string): Promise<EnrichmentField[]>;
}

export function createEnrichmentRepository(
  database: Database = defaultDb,
): EnrichmentRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: EnrichmentField = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companyEnrichmentFields)
        .values(row)
        .onConflictDoUpdate({
          target: [
            companyEnrichmentFields.companyId,
            companyEnrichmentFields.fieldKey,
          ],
          set: {
            value: input.value,
            source: input.source,
            status: input.status,
            collectedAt: input.collectedAt,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as EnrichmentField;
    },

    async listByCompany(companyId) {
      await ensureMigrated(database);
      return database
        .select()
        .from(companyEnrichmentFields)
        .where(eq(companyEnrichmentFields.companyId, companyId))
        .all();
    },
  };
}

export const enrichmentRepository = createEnrichmentRepository();
