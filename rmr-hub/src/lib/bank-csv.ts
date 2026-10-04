/**
 * Read bank statement CSV exports. Monzo's export is supported by name; other banks
 * work when the file has date, description and amount (or money in / money out) columns.
 */

export interface BankRow {
  externalId: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // pence, positive = money in
  category?: string;
}

/** Split CSV text into rows, handling quoted fields with commas and newlines. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

function normaliseDate(raw: string): string | null {
  const s = raw.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

function toPence(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number(raw.replace(/[£,\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Stable id for rows from banks that don't provide one, so re-imports skip duplicates. */
function fingerprint(date: string, description: string, amount: number, n: number): string {
  let h = 0;
  const s = `${date}|${description}|${amount}|${n}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `csv_${(h >>> 0).toString(36)}`;
}

export function readBankCSV(text: string): { rows: BankRow[]; skipped: number } {
  const table = parseCSV(text);
  if (table.length < 2) return { rows: [], skipped: 0 };
  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (...names: string[]) => header.findIndex((h) => names.includes(h));

  const iId = col("transaction id", "id");
  const iDate = col("date", "transaction date", "posted date");
  const iName = col("name", "payee", "counter party", "counterparty");
  const iDesc = col("description", "reference", "details", "memo");
  const iNotes = col("notes and #tags", "notes");
  const iAmount = col("amount", "value", "amount (gbp)");
  const iIn = col("money in", "paid in", "credit");
  const iOut = col("money out", "paid out", "debit");
  const iCat = col("category");

  if (iDate < 0 || (iAmount < 0 && iIn < 0 && iOut < 0)) {
    throw new Error("This file needs a Date column and an Amount (or Money in / Money out) column.");
  }

  const rows: BankRow[] = [];
  const seen = new Map<string, number>();
  let skipped = 0;
  for (const r of table.slice(1)) {
    const date = normaliseDate(r[iDate] ?? "");
    const amount =
      iAmount >= 0 ? toPence(r[iAmount]) : toPence(r[iIn]) - Math.abs(toPence(r[iOut]));
    if (!date || amount === 0) {
      skipped++;
      continue;
    }
    const parts = [iName, iDesc, iNotes].map((i) => (i >= 0 ? (r[i] ?? "").trim() : "")).filter(Boolean);
    const description = [...new Set(parts)].join(" · ") || "(no description)";
    const key = `${date}|${description}|${amount}`;
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    rows.push({
      externalId: iId >= 0 && r[iId]?.trim() ? r[iId].trim() : fingerprint(date, description, amount, n),
      date,
      description,
      amount,
      category: iCat >= 0 ? r[iCat]?.trim() || undefined : undefined,
    });
  }
  return { rows, skipped };
}

/** Find an invoice number like "RMR-0007" in a bank reference. */
export function findInvoiceNumber(description: string, prefix: string): string | null {
  const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = description.match(new RegExp(`${esc}[-\\s]?(\\d{1,6})`, "i"));
  return m ? `${prefix}-${m[1].padStart(4, "0")}` : null;
}
