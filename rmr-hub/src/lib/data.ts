import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Invoice, InvoiceItem, Settings } from "@/db/schema";
import { addDays, taxYearOf, taxYearRange, todayISO, weekStart } from "@/lib/dates";
import { estimate, type TaxRegion } from "@/lib/tax";

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const [s] = await db.select().from(schema.settings).where(eq(schema.settings.id, 1));
  return s;
}

export async function listClients(includeArchived = false) {
  const db = await getDb();
  const q = db.select().from(schema.clients).orderBy(asc(schema.clients.name));
  const rows = await q;
  return includeArchived ? rows : rows.filter((c) => !c.archived);
}

export async function getClient(id: number) {
  const db = await getDb();
  const [c] = await db.select().from(schema.clients).where(eq(schema.clients.id, id));
  return c ?? null;
}

export function lineAmount(item: Pick<InvoiceItem, "quantity" | "unitPrice">) {
  return Math.round((item.quantity * item.unitPrice) / 100);
}

export function invoiceTotal(items: Pick<InvoiceItem, "quantity" | "unitPrice">[]) {
  return items.reduce((sum, i) => sum + lineAmount(i), 0);
}

export type InvoiceRow = Invoice & { clientName: string; total: number; overdue: boolean };

export async function listInvoices(filter?: { clientId?: number }): Promise<InvoiceRow[]> {
  const db = await getDb();
  const rows = await db
    .select({ invoice: schema.invoices, clientName: schema.clients.name })
    .from(schema.invoices)
    .innerJoin(schema.clients, eq(schema.invoices.clientId, schema.clients.id))
    .where(filter?.clientId ? eq(schema.invoices.clientId, filter.clientId) : undefined)
    .orderBy(desc(schema.invoices.issueDate), desc(schema.invoices.id));
  const ids = rows.map((r) => r.invoice.id);
  const items = ids.length
    ? await db.select().from(schema.invoiceItems).where(inArray(schema.invoiceItems.invoiceId, ids))
    : [];
  const today = todayISO();
  return rows.map(({ invoice, clientName }) => ({
    ...invoice,
    clientName,
    total: invoiceTotal(items.filter((i) => i.invoiceId === invoice.id)),
    overdue: invoice.status === "sent" && invoice.dueDate < today,
  }));
}

export async function getInvoice(id: number) {
  const db = await getDb();
  const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
  if (!invoice) return null;
  const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, invoice.clientId));
  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, id))
    .orderBy(asc(schema.invoiceItems.position), asc(schema.invoiceItems.id));
  const payments = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.invoiceId, id))
    .orderBy(asc(schema.transactions.date));
  return { invoice, client, items, payments, total: invoiceTotal(items) };
}

/** Hours per week for the visa limit, most recent week first. */
export async function weeklyHours(weeks = 8) {
  const db = await getDb();
  const thisWeek = weekStart(todayISO());
  const from = addDays(thisWeek, -7 * (weeks - 1));
  const rows = await db
    .select({ date: schema.timeEntries.date, minutes: schema.timeEntries.minutes })
    .from(schema.timeEntries)
    .where(gte(schema.timeEntries.date, from));
  const totals = new Map<string, number>();
  for (let i = 0; i < weeks; i++) totals.set(addDays(thisWeek, -7 * i), 0);
  for (const r of rows) {
    const w = weekStart(r.date);
    if (totals.has(w)) totals.set(w, (totals.get(w) ?? 0) + r.minutes);
  }
  return [...totals.entries()].map(([week, minutes]) => ({ week, minutes }));
}

export async function listTimeEntries(opts: { from?: string; to?: string; clientId?: number; unbilled?: boolean } = {}) {
  const db = await getDb();
  const t = schema.timeEntries;
  const conds = [
    opts.from ? gte(t.date, opts.from) : undefined,
    opts.to ? lte(t.date, opts.to) : undefined,
    opts.clientId ? eq(t.clientId, opts.clientId) : undefined,
    opts.unbilled ? and(sql`${t.invoiceId} is null`, eq(t.billable, true)) : undefined,
  ].filter(Boolean);
  return db
    .select({ entry: t, clientName: schema.clients.name })
    .from(t)
    .leftJoin(schema.clients, eq(t.clientId, schema.clients.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(t.date), desc(t.id));
}

export async function listTransactions(taxYear?: string) {
  const db = await getDb();
  const t = schema.transactions;
  const range = taxYear ? taxYearRange(taxYear) : null;
  return db
    .select({ tx: t, invoiceNumber: schema.invoices.number })
    .from(t)
    .leftJoin(schema.invoices, eq(t.invoiceId, schema.invoices.id))
    .where(range ? and(gte(t.date, range.start), lte(t.date, range.end)) : undefined)
    .orderBy(desc(t.date), desc(t.id));
}

/** Everything the tax page and dashboard need for one tax year (cash basis). */
export async function taxSummary(taxYear = taxYearOf(todayISO())) {
  const db = await getDb();
  const t = schema.transactions;
  const { start, end } = taxYearRange(taxYear);
  const rows = await db
    .select({ kind: t.kind, total: sql<string>`coalesce(sum(${t.amount}), 0)` })
    .from(t)
    .where(and(gte(t.date, start), lte(t.date, end)))
    .groupBy(t.kind);
  const sum = (k: string) => Number(rows.find((r) => r.kind === k)?.total ?? 0);
  const settings = await getSettings();
  const income = sum("income");
  const expenses = Math.abs(sum("expense"));
  const saved = Math.abs(sum("tax_saving"));
  const paid = Math.abs(sum("tax_payment"));
  const region: TaxRegion = settings.taxRegion === "rest_of_uk" ? "rest_of_uk" : "scotland";
  const est = estimate({ taxYear, region, salary: settings.salary, income, expenses });
  return { taxYear, start, end, income, expenses, saved, paid, estimate: est, salary: settings.salary, region };
}
