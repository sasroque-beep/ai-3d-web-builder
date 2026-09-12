import type { DiagnosisRecord } from "@/modules/research/diagnosis/types";
import type {
  StrategyEligibility,
  StrategyFieldErrors,
  StrategyFormInput,
  StrategyRecord,
} from "@/modules/strategy/types";
import { validateStrategyInput } from "@/modules/strategy/validation";
import type {
  CompanyStrategy,
  StrategyRepository,
} from "@/server/persistence/strategy-repository";
import { strategyRepository } from "@/server/persistence/strategy-repository";

export type UpsertStrategyResult =
  | { success: true; data: StrategyRecord }
  | { success: false; errors: StrategyFieldErrors }
  | { success: false; ineligible: true; reason: string };

function toStrategyRecord(row: CompanyStrategy): StrategyRecord {
  return row;
}

/**
 * A marketing/conversion strategy only makes sense once the company has a
 * strategic diagnosis to build on (Issue #10 depends on Issue #8), so
 * creating/updating one is gated on a diagnosis existing for the company.
 */
export function checkStrategyEligibility(
  diagnosis: DiagnosisRecord | undefined,
): StrategyEligibility {
  if (!diagnosis) {
    return {
      eligible: false,
      reason:
        "Gere o diagnóstico estratégico da empresa antes de criar a estratégia de marketing e conversão.",
    };
  }

  return { eligible: true };
}

export function createStrategyService(
  repository: StrategyRepository = strategyRepository,
) {
  return {
    async upsertStrategy(
      input: StrategyFormInput,
      diagnosis: DiagnosisRecord | undefined,
    ): Promise<UpsertStrategyResult> {
      const eligibility = checkStrategyEligibility(diagnosis);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateStrategyInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const saved = await repository.upsert({
        ...validation.data,
        generatedBy: "manual",
      });

      return { success: true, data: toStrategyRecord(saved) };
    },

    async getStrategy(companyId: string): Promise<StrategyRecord | undefined> {
      const row = await repository.getByCompanyId(companyId);
      return row ? toStrategyRecord(row) : undefined;
    },
  };
}

export const strategyService = createStrategyService();
