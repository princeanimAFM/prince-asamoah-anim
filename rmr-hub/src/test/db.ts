/**
 * An in-memory Postgres (PGlite) with the app's migrations, for tests of code that uses
 * the database. Test files that use it also need: vi.mock("server-only", () => ({}));
 */
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/db/schema";

export async function useTestDb() {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await db.insert(schema.settings).values({ id: 1 });
  // getDb() (src/db) returns this connection instead of opening its own.
  (globalThis as unknown as { __rmrDb?: Promise<unknown> }).__rmrDb = Promise.resolve(db);
  return db;
}

/** Empty every business table, keeping the settings row. */
export async function resetTestDb(db: Awaited<ReturnType<typeof useTestDb>>) {
  await db.delete(schema.transactions);
  await db.delete(schema.invoiceItems);
  await db.delete(schema.timeEntries);
  await db.delete(schema.contracts);
  await db.delete(schema.invoices);
  await db.delete(schema.clients);
  await db.delete(schema.monzoAccount);
  await db.delete(schema.driveFolders);
}
