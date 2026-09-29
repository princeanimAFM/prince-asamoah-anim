"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { auth, signOut, skipAuth } from "@/auth";
import { getDb, schema } from "@/db";
import { findInvoiceNumber, readBankCSV } from "@/lib/bank-csv";
import { getInvoice, getSettings, listTimeEntries, listTransactions } from "@/lib/data";
import { addDays, taxYearOf, todayISO } from "@/lib/dates";
import { saveToDrive } from "@/lib/google";
import { invoiceFileName, renderInvoicePdf } from "@/lib/invoice-pdf";
import { parsePence } from "@/lib/money";

async function requireUser() {
  if (skipAuth) return;
  const session = await auth();
  if (!session?.user) redirect("/login");
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => {
  const n = Number(f.get(k));
  return Number.isFinite(n) ? n : 0;
};
const isoDate = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : todayISO());

function refresh() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- settings

export async function saveSettings(f: FormData) {
  await requireUser();
  const db = await getDb();
  await db
    .update(schema.settings)
    .set({
      businessName: str(f, "businessName") || "RMR Dev Works",
      ownerName: str(f, "ownerName"),
      email: str(f, "email"),
      phone: str(f, "phone"),
      website: str(f, "website"),
      address: str(f, "address"),
      bankName: str(f, "bankName"),
      accountName: str(f, "accountName"),
      sortCode: str(f, "sortCode"),
      accountNumber: str(f, "accountNumber"),
      hourlyRate: parsePence(str(f, "hourlyRate")) ?? 0,
      paymentTermsDays: Math.max(0, Math.round(num(f, "paymentTermsDays"))),
      invoicePrefix: (str(f, "invoicePrefix") || "RMR").replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
      weeklyHourLimit: Math.max(1, Math.round(num(f, "weeklyHourLimit")) || 20),
      salary: parsePence(str(f, "salary")) ?? 0,
      taxRegion: str(f, "taxRegion") === "rest_of_uk" ? "rest_of_uk" : "scotland",
    })
    .where(eq(schema.settings.id, 1));
  refresh();
  redirect("/settings?saved=1");
}

export async function logOut() {
  await signOut({ redirectTo: "/login" });
}

// ---------------------------------------------------------------- clients

export async function saveClient(f: FormData) {
  await requireUser();
  const db = await getDb();
  const values = {
    name: str(f, "name"),
    company: str(f, "company"),
    email: str(f, "email"),
    phone: str(f, "phone"),
    address: str(f, "address"),
    notes: str(f, "notes"),
  };
  if (!values.name) throw new Error("Client name is required");
  const id = num(f, "id");
  if (id) {
    await db.update(schema.clients).set(values).where(eq(schema.clients.id, id));
    refresh();
    redirect(`/clients/${id}`);
  }
  const [c] = await db.insert(schema.clients).values(values).returning({ id: schema.clients.id });
  refresh();
  redirect(`/clients/${c.id}`);
}

export async function setClientArchived(id: number, archived: boolean) {
  await requireUser();
  const db = await getDb();
  await db.update(schema.clients).set({ archived }).where(eq(schema.clients.id, id));
  refresh();
}

// ---------------------------------------------------------------- hours

export async function logTime(f: FormData) {
  await requireUser();
  const minutes = Math.round(num(f, "hours") * 60) + Math.round(num(f, "minutes"));
  if (minutes <= 0) redirect("/hours?error=time");
  const db = await getDb();
  await db.insert(schema.timeEntries).values({
    date: isoDate(str(f, "date")),
    clientId: num(f, "clientId") || null,
    minutes,
    description: str(f, "description"),
    billable: f.get("billable") === "on",
  });
  refresh();
  redirect(`/hours?logged=${minutes}`);
}

export async function deleteTimeEntry(id: number) {
  await requireUser();
  const db = await getDb();
  await db.delete(schema.timeEntries).where(and(eq(schema.timeEntries.id, id), isNull(schema.timeEntries.invoiceId)));
  refresh();
}

// ---------------------------------------------------------------- invoices

async function nextInvoiceNumber() {
  const db = await getDb();
  const [s] = await db
    .update(schema.settings)
    .set({ nextInvoiceNumber: sql`${schema.settings.nextInvoiceNumber} + 1` })
    .where(eq(schema.settings.id, 1))
    .returning({ n: schema.settings.nextInvoiceNumber, prefix: schema.settings.invoicePrefix });
  return `${s.prefix}-${String(s.n - 1).padStart(4, "0")}`;
}

export async function createInvoice(f: FormData) {
  await requireUser();
  const db = await getDb();
  const settings = await getSettings();
  const clientId = num(f, "clientId");
  if (!clientId) throw new Error("Choose a client");
  const issueDate = isoDate(str(f, "issueDate"));
  const entryIds = f.getAll("entry").map(Number).filter(Boolean);

  const items: { description: string; quantity: number; unitPrice: number }[] = [];
  const entries = entryIds.length
    ? (await listTimeEntries({ clientId, unbilled: true })).filter((e) => entryIds.includes(e.entry.id))
    : [];
  for (const { entry } of entries.reverse()) {
    items.push({
      description: `${entry.description || "Software development"} (${entry.date})`,
      quantity: Math.round((entry.minutes / 60) * 100),
      unitPrice: settings.hourlyRate,
    });
  }
  const descs = f.getAll("itemDescription").map(String);
  const qtys = f.getAll("itemQuantity").map(String);
  const prices = f.getAll("itemPrice").map(String);
  descs.forEach((d, i) => {
    const price = parsePence(prices[i]);
    if (d.trim() && price) {
      items.push({ description: d.trim(), quantity: Math.round((Number(qtys[i]) || 1) * 100), unitPrice: price });
    }
  });
  if (items.length === 0) redirect(`/invoices/new?clientId=${clientId}&error=empty`);

  const number = await nextInvoiceNumber();
  const [inv] = await db
    .insert(schema.invoices)
    .values({
      number,
      clientId,
      issueDate,
      dueDate: addDays(issueDate, settings.paymentTermsDays),
      notes: str(f, "notes"),
    })
    .returning({ id: schema.invoices.id });
  await db.insert(schema.invoiceItems).values(items.map((it, position) => ({ ...it, position, invoiceId: inv.id })));
  if (entries.length) {
    await db
      .update(schema.timeEntries)
      .set({ invoiceId: inv.id })
      .where(inArray(schema.timeEntries.id, entries.map((e) => e.entry.id)));
  }
  refresh();
  redirect(`/invoices/${inv.id}`);
}

export async function addInvoiceItem(f: FormData) {
  await requireUser();
  const db = await getDb();
  const invoiceId = num(f, "invoiceId");
  const price = parsePence(str(f, "price"));
  const description = str(f, "description");
  if (description && price) {
    await db.insert(schema.invoiceItems).values({
      invoiceId,
      description,
      quantity: Math.round((num(f, "quantity") || 1) * 100),
      unitPrice: price,
      position: 999,
    });
  }
  refresh();
}

export async function removeInvoiceItem(invoiceId: number, itemId: number) {
  await requireUser();
  const db = await getDb();
  await db
    .delete(schema.invoiceItems)
    .where(and(eq(schema.invoiceItems.id, itemId), eq(schema.invoiceItems.invoiceId, invoiceId)));
  refresh();
}

export async function updateInvoiceDetails(f: FormData) {
  await requireUser();
  const db = await getDb();
  const id = num(f, "id");
  await db
    .update(schema.invoices)
    .set({ issueDate: isoDate(str(f, "issueDate")), dueDate: isoDate(str(f, "dueDate")), notes: str(f, "notes") })
    .where(eq(schema.invoices.id, id));
  refresh();
}

export async function setInvoiceStatus(id: number, status: "draft" | "sent" | "void") {
  await requireUser();
  const db = await getDb();
  await db.update(schema.invoices).set({ status }).where(eq(schema.invoices.id, id));
  if (status === "void") {
    await db.update(schema.timeEntries).set({ invoiceId: null }).where(eq(schema.timeEntries.invoiceId, id));
  }
  refresh();
}

export async function deleteDraftInvoice(id: number) {
  await requireUser();
  const db = await getDb();
  const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
  if (!inv || inv.status !== "draft") return;
  await db.update(schema.timeEntries).set({ invoiceId: null }).where(eq(schema.timeEntries.invoiceId, id));
  await db.update(schema.transactions).set({ invoiceId: null }).where(eq(schema.transactions.invoiceId, id));
  await db.delete(schema.invoices).where(eq(schema.invoices.id, id));
  refresh();
  redirect("/invoices");
}

/** Record a payment against an invoice; marks it paid once fully covered. */
async function applyPayment(invoiceId: number, date: string) {
  const db = await getDb();
  const data = await getInvoice(invoiceId);
  if (!data) return;
  const received = data.payments.filter((p) => p.kind === "income").reduce((a, p) => a + p.amount, 0);
  if (received >= data.total && data.total > 0) {
    await db.update(schema.invoices).set({ status: "paid", paidDate: date }).where(eq(schema.invoices.id, invoiceId));
  }
}

export async function markInvoicePaid(f: FormData) {
  await requireUser();
  const db = await getDb();
  const id = num(f, "id");
  const date = isoDate(str(f, "date"));
  const data = await getInvoice(id);
  if (!data) return;
  const received = data.payments.filter((p) => p.kind === "income").reduce((a, p) => a + p.amount, 0);
  const amount = parsePence(str(f, "amount")) ?? data.total - received;
  if (amount > 0) {
    await db.insert(schema.transactions).values({
      date,
      description: `Payment for ${data.invoice.number} · ${data.client.company || data.client.name}`,
      amount,
      kind: "income",
      invoiceId: id,
    });
  }
  await applyPayment(id, date);
  refresh();
}

export async function saveInvoiceToDrive(id: number): Promise<{ ok: boolean; message: string; link?: string }> {
  await requireUser();
  const db = await getDb();
  const data = await getInvoice(id);
  if (!data) return { ok: false, message: "Invoice not found" };
  try {
    const settings = await getSettings();
    const pdf = await renderInvoicePdf({ settings, ...data });
    const saved = await saveToDrive({
      folder: `Invoices/${taxYearOf(data.invoice.issueDate)}`,
      name: invoiceFileName(data.invoice, data.client),
      mimeType: "application/pdf",
      data: pdf,
      existingId: data.invoice.driveFileId,
    });
    await db.update(schema.invoices).set({ driveFileId: saved.id }).where(eq(schema.invoices.id, id));
    refresh();
    return { ok: true, message: "Saved to Google Drive", link: saved.link };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

// ---------------------------------------------------------------- money

const SIGN: Record<string, 1 | -1> = { income: 1, expense: -1, tax_saving: -1, tax_payment: -1, ignore: 1 };

export async function addTransaction(f: FormData) {
  await requireUser();
  const db = await getDb();
  const kind = str(f, "kind");
  const amount = parsePence(str(f, "amount"));
  if (!(kind in SIGN) || !amount) redirect("/money?error=amount");
  await db.insert(schema.transactions).values({
    date: isoDate(str(f, "date")),
    description: str(f, "description") || kind,
    amount: Math.abs(amount) * SIGN[kind],
    kind,
    notes: str(f, "notes"),
  });
  refresh();
  redirect(str(f, "returnTo") || "/money");
}

export async function setTransactionKind(id: number, kind: string) {
  await requireUser();
  if (!(kind in SIGN)) return;
  const db = await getDb();
  await db.update(schema.transactions).set({ kind }).where(eq(schema.transactions.id, id));
  refresh();
}

export async function deleteTransaction(id: number) {
  await requireUser();
  const db = await getDb();
  const [tx] = await db.delete(schema.transactions).where(eq(schema.transactions.id, id)).returning();
  if (tx?.invoiceId) {
    await db
      .update(schema.invoices)
      .set({ status: "sent", paidDate: null })
      .where(and(eq(schema.invoices.id, tx.invoiceId), eq(schema.invoices.status, "paid")));
  }
  refresh();
}

function guessKind(amount: number, text: string): string {
  const t = text.toLowerCase();
  if (/\bpot\b|savings/.test(t)) return amount < 0 ? "tax_saving" : "ignore";
  if (/hmrc/.test(t)) return amount < 0 ? "tax_payment" : "income";
  return amount > 0 ? "income" : "expense";
}

export async function importBankCsv(f: FormData) {
  await requireUser();
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) redirect("/money?error=file");
  if (file.size > 5_000_000) redirect("/money?error=big");
  let parsed;
  try {
    parsed = readBankCSV(await file.text());
  } catch {
    redirect("/money?error=format");
  }
  const db = await getDb();
  const settings = await getSettings();
  const invoices = await db.select().from(schema.invoices);
  let added = 0;
  let matched = 0;
  const bankName = settings.bankName.toLowerCase().includes("monzo") ? "monzo_csv" : "bank_csv";

  for (const row of parsed.rows) {
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
        source: bankName,
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
  refresh();
  redirect(`/money?imported=${added}&matched=${matched}&dupes=${parsed.rows.length - added}`);
}

// ---------------------------------------------------------------- records

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportRecordsToDrive(taxYear: string): Promise<{ ok: boolean; message: string; link?: string }> {
  await requireUser();
  try {
    const txs = await listTransactions(taxYear);
    const money = [
      ["Date", "Description", "Type", "Amount (GBP)", "Invoice", "Source"].join(","),
      ...txs
        .slice()
        .reverse()
        .map(({ tx, invoiceNumber }) =>
          [tx.date, tx.description, tx.kind, (tx.amount / 100).toFixed(2), invoiceNumber ?? "", tx.source]
            .map(csvCell)
            .join(","),
        ),
    ].join("\n");
    const start = `${taxYear.slice(0, 4)}-04-06`;
    const end = `${Number(taxYear.slice(0, 4)) + 1}-04-05`;
    const hours = await listTimeEntries({ from: start, to: end });
    const hoursCsv = [
      ["Date", "Client", "Hours", "Description", "Billable"].join(","),
      ...hours
        .slice()
        .reverse()
        .map(({ entry, clientName }) =>
          [entry.date, clientName ?? "", (entry.minutes / 60).toFixed(2), entry.description, entry.billable ? "yes" : "no"]
            .map(csvCell)
            .join(","),
        ),
    ].join("\n");
    const folder = `Tax/${taxYear}`;
    const enc = new TextEncoder();
    const a = await saveToDrive({
      folder,
      name: `Money in and out ${taxYear}.csv`,
      mimeType: "text/csv",
      data: enc.encode(money),
      remember: true,
    });
    await saveToDrive({
      folder,
      name: `Hours log ${taxYear}.csv`,
      mimeType: "text/csv",
      data: enc.encode(hoursCsv),
      remember: true,
    });
    return { ok: true, message: `Saved to Google Drive in RMR Dev Works/${folder}`, link: a.link };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
