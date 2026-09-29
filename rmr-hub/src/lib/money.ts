/** Money is stored as whole pence to avoid rounding errors. */

export function formatGBP(pence: number, opts: { sign?: boolean } = {}): string {
  const s = (Math.abs(pence) / 100).toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
  if (pence < 0) return `-${s}`;
  return opts.sign && pence > 0 ? `+${s}` : s;
}

/** Parse "1,234.50", "£12", "-3.2" into pence. Returns null when not a number. */
export function parsePence(input: string | null | undefined): number | null {
  if (input == null) return null;
  const cleaned = String(input).replace(/[£,\s]/g, "");
  if (cleaned === "" || !/^-?\d*(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function percent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
