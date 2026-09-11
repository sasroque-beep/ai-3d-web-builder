export type RelationshipType = "client" | "lead";

/** Raw string values as they arrive from an HTML form submission. */
export interface CompanyFormInput {
  name: string;
  segment: string;
  relationshipType: string;
  city: string;
  state: string;
  website: string;
  socialMedia: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  mainProducts: string;
  targetAudience: string;
  mainGoal: string;
  notes: string;
}

export const OPTIONAL_TEXT_FIELDS = [
  "city",
  "state",
  "website",
  "socialMedia",
  "phone",
  "email",
  "address",
  "description",
  "mainProducts",
  "targetAudience",
  "mainGoal",
  "notes",
] as const satisfies readonly (keyof CompanyFormInput)[];

export type FieldErrors = Partial<Record<keyof CompanyFormInput, string>>;

export type CreateCompanyActionState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors; values: CompanyFormInput };

/**
 * Kept out of actions.ts: a "use server" module may only export async
 * functions, and this is a plain constant consumed by the client form.
 */
export const initialCreateCompanyActionState: CreateCompanyActionState = {
  status: "idle",
};

export interface CompanyRecord {
  id: string;
  name: string;
  segment: string;
  relationshipType: RelationshipType;
  city: string | null;
  state: string | null;
  website: string | null;
  socialMedia: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  mainProducts: string | null;
  targetAudience: string | null;
  mainGoal: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
