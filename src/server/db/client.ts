import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./schema";

const DEFAULT_DATABASE_URL = "file:./.data/local.db";
const MIGRATIONS_FOLDER = join(process.cwd(), "src/server/db/migrations");

function ensureLocalFileDirectory(url: string): void {
  if (!url.startsWith("file:")) return;
  const filePath = url.slice("file:".length);
  if (filePath === ":memory:") return;
  mkdirSync(dirname(join(process.cwd(), filePath)), { recursive: true });
}

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
ensureLocalFileDirectory(databaseUrl);

const client = createClient({ url: databaseUrl });

export const db = drizzle(client, { schema });

export type Database = typeof db;

const migratedByDb = new WeakMap<Database, Promise<void>>();

/**
 * Applies pending migrations for the given database (defaults to the shared
 * instance). Idempotent per database instance, so injecting an isolated
 * test database migrates and caches independently from `db`.
 */
export function ensureMigrated(database: Database = db): Promise<void> {
  let promise = migratedByDb.get(database);
  if (!promise) {
    promise = migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
    migratedByDb.set(database, promise);
  }
  return promise;
}
