import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { type BankRow, findInvoiceNumber } from "@/lib/bank-csv";
import { getInvoice, getSettings } from "@/lib/data";

/** Record a payment against an invoice; marks it paid once fully covered. */
export async function applyPayment(invoiceId: number, date: string) {
  const db = await getDb();
  const data = await getInvoice(invoiceId);
  if (!data) return;
  const received = data.payments.filter((p) => p.kind === "income").reduce((a, p) => a + p.amount, 0);
  if (received >= data.total && data.total > 0) {
    await db.update(schema.invoices).set({ status: "paid", paidDate: date }).where(eq(schema.invoices.id, invoiceId));
  }
}

export function guessKind(amount: number, text: string): string {
  const t = text.toLowerCase();
  if (/\bpot\b|savings/.test(t)) return amount < 0 ? "tax_saving" : "ignore";
  if (/hmrc/.test(t)) return amount < 0 ? "tax_payment" : "income";
  return amount > 0 ? "income" : "expense";
}

/**
 * Add bank transactions, skipping ones already imported (by bank transaction id), and
 * match incoming payments that quote an invoice number. Used by CSV import and Monzo sync.
 */
export async function importBankRows(rows: BankRow[], source: string): Promise<{ added: number; matched: number }> {
  const db = await getDb();
  const settings = await getSettings();
  const invoices = await db.select().from(schema.invoices);
  let added = 0;
  let matched = 0;
  for (const row of rows) {
    const kind = guessKind(row.amount, `${row.description} ${row.category ?? ""}`);
    const number = kind === "income" ? findInvoiceNumber(row.description, settings.invoicePrefix) : null;
    const invoice = number ? invoices.find((i) => i.number === number && i.status !== "void") : undefined;
    const inserted = await db
      .insert(schema.transactions)
      .values({
        date: row.date,
        description: row.description,
        amount: row.amount,
        kind,
        source,
        externalId: row.externalId,
        invoiceId: invoice?.id ?? null,
      })
      .onConflictDoNothing({ target: schema.transactions.externalId })
      .returning({ id: schema.transactions.id });
    if (inserted.length) {
      added++;
      if (invoice) {
        matched++;
        await applyPayment(invoice.id, row.date);
      }
    }
  }
  return { added, matched };
}
