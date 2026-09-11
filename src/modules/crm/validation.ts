import type {
  CompanyFormInput,
  FieldErrors,
  OPTIONAL_TEXT_FIELDS,
  RelationshipType,
} from "@/modules/crm/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/[^\s]+\.[^\s]+$/i;
const PHONE_PATTERN = /^[0-9()+\-.\s]{8,20}$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;

export type ValidatedCompany = {
  name: string;
  segment: string;
  relationshipType: RelationshipType;
} & Record<(typeof OPTIONAL_TEXT_FIELDS)[number], string | null>;

export type ValidationResult =
  | { success: true; data: ValidatedCompany }
  | { success: false; errors: FieldErrors };

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateCompanyInput(
  input: CompanyFormInput,
): ValidationResult {
  const errors: FieldErrors = {};

  const name = input.name.trim();
  if (!name) {
    errors.name = "Informe o nome da empresa.";
  }

  const segment = input.segment.trim();
  if (!segment) {
    errors.segment = "Informe o segmento/nicho da empresa.";
  }

  const relationshipType = input.relationshipType.trim();
  if (relationshipType !== "client" && relationshipType !== "lead") {
    errors.relationshipType = "Selecione se é uma empresa cliente ou lead.";
  }

  const email = normalizeOptional(input.email);
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  const website = normalizeOptional(input.website);
  if (website && !URL_PATTERN.test(website)) {
    errors.website =
      "Informe uma URL válida, iniciando com http:// ou https://.";
  }

  const phone = normalizeOptional(input.phone);
  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Informe um telefone/WhatsApp válido.";
  }

  const state = normalizeOptional(input.state);
  if (state && !STATE_PATTERN.test(state)) {
    errors.state = "Informe a UF com 2 letras (ex.: SP).";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      segment,
      relationshipType: relationshipType as RelationshipType,
      city: normalizeOptional(input.city),
      state: state ? state.toUpperCase() : null,
      website,
      socialMedia: normalizeOptional(input.socialMedia),
      phone,
      email,
      address: normalizeOptional(input.address),
      description: normalizeOptional(input.description),
      mainProducts: normalizeOptional(input.mainProducts),
      targetAudience: normalizeOptional(input.targetAudience),
      mainGoal: normalizeOptional(input.mainGoal),
      notes: normalizeOptional(input.notes),
    },
  };
}
