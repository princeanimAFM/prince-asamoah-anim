/**
 * The backup file: every table that holds your business records, as JSON.
 * Sign-in tokens for Google and Monzo are never included.
 */
import { getTableColumns } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import * as schema from "@/db/schema";

export const BACKUP_FORMAT = "rmr-hub-backup";
export const BACKUP_VERSION = 1;

/** In the order they're restored (a table comes after the tables it refers to). */
export const BACKUP_TABLES = {
  settings: schema.settings,
  clients: schema.clients,
  invoices: schema.invoices,
  invoiceItems: schema.invoiceItems,
  timeEntries: schema.timeEntries,
  transactions: schema.transactions,
  contracts: schema.contracts,
  driveFolders: schema.driveFolders,
} satisfies Record<string, PgTable>;

export type BackupTable = keyof typeof BACKUP_TABLES;
export const TABLE_NAMES = Object.keys(BACKUP_TABLES) as BackupTable[];

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  createdAt: string;
  tables: Record<BackupTable, Record<string, unknown>[]>;
}

export function makeBackup(tables: Record<BackupTable, Record<string, unknown>[]>, now = new Date()): Backup {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: now.toISOString(), tables };
}

/**
 * Check a backup file and turn its rows back into database values: only known columns
 * are kept, and date-time columns become Dates again. Throws a readable error otherwise.
 */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't an RMR Hub backup (it isn't valid JSON).");
  }
  const b = data as Partial<Backup>;
  if (!b || b.format !== BACKUP_FORMAT || typeof b.tables !== "object" || !b.tables || Array.isArray(b.tables)) {
    throw new Error("That file isn't an RMR Hub backup.");
  }
  if (typeof b.version !== "number" || b.version > BACKUP_VERSION) {
    throw new Error("This backup was made by a newer version of RMR Hub.");
  }
  const tables = {} as Backup["tables"];
  for (const name of TABLE_NAMES) {
    // Every backup has every section. Restoring empties all tables first, so a missing
    // section must not be read as "no records".
    const rows = (b.tables as Record<string, unknown>)[name];
    if (!Array.isArray(rows)) throw new Error(`The backup's ${name} section is damaged.`);
    const columns = getTableColumns(BACKUP_TABLES[name]);
    tables[name] = rows.map((row, i) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`Row ${i + 1} of ${name} is damaged.`);
      const out: Record<string, unknown> = {};
      for (const [key, col] of Object.entries(columns)) {
        if (!(key in row)) continue;
        const v = (row as Record<string, unknown>)[key];
        if (v !== null && col.columnType === "PgTimestamp") {
          const d = new Date(String(v));
          if (Number.isNaN(d.getTime())) throw new Error(`Row ${i + 1} of ${name} has a bad date.`);
          out[key] = d;
        } else {
          out[key] = v;
        }
      }
      return out;
    });
  }
  if (tables.settings.length > 1) throw new Error("The backup's settings section is damaged.");
  return { format: BACKUP_FORMAT, version: b.version, createdAt: String(b.createdAt ?? ""), tables };
}
