/** Dates are stored and compared as ISO strings: "YYYY-MM-DD". */

/** Today's date in the UK, whatever time zone the server runs in. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}

export function ukHour(): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", hourCycle: "h23" }).format(new Date()));
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** UK tax years run 6 April to 5 April. Returns e.g. "2025-26". */
export function taxYearOf(iso: string): string {
  const d = fromISO(iso);
  const y = d.getFullYear();
  const beforeStart = d.getMonth() < 3 || (d.getMonth() === 3 && d.getDate() < 6);
  const start = beforeStart ? y - 1 : y;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

export function taxYearRange(taxYear: string): { start: string; end: string } {
  const start = Number(taxYear.slice(0, 4));
  return { start: `${start}-04-06`, end: `${start + 1}-04-05` };
}

/** Monday of the week containing the date. */
export function weekStart(iso: string): string {
  const d = fromISO(iso);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return toISO(d);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return fromISO(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Key Self Assessment dates for the return that covers `taxYear`. */
export function selfAssessmentDates(taxYear: string) {
  const start = Number(taxYear.slice(0, 4));
  return {
    register: `${start + 1}-10-05`,
    fileAndPay: `${start + 2}-01-31`,
    secondPaymentOnAccount: `${start + 2}-07-31`,
  };
}
