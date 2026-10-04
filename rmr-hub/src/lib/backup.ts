import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { BACKUP_TABLES, type Backup, makeBackup, parseBackup, TABLE_NAMES } from "@/lib/backup-format";
import { toCsv } from "@/lib/csv";
import { invoiceTotal } from "@/lib/data";
import { saveToDrive } from "@/lib/google";

/**
 * Daily backup to Google Drive:
 *   RMR Dev Works/Backups/2026/RMR Hub backup 2026-10-04.json   (everything; restorable)
 *   RMR Dev Works/Backups/Spreadsheets/Clients.csv, Invoices.csv, …  (latest, to open in a spreadsheet)
 */

type Rows = Record<string, unknown>[];

export async function collectBackup(): Promise<Backup> {
  const db = await getDb();
  const tables = {} as Backup["tables"];
  for (const name of TABLE_NAMES) {
    tables[name] = (await db.select().from(BACKUP_TABLES[name])) as Rows;
  }
  return makeBackup(tables);
}

function spreadsheets(b: Backup): Record<string, string> {
  const t = b.tables as unknown as {
    clients: (typeof schema.clients.$inferSelect)[];
    invoices: (typeof schema.invoices.$inferSelect)[];
    invoiceItems: (typeof schema.invoiceItems.$inferSelect)[];
    timeEntries: (typeof schema.timeEntries.$inferSelect)[];
    transactions: (typeof schema.transactions.$inferSelect)[];
    contracts: (typeof schema.contracts.$inferSelect)[];
  };
  const client = new Map(t.clients.map((c) => [c.id, c.company || c.name]));
  const invoice = new Map(t.invoices.map((i) => [i.id, i.number]));
  const pounds = (p: number) => (p / 100).toFixed(2);
  const day = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  return {
    "Clients.csv": toCsv(
      ["Name", "Company", "Email", "Phone", "Address", "Notes", "Archived"],
      t.clients.map((c) => [c.name, c.company, c.email, c.phone, c.address, c.notes, c.archived ? "yes" : "no"]),
    ),
    "Invoices.csv": toCsv(
      ["Number", "Client", "Issued", "Due", "Status", "Total (GBP)", "Paid on", "Note"],
      t.invoices.map((i) => [
        i.number,
        client.get(i.clientId) ?? "",
        i.issueDate,
        i.dueDate,
        i.status,
        pounds(invoiceTotal(t.invoiceItems.filter((x) => x.invoiceId === i.id))),
        i.paidDate ?? "",
        i.notes,
      ]),
    ),
    "Invoice lines.csv": toCsv(
      ["Invoice", "Description", "Quantity", "Price (GBP)"],
      t.invoiceItems.map((x) => [invoice.get(x.invoiceId) ?? "", x.description, x.quantity / 100, pounds(x.unitPrice)]),
    ),
    "Money in and out.csv": toCsv(
      ["Date", "Description", "Type", "Amount (GBP)", "Invoice", "Source"],
      t.transactions.map((x) => [x.date, x.description, x.kind, pounds(x.amount), x.invoiceId ? invoice.get(x.invoiceId) : "", x.source]),
    ),
    "Hours.csv": toCsv(
      ["Date", "Client", "Hours", "Description", "Billable"],
      t.timeEntries.map((e) => [
        e.date,
        e.clientId ? client.get(e.clientId) : "",
        (e.minutes / 60).toFixed(2),
        e.description,
        e.billable ? "yes" : "no",
      ]),
    ),
    "Contracts.csv": toCsv(
      ["Title", "Client", "Status", "Sent", "Signed", "Signed by"],
      t.contracts.map((c) => [c.title, client.get(c.clientId) ?? "", c.status, day(c.sentAt), day(c.signedAt), c.signerName ?? ""]),
    ),
  };
}

export async function runBackup(): Promise<{ link: string; date: string }> {
  const backup = await collectBackup();
  const date = backup.createdAt.slice(0, 10);
  const enc = new TextEncoder();
  const saved = await saveToDrive({
    folder: `Backups/${date.slice(0, 4)}`,
    name: `RMR Hub backup ${date}.json`,
    mimeType: "application/json",
    data: enc.encode(JSON.stringify(backup)),
    remember: true,
  });
  // The first file creates the folder if needed; the rest upload together, which is quicker.
  const [first, ...rest] = Object.entries(spreadsheets(backup));
  const save = ([name, csv]: [string, string]) =>
    saveToDrive({ folder: "Backups/Spreadsheets", name, mimeType: "text/csv", data: enc.encode(csv), remember: true });
  await save(first);
  await Promise.all(rest.map(save));
  const db = await getDb();
  await db.update(schema.settings).set({ lastBackupAt: new Date() }).where(eq(schema.settings.id, 1));
  return { link: saved.link, date };
}

const SERIAL = ["clients", "invoices", "invoice_items", "time_entries", "transactions", "contracts"];

/**
 * Replace all business records with those in a backup file, in one transaction:
 * if anything fails, nothing changes. Google and Monzo connections are kept.
 */
export async function restoreBackup(text: string): Promise<Record<string, number>> {
  const backup = parseBackup(text);
  const db = await getDb();
  await db.transaction(async (tx) => {
    for (const name of [...TABLE_NAMES].reverse()) await tx.delete(BACKUP_TABLES[name]);
    for (const name of TABLE_NAMES) {
      const rows = backup.tables[name];
      for (let i = 0; i < rows.length; i += 200) {
        await tx.insert(BACKUP_TABLES[name]).values(rows.slice(i, i + 200) as never);
      }
    }
    if (backup.tables.settings.length === 0) await tx.insert(schema.settings).values({ id: 1 });
    // New records continue numbering after the restored ones.
    for (const table of SERIAL) {
      await tx.execute(
        sql.raw(
          `select setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce((select max(id) from "${table}"), 0) + 1, false)`,
        ),
      );
    }
  });
  return Object.fromEntries(TABLE_NAMES.map((n) => [n, backup.tables[n].length]));
}

export async function lastBackup(): Promise<Date | null> {
  const db = await getDb();
  const [s] = await db.select({ at: schema.settings.lastBackupAt }).from(schema.settings).orderBy(asc(schema.settings.id));
  return s?.at ?? null;
}
