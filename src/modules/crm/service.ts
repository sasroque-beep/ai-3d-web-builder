import type {
  CompanyFormInput,
  CompanyRecord,
  FieldErrors,
} from "@/modules/crm/types";
import { validateCompanyInput } from "@/modules/crm/validation";
import type {
  Company,
  CompanyRepository,
} from "@/server/persistence/company-repository";
import { companyRepository } from "@/server/persistence/company-repository";

export type CreateCompanyResult =
  | { success: true; data: CompanyRecord }
  | { success: false; errors: FieldErrors };

function toCompanyRecord(row: Company): CompanyRecord {
  const { origin: _origin, ...record } = row;
  return record;
}

export function createCrmService(
  repository: CompanyRepository = companyRepository,
) {
  return {
    async createCompany(input: CompanyFormInput): Promise<CreateCompanyResult> {
      const validation = validateCompanyInput(input);
      if (!validation.success) {
        return { success: false, errors: validation.errors };
      }

      const created = await repository.create({
        ...validation.data,
        origin: "manual",
      });

      return { success: true, data: toCompanyRecord(created) };
    },

    async listCompanies(): Promise<CompanyRecord[]> {
      const rows = await repository.list();
      return rows.map(toCompanyRecord);
    },

    async getCompanyById(id: string): Promise<CompanyRecord | undefined> {
      const row = await repository.getById(id);
      return row ? toCompanyRecord(row) : undefined;
    },
  };
}

export const crmService = createCrmService();
