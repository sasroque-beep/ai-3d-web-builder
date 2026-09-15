/** Raw string values as they arrive from an HTML form submission. */
export interface SectionCopyFormInput {
  sectionId: string;
  headline: string;
  subheadline: string;
  body: string;
  ctaLabel: string;
  socialProofText: string;
  notes: string;
}

export const OPTIONAL_TEXT_FIELDS = [
  "headline",
  "subheadline",
  "body",
  "ctaLabel",
  "socialProofText",
  "notes",
] as const satisfies readonly (keyof SectionCopyFormInput)[];

export type SectionCopyFieldErrors = Partial<
  Record<keyof SectionCopyFormInput, string>
>;

export type UpsertSectionCopyActionState =
  | { status: "idle" }
  | { status: "error"; errors: SectionCopyFieldErrors }
  | { status: "ineligible"; reason: string };

export const initialUpsertSectionCopyActionState: UpsertSectionCopyActionState =
  {
    status: "idle",
  };

export interface SectionCopyRecord {
  id: string;
  sectionId: string;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  ctaLabel: string | null;
  socialProofText: string | null;
  notes: string | null;
  generatedBy: "manual" | "ai";
  createdAt: string;
  updatedAt: string;
}

export type SectionContentEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };
