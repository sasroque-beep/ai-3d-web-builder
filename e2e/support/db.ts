import { randomUUID } from "node:crypto";

import { createClient } from "@libsql/client";
import type { Page } from "@playwright/test";

import { E2E_DATABASE_URL } from "./db-url";

export interface SeededSite {
  companyId: string;
  companyName: string;
  sectionIds: [string, string];
}

/**
 * Seeds a company with one page and two sections straight into the E2E
 * database — the minimum the site-builder preview needs. Reaching this
 * state through the UI would chain research → diagnosis → strategy →
 * site planning → design, which other flows already cover; here it would
 * only add flakiness. The app migrates lazily, so a request is made first.
 */
export async function seedSiteWithSections(page: Page): Promise<SeededSite> {
  const response = await page.request.get("/leads");
  if (!response.ok()) {
    throw new Error(`warm-up request failed: HTTP ${response.status()}`);
  }

  const companyId = randomUUID();
  const pageId = randomUUID();
  const sectionIds: [string, string] = [randomUUID(), randomUUID()];
  const companyName = `E2E 3D ${companyId.slice(0, 8)}`;

  const client = createClient({ url: E2E_DATABASE_URL });
  try {
    await client.batch(
      [
        {
          sql: "insert into companies (id, name, segment) values (?, ?, ?)",
          args: [companyId, companyName, "Marketing"],
        },
        {
          sql: "insert into company_site_pages (id, company_id, slug, name, position) values (?, ?, 'home', 'Home', 0)",
          args: [pageId, companyId],
        },
        {
          sql: "insert into company_site_page_sections (id, page_id, section_key, name, position) values (?, ?, 'hero', 'Hero', 0), (?, ?, 'beneficios', 'Benefícios', 1)",
          args: [sectionIds[0], pageId, sectionIds[1], pageId],
        },
      ],
      "write",
    );
  } finally {
    client.close();
  }

  return { companyId, companyName, sectionIds };
}
