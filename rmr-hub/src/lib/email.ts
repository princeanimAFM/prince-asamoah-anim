/**
 * Building plain-text emails with attachments (RFC 5322 / MIME), sent through Gmail.
 * Pure functions, so they can be tested without sending anything.
 */
import { addDays, formatDate } from "@/lib/dates";
import { formatGBP } from "@/lib/money";

const EMAIL = /^[^\s@<>()",;:\\[\]]+@[^\s@<>()",;:\\[\]]+\.[^\s@<>()",;:\\[\]]+$/;

export function isEmail(v: string): boolean {
  return v.length <= 254 && EMAIL.test(v);
}

/** Header text with line breaks removed (they would let text inject extra headers). */
function oneLine(v: string): string {
  return v.replace(/[\r\n]+/g, " ").trim();
}

/** Encode a header value as UTF-8 when it isn't plain ASCII (RFC 2047). */
export function encodeHeader(v: string): string {
  const s = oneLine(v);
  return /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

/** "Name" <address>, with the name encoded and quoted safely. */
export function mailbox(name: string, address: string): string {
  const n = oneLine(name).replace(/["\\]/g, "");
  return n ? `${encodeHeader(`"${n}"`)} <${address}>` : `<${address}>`;
}

function wrap64(b64: string): string {
  return b64.replace(/.{1,76}/g, "$&\r\n");
}

export interface Attachment {
  filename: string;
  mimeType: string;
  data: Uint8Array;
}

export interface Email {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  attachments?: Attachment[];
}

/** The full message, ready to base64url-encode for the Gmail API. */
export function buildMime(e: Email, boundary = `rmr_${Date.now().toString(36)}`): string {
  for (const a of [e.to, e.replyTo].filter(Boolean) as string[]) {
    if (!isEmail(a)) throw new Error(`"${a}" isn't a valid email address`);
  }
  const head = [
    `From: ${e.from}`,
    `To: <${e.to}>`,
    ...(e.replyTo ? [`Reply-To: <${e.replyTo}>`] : []),
    `Subject: ${encodeHeader(e.subject)}`,
    "MIME-Version: 1.0",
  ];
  const textPart = [
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap64(Buffer.from(e.text.replace(/\r?\n/g, "\r\n"), "utf8").toString("base64")),
  ].join("\r\n");

  if (!e.attachments?.length) return [...head, textPart].join("\r\n");

  const parts = [
    textPart,
    ...e.attachments.map((a) => {
      const name = encodeHeader(a.filename.replace(/["\\]/g, ""));
      return [
        `Content-Type: ${a.mimeType}; name="${name}"`,
        `Content-Disposition: attachment; filename="${name}"`,
        "Content-Transfer-Encoding: base64",
        "",
        wrap64(Buffer.from(a.data).toString("base64")),
      ].join("\r\n");
    }),
  ];
  return [
    ...head,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    ...parts.map((p) => `--${boundary}\r\n${p}`),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

// ------------------------------------------------------------------ invoice wording

export interface InvoiceEmailInput {
  number: string;
  amountDue: number;
  dueDate: string;
  clientName: string;
  ownerName: string;
  businessName: string;
  today: string;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

export function invoiceEmail(i: InvoiceEmailInput): { subject: string; text: string } {
  return {
    subject: `Invoice ${i.number} from ${i.businessName}`,
    text: `Hi ${firstName(i.clientName)},

Please find attached invoice ${i.number} for ${formatGBP(i.amountDue)}, due on ${formatDate(i.dueDate)}.

Payment details are on the invoice. Please use ${i.number} as the payment reference so it's matched straight away.

Thank you,
${i.ownerName}
${i.businessName}`,
  };
}

export function reminderEmail(i: InvoiceEmailInput): { subject: string; text: string } {
  const overdue = i.dueDate < i.today;
  return {
    subject: overdue
      ? `Reminder: invoice ${i.number} is overdue`
      : `Reminder: invoice ${i.number} is due on ${formatDate(i.dueDate)}`,
    text: `Hi ${firstName(i.clientName)},

${
  overdue
    ? `A friendly reminder that invoice ${i.number} for ${formatGBP(i.amountDue)} was due on ${formatDate(i.dueDate)} and is still unpaid.`
    : `A friendly reminder that invoice ${i.number} for ${formatGBP(i.amountDue)} is due on ${formatDate(i.dueDate)}.`
} I've attached it again for you.

Payment details are on the invoice; please use ${i.number} as the reference. If you've already paid, thank you, and please ignore this email.

Kind regards,
${i.ownerName}
${i.businessName}`,
  };
}

/** Days after the due date when automatic reminders go out. */
export const REMINDER_DAYS = [1, 7, 14];

/**
 * Whether an automatic reminder is due today: one on each of REMINDER_DAYS after the due
 * date, catching up at most one a day, never twice on the same day.
 */
export function reminderDue(opts: { dueDate: string; today: string; sent: number; lastSent: string | null }): boolean {
  if (opts.sent >= REMINDER_DAYS.length) return false;
  if (opts.lastSent === opts.today) return false;
  return opts.today >= addDays(opts.dueDate, REMINDER_DAYS[opts.sent]);
}
