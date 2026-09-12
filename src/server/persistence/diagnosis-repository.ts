import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import {
  type CompanyDiagnosticRow,
  companyDiagnostics,
} from "@/server/db/schema";

export type CompanyDiagnostic = CompanyDiagnosticRow;

export type UpsertCompanyDiagnostic = Omit<
  CompanyDiagnostic,
  "id" | "createdAt" | "updatedAt"
>;

export interface DiagnosisRepository {
  upsert(input: UpsertCompanyDiagnostic): Promise<CompanyDiagnostic>;
  getByCompanyId(companyId: string): Promise<CompanyDiagnostic | undefined>;
}

export function createDiagnosisRepository(
  database: Database = defaultDb,
): DiagnosisRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanyDiagnostic = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companyDiagnostics)
        .values(row)
        .onConflictDoUpdate({
          target: companyDiagnostics.companyId,
          set: {
            summary: input.summary,
            niche: input.niche,
            valueProposition: input.valueProposition,
            differentiators: input.differentiators,
            strengths: input.strengths,
            weaknesses: input.weaknesses,
            opportunities: input.opportunities,
            risksOrGaps: input.risksOrGaps,
            marketingOpportunities: input.marketingOpportunities,
            conversionOpportunities: input.conversionOpportunities,
            digitalMaturity: input.digitalMaturity,
            recommendations: input.recommendations,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanyDiagnostic;
    },

    async getByCompanyId(companyId) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companyDiagnostics)
        .where(eq(companyDiagnostics.companyId, companyId))
        .limit(1);
      return row;
    },
  };
}

export const diagnosisRepository = createDiagnosisRepository();
