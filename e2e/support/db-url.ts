/**
 * Database used by the E2E web server (`playwright.config.ts`) and by the
 * seeding helpers. `.data/` is gitignored; override with `E2E_DATABASE_URL`.
 */
export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "file:./.data/e2e.db";
