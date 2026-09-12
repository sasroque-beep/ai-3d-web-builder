import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import { type CompanySitePlanRow, companySitePlans } from "@/server/db/schema";

export type CompanySitePlan = CompanySitePlanRow;

export type UpsertCompanySitePlan = Omit<
  CompanySitePlan,
  "id" | "createdAt" | "updatedAt"
>;

export interface SitePlanRepository {
  upsert(input: UpsertCompanySitePlan): Promise<CompanySitePlan>;
  getByCompanyId(companyId: string): Promise<CompanySitePlan | undefined>;
}

export function createSitePlanRepository(
  database: Database = defaultDb,
): SitePlanRepository {
  return {
    async upsert(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: CompanySitePlan = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const rows = await database
        .insert(companySitePlans)
        .values(row)
        .onConflictDoUpdate({
          target: companySitePlans.companyId,
          set: {
            mainGoal: input.mainGoal,
            conversionGoal: input.conversionGoal,
            priorityAudience: input.priorityAudience,
            siteValueProposition: input.siteValueProposition,
            featuredOffer: input.featuredOffer,
            primaryCta: input.primaryCta,
            secondaryCtas: input.secondaryCtas,
            communicationPriorities: input.communicationPriorities,
            objectionsToAddress: input.objectionsToAddress,
            socialProofNeeded: input.socialProofNeeded,
            trustElements: input.trustElements,
            requiredFeatures: input.requiredFeatures,
            requiredIntegrations: input.requiredIntegrations,
            leadCaptureRequirements: input.leadCaptureRequirements,
            contactRequirements: input.contactRequirements,
            conversionRequirements: input.conversionRequirements,
            contentRequirements: input.contentRequirements,
            visualRequirements: input.visualRequirements,
            experience3dOpportunities: input.experience3dOpportunities,
            journeyStagesToSupport: input.journeyStagesToSupport,
            strategicNotes: input.strategicNotes,
            generatedBy: input.generatedBy,
            updatedAt: now,
          },
        })
        .returning();

      // An insert…onConflictDoUpdate always affects exactly the one row it
      // targets, so `returning()` always yields exactly one row here.
      return rows[0] as CompanySitePlan;
    },

    async getByCompanyId(companyId) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companySitePlans)
        .where(eq(companySitePlans.companyId, companyId))
        .limit(1);
      return row;
    },
  };
}

export const sitePlanRepository = createSitePlanRepository();
