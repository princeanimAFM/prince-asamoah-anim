import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, isNotNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getInvoice, getSettings } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { buildMime, isEmail, mailbox, reminderDue, reminderEmail } from "@/lib/email";
import { googleEmail, sendGmail } from "@/lib/google";
import { invoiceFileName, renderInvoicePdf } from "@/lib/invoice-pdf";

export type MailKind = "invoice" | "reminder";

/**
 * On your own computer without Google connected, emails are written to ./data/outbox
 * instead of being sent, so you can try the feature safely. Never in production.
 */
const devOutbox = process.env.NODE_ENV !== "production";

async function deliver(raw: string, from: string | null) {
  if (from) return sendGmail(raw);
  if (!devOutbox) throw new Error("Google isn't connected. Sign out and sign in again with Google to send email.");
  const dir = path.join(process.cwd(), "data", "outbox");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${Date.now()}.eml`), raw);
  return { id: "outbox" };
}

/** Email an invoice (or a reminder about it) to the client, with the PDF attached. */
export async function sendInvoiceEmail(opts: {
  invoiceId: number;
  kind: MailKind;
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const data = await getInvoice(opts.invoiceId);
  if (!data) throw new Error("Invoice not found");
  if (data.invoice.status === "void" || data.invoice.status === "paid") {
    throw new Error(`This invoice is ${data.invoice.status}, so it isn't emailed.`);
  }
  if (data.total <= 0) throw new Error("Add at least one line before emailing the invoice.");
  const to = opts.to.trim();
  if (!isEmail(to)) throw new Error("Enter a valid email address for the client.");

  const settings = await getSettings();
  const sender = await googleEmail();
  const pdf = await renderInvoicePdf({ settings, ...data });
  const raw = buildMime({
    from: mailbox(`${settings.ownerName}, ${settings.businessName}`, sender ?? "outbox@localhost"),
    to,
    replyTo: settings.email && isEmail(settings.email) && settings.email !== sender ? settings.email : undefined,
    subject: opts.subject.slice(0, 200) || `Invoice ${data.invoice.number}`,
    text: opts.text.slice(0, 10_000),
    attachments: [{ filename: invoiceFileName(data.invoice, data.client), mimeType: "application/pdf", data: pdf }],
  });
  await deliver(raw, sender);

  const db = await getDb();
  if (opts.kind === "invoice") {
    await db
      .update(schema.invoices)
      .set({ emailedAt: new Date(), ...(data.invoice.status === "draft" ? { status: "sent" } : {}) })
      .where(eq(schema.invoices.id, opts.invoiceId));
  } else {
    await db
      .update(schema.invoices)
      .set({ reminderCount: data.invoice.reminderCount + 1, lastReminderDate: todayISO() })
      .where(eq(schema.invoices.id, opts.invoiceId));
  }
}

/** Amount still owed on an invoice. */
export function amountDue(data: NonNullable<Awaited<ReturnType<typeof getInvoice>>>): number {
  const received = data.payments.filter((p) => p.kind === "income").reduce((a, p) => a + p.amount, 0);
  return Math.max(0, data.total - received);
}

/**
 * Send any automatic reminders due today (run once a day by the scheduled job).
 * Only invoices that were emailed from the app get automatic reminders.
 */
export async function runAutoReminders(): Promise<{ sent: string[]; failed: string[] }> {
  const settings = await getSettings();
  const result = { sent: [] as string[], failed: [] as string[] };
  if (!settings.autoReminders) return result;
  const db = await getDb();
  const today = todayISO();
  const rows = await db
    .select({ invoice: schema.invoices, client: schema.clients })
    .from(schema.invoices)
    .innerJoin(schema.clients, eq(schema.invoices.clientId, schema.clients.id))
    .where(and(eq(schema.invoices.status, "sent"), isNotNull(schema.invoices.emailedAt)));

  for (const { invoice, client } of rows) {
    if (!isEmail(client.email)) continue;
    if (!reminderDue({ dueDate: invoice.dueDate, today, sent: invoice.reminderCount, lastSent: invoice.lastReminderDate })) {
      continue;
    }
    try {
      const data = await getInvoice(invoice.id);
      if (!data) continue;
      const due = amountDue(data);
      if (due <= 0) continue;
      const mail = reminderEmail({
        number: invoice.number,
        amountDue: due,
        dueDate: invoice.dueDate,
        clientName: client.name,
        ownerName: settings.ownerName,
        businessName: settings.businessName,
        today,
      });
      await sendInvoiceEmail({ invoiceId: invoice.id, kind: "reminder", to: client.email, ...mail });
      result.sent.push(invoice.number);
    } catch {
      result.failed.push(invoice.number);
    }
  }
  return result;
}
