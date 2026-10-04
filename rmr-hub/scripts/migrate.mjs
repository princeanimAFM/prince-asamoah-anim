// Applies database migrations once per deploy (run by the Netlify build), so the live
// app doesn't have to check them every time it wakes up. Locally, without DATABASE_URL,
// the app still migrates its embedded database itself.
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("migrate: DATABASE_URL not set, skipping");
  process.exit(0);
}
const u = new URL(url);
u.searchParams.delete("channel_binding");
const client = postgres(u.toString(), { prepare: false, max: 1, onnotice: () => {} });
try {
  await migrate(drizzle(client), { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await client`insert into settings (id) values (1) on conflict do nothing`;
  console.log("migrate: database is up to date");
} finally {
  await client.end();
}
