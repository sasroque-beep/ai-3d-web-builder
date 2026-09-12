import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import { type CompanyStrategyRow, companyStrategies } from "@/server/db/schema";

export type CompanyStrategy = CompanyStrategyRow;

export type UpsertCompanyStrategy = Omit<
  CompanyStrategy,
  "id" | "createdAt" | "updatedAt"
>;

export interface StrategyRepository {
  upsert(input: UpsertCompanyStrategy): Promise<CompanyStrategy>;
  getByCompanyId(companyId: string): Promise<CompanyStrategy | undefined>;
}

export function createStrategyRepository(
  database: Database = defaultDb,
): StrategyRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanyStrategy = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companyStrategies)
        .values(row)
        .onConflictDoUpdate({
          target: companyStrategies.companyId,
          set: {
            marketingObjective: input.marketingObjective,
            conversionObjective: input.conversionObjective,
            targetAudience: input.targetAudience,
            painPoints: input.painPoints,
            desires: input.desires,
            valueProposition: input.valueProposition,
            differentiators: input.differentiators,
            objections: input.objections,
            salesArguments: input.salesArguments,
            communicationTone: input.communicationTone,
            mainOffer: input.mainOffer,
            desiredConversionActions: input.desiredConversionActions,
            ctas: input.ctas,
            journeyDiscovery: input.journeyDiscovery,
            journeyConsideration: input.journeyConsideration,
            journeyDecision: input.journeyDecision,
            journeyConversion: input.journeyConversion,
            journeyPostConversion: input.journeyPostConversion,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanyStrategy;
    },

    async getByCompanyId(companyId) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companyStrategies)
        .where(eq(companyStrategies.companyId, companyId))
        .limit(1);
      return row;
    },
  };
}

export const strategyRepository = createStrategyRepository();
