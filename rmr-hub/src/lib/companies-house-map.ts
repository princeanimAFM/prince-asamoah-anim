/** Turning Companies House search results into client details. Pure, so it can be tested. */

export interface CHAddress {
  premises?: string;
  address_line_1?: string;
  address_line_2?: string;
  locality?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}

export interface CHSearchItem {
  title?: string;
  company_number?: string;
  company_status?: string;
  address?: CHAddress;
  address_snippet?: string;
}

export interface CompanyMatch {
  number: string;
  name: string;
  /** e.g. "active", "dissolved", "liquidation" */
  status: string;
  /** One line per part, ready for the client's invoice address. */
  address: string;
}

// Invoices are UK-addressed by default, so the country is left off for these.
const HOME_COUNTRIES = new Set(["united kingdom", "uk", "england", "scotland", "wales", "northern ireland", "great britain", "england and wales"]);

const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");

export function formatAddress(a: CHAddress | undefined): string {
  if (!a) return "";
  const street = [clean(a.premises), clean(a.address_line_1)].filter(Boolean).join(" ");
  const country = clean(a.country);
  return [street, clean(a.address_line_2), clean(a.locality), clean(a.region), clean(a.postal_code)]
    .concat(country && !HOME_COUNTRIES.has(country.toLowerCase()) ? [country] : [])
    .filter(Boolean)
    .join("\n");
}

export function toMatches(items: unknown): CompanyMatch[] {
  if (!Array.isArray(items)) return [];
  return (items as CHSearchItem[])
    .map((i) => ({
      number: clean(i?.company_number),
      name: clean(i?.title),
      status: clean(i?.company_status),
      address: formatAddress(i?.address) || clean(i?.address_snippet).split(", ").join("\n"),
    }))
    .filter((m) => m.number && m.name);
}

/** Search text the API is asked for: trimmed, one line, and a sensible length. */
export function cleanQuery(q: string): string | null {
  const v = clean(q).slice(0, 100);
  return v.length >= 2 ? v : null;
}
