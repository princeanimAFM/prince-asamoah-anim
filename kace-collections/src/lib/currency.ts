// Prices are stored and charged in pounds (pence). Cedi prices are shown as an approximate guide only.

export type Currency = "GBP" | "GHS";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const ghs = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GHS", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });

/** Reads the cedi rate from configuration; returns null when it isn't a usable number. */
export function parseRate(value: string | undefined): number | null {
  const n = Number(value);
  return value && Number.isFinite(n) && n > 0 ? n : null;
}

export function formatPrice(pence: number, currency: Currency = "GBP", ghsPerGbp: number | null = null): string {
  if (currency === "GHS" && ghsPerGbp) return ghs.format(Math.round((pence / 100) * ghsPerGbp));
  return gbp.format(pence / 100);
}
