import type {
  SectionContentEligibility,
  SectionCopyFieldErrors,
  SectionCopyFormInput,
  SectionCopyRecord,
} from "@/modules/copy/types";
import { validateSectionCopyInput } from "@/modules/copy/validation";
import type { SitePageSectionRecord } from "@/modules/design/types";
import type {
  CompanySitePageSectionCopy,
  SectionCopyRepository,
} from "@/server/persistence/section-copy-repository";
import { sectionCopyRepository } from "@/server/persistence/section-copy-repository";

export type UpsertSectionCopyResult =
  | { success: true; data: SectionCopyRecord }
  | { success: false; errors: SectionCopyFieldErrors }
  | { success: false; ineligible: true; reason: string };

function toSectionCopyRecord(
  row: CompanySitePageSectionCopy,
): SectionCopyRecord {
  return row;
}

/**
 * Content only makes sense for a section that exists in the page
 * architecture (Issue #16 depends on Issue #14), so creating/updating it
 * is gated on that section existing.
 */
export function checkSectionContentEligibility(
  section: SitePageSectionRecord | undefined,
): SectionContentEligibility {
  if (!section) {
    return {
      eligible: false,
      reason: "Seção não encontrada.",
    };
  }

  return { eligible: true };
}

export function createCopyService(
  repository: SectionCopyRepository = sectionCopyRepository,
) {
  return {
    async upsertSectionCopy(
      input: SectionCopyFormInput,
      section: SitePageSectionRecord | undefined,
    ): Promise<UpsertSectionCopyResult> {
      const eligibility = checkSectionContentEligibility(section);
      if (!eligibility.eligible) {
        return { success: false, ineligible: true, reason: eligibility.reason };
      }

      const validation = validateSectionCopyInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const saved = await repository.upsert({
        ...validation.data,
        generatedBy: "manual",
      });

      return { success: true, data: toSectionCopyRecord(saved) };
    },

    async getSectionCopy(
      sectionId: string,
    ): Promise<SectionCopyRecord | undefined> {
      const row = await repository.getBySectionId(sectionId);
      return row ? toSectionCopyRecord(row) : undefined;
    },
  };
}

export const copyService = createCopyService();
