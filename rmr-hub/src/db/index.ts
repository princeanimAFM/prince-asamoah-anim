import "server-only";
import path from "node:path";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

/**
 * With DATABASE_URL set the app uses that Postgres database (Supabase, Neon, …).
 * Without it, it uses an embedded Postgres (PGlite) stored in ./data, which is
 * handy for trying the app locally. The same schema and migrations serve both.
 */

const MIGRATIONS = path.join(process.cwd(), "drizzle");

async function connect() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const client = postgres(url, { prepare: false, max: 5 });
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS });
    return db;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = path.join(process.cwd(), "data", "pglite");
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db as unknown as Awaited<ReturnType<typeof import("drizzle-orm/postgres-js").drizzle<typeof schema>>>;
}

type DB = Awaited<ReturnType<typeof connect>>;

const g = globalThis as unknown as { __rmrDb?: Promise<DB> };

export function getDb(): Promise<DB> {
  if (!g.__rmrDb) {
    g.__rmrDb = connect().then(async (db) => {
      await db.insert(schema.settings).values({ id: 1 }).onConflictDoNothing();
      return db;
    });
    g.__rmrDb.catch(() => {
      g.__rmrDb = undefined;
    });
  }
  return g.__rmrDb;
}

export { schema };
