import type { SitePageSectionRecord } from "@/modules/design/types";
import type { Experience3DEligibility } from "@/modules/experience-3d/types";

/**
 * A 3D experience only makes sense for a section that already exists in
 * the page architecture — same rule and return shape as copy's
 * `checkSectionContentEligibility`, reusing `SitePageSectionRecord`
 * exactly as that module does. This isn't a violation of experience-3d's
 * module isolation: that decision is about the renderer (R3F/Drei/
 * Three.js) never leaking into other modules, not about the section
 * type from the page architecture.
 */
export function checkExperience3DEligibility(
  section: SitePageSectionRecord | undefined,
): Experience3DEligibility {
  if (!section) {
    return {
      eligible: false,
      reason:
        "A seção precisa existir na arquitetura de páginas antes de configurar uma experiência 3D.",
    };
  }

  return { eligible: true };
}
