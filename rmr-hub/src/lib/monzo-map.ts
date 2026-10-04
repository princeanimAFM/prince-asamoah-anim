/** Turning Monzo API transactions into bank rows. Pure, so it can be tested. */
import type { BankRow } from "@/lib/bank-csv";

export interface MonzoTx {
  id: string;
  created: string;
  description: string;
  amount: number;
  currency: string;
  category?: string;
  decline_reason?: string;
  merchant?: { name?: string } | string | null;
  counterparty?: { name?: string } | null;
  metadata?: Record<string, string>;
  notes?: string;
}

export interface MonzoAccountInfo {
  id: string;
  type: string;
  description: string;
  closed: boolean;
}

/** The UK calendar date of a timestamp. */
export function ukDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
}

export function monzoToRow(t: MonzoTx): BankRow | null {
  if (t.decline_reason || t.amount === 0 || t.currency !== "GBP") return null;
  const merchant = typeof t.merchant === "object" && t.merchant ? t.merchant.name : undefined;
  const pot = t.metadata?.pot_id ? "Pot transfer" : undefined;
  const name = merchant || t.counterparty?.name || pot || t.description;
  // Keep the payment reference (e.g. "RMR-0003") so incoming payments match invoices.
  const reference = t.counterparty?.name && t.description && t.description !== name ? ` · ${t.description}` : "";
  return {
    externalId: t.id,
    date: ukDate(t.created),
    description: `${name}${reference}`.trim().slice(0, 300),
    amount: t.amount,
    category: [t.category, pot ? "pot" : ""].filter(Boolean).join(" "),
  };
}

/** Prefer an open business account, then a personal one. */
export function pickAccount(accounts: MonzoAccountInfo[]): MonzoAccountInfo | null {
  const open = accounts.filter((a) => !a.closed);
  return (
    open.find((a) => a.type === "uk_business") ??
    open.find((a) => a.type === "uk_retail") ??
    open.find((a) => a.type !== "uk_prepaid") ??
    null
  );
}

export function accountLabel(a: MonzoAccountInfo): string {
  const kind = a.type === "uk_business" ? "Business account" : a.type === "uk_retail_joint" ? "Joint account" : "Personal account";
  return a.description && !/^user_|^acc_/.test(a.description) ? `${kind} (${a.description})` : kind;
}
