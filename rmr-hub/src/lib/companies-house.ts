import "server-only";
import { type CompanyMatch, cleanQuery, toMatches } from "@/lib/companies-house-map";

/**
 * Company search on the public Companies House register
 * (https://developer.company-information.service.gov.uk). Free with an API key. Only the
 * search text you type is sent; the key never leaves the server.
 */

const API = "https://api.company-information.service.gov.uk";

/** A failure whose message is safe and useful to show on screen. */
export class CompaniesHouseError extends Error {}

export function companiesHouseConfigured(): boolean {
  return Boolean(process.env.COMPANIES_HOUSE_API_KEY);
}

export async function searchCompanies(query: string): Promise<CompanyMatch[]> {
  const q = cleanQuery(query);
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!q || !key) return [];
  const res = await fetch(`${API}/search/companies?${new URLSearchParams({ q, items_per_page: "8" })}`, {
    // The key is the username, with an empty password.
    headers: { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 401) throw new CompaniesHouseError("Companies House didn't accept the API key. Check COMPANIES_HOUSE_API_KEY.");
  if (res.status === 429) throw new CompaniesHouseError("Too many Companies House searches just now. Try again in a few minutes.");
  if (!res.ok) throw new CompaniesHouseError(`Companies House search failed (${res.status}). Try again later.`);
  const body = (await res.json()) as { items?: unknown };
  return toMatches(body.items);
}
