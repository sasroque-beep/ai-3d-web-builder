import { describe, expect, it } from "vitest";

import type { SitePageSectionRecord } from "@/modules/design/types";
import { checkExperience3DEligibility } from "@/modules/experience-3d/service";

const SECTION: SitePageSectionRecord = {
  id: "section-1",
  pageId: "page-1",
  sectionKey: "hero",
  name: "Hero",
  objective: "Apresentar a empresa",
  ctaReference: null,
  position: 1,
  generatedBy: "manual",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("checkExperience3DEligibility", () => {
  it("is eligible when the section exists", () => {
    expect(checkExperience3DEligibility(SECTION)).toEqual({ eligible: true });
  });

  it("is not eligible when the section doesn't exist", () => {
    const result = checkExperience3DEligibility(undefined);

    expect(result.eligible).toBe(false);
    if (!result.eligible) {
      expect(result.reason).toBeTruthy();
    }
  });
});
