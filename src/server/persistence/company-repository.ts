import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import {
  type Database,
  db as defaultDb,
  ensureMigrated,
} from "@/server/db/client";
import { type CompanyRow, companies } from "@/server/db/schema";

export type Company = CompanyRow;

export type NewCompany = Omit<Company, "id" | "createdAt" | "updatedAt">;

export interface CompanyRepository {
  create(input: NewCompany): Promise<Company>;
  list(): Promise<Company[]>;
  getById(id: string): Promise<Company | undefined>;
}

export function createCompanyRepository(
  database: Database = defaultDb,
): CompanyRepository {
  return {
    async create(input) {
      await ensureMigrated(database);
      const now = new Date().toISOString();
      const row: Company = {
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      await database.insert(companies).values(row);
      return row;
    },

    async list() {
      await ensureMigrated(database);
      return database.select().from(companies).all();
    },

    async getById(id) {
      await ensureMigrated(database);
      const [row] = await database
        .select()
        .from(companies)
        .where(eq(companies.id, id))
        .limit(1);
      return row;
    },
  };
}

export const companyRepository = createCompanyRepository();
