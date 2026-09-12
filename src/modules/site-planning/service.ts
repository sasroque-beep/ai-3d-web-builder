import type {
  SitePlanEligibility,
  SitePlanFieldErrors,
  SitePlanFormInput,
  SitePlanRecord,
} from "@/modules/site-planning/types";
import { validateSitePlanInput } from "@/modules/site-planning/validation";
import type { StrategyRecord } from "@/modules/strategy/types";
import type {
  CompanySitePlan,
  SitePlanRepository,
} from "@/server/persistence/site-plan-repository";
import { sitePlanRepository } from "@/server/persistence/site-plan-repository";

export type UpsertSitePlanResult =
  | { success: true; data: SitePlanRecord }
  | { success: false; errors: SitePlanFieldErrors }
  | { success: false; ineligible: true; reason: string };

function toSitePlanRecord(row: CompanySitePlan): SitePlanRecord {
  return row;
}

/**
 * A site plan only makes sense once the company has a marketing/conversion
 * strategy to build on (Issue #12 depends on Issue #10), so creating/
 * updating one is gated on a strategy existing for the company.
 */
export function checkSitePlanningEligibility(
  strategy: StrategyRecord | undefined,
): SitePlanEligibility {
  if (!strategy) {
    return {
      eligible: false,
      reason:
        "Crie a estratégia de marketing e conversão da empresa antes de gerar o planejamento estratégico do site.",
    };
  }

  return { eligible: true };
}

export function createSitePlanningService(
  repository: SitePlanRepository = sitePlanRepository,
) {
  return {
    async upsertSitePlan(
      input: SitePlanFormInput,
      strategy: StrategyRecord | undefined,
    ): Promise<UpsertSitePlanResult> {
      const eligibility = checkSitePlanningEligibility(strategy);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateSitePlanInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const saved = await repository.upsert({
        ...validation.data,
        generatedBy: "manual",
      });

      return { success: true, data: toSitePlanRecord(saved) };
    },

    async getSitePlan(companyId: string): Promise<SitePlanRecord | undefined> {
      const row = await repository.getByCompanyId(companyId);
      return row ? toSitePlanRecord(row) : undefined;
    },
  };
}

export const sitePlanningService = createSitePlanningService();
