/**
 * Rules for the public signing link. Pure functions, so they can be tested without a request.
 */

/** Once signed, the link keeps serving the client's copy for this long, then stops. */
export const SIGNED_LINK_DAYS = 90;

const DAY = 24 * 60 * 60 * 1000;

/**
 * Whether a contract's signing link should still open. Drafts and void contracts never do;
 * a signed contract only for SIGNED_LINK_DAYS, so the signature, IP address and browser
 * in its PDF aren't open forever to anyone the link was forwarded to.
 */
export function signingLinkOpen(c: { status: string; signedAt: Date | null }, now = new Date()): boolean {
  if (c.status === "sent") return true;
  if (c.status !== "signed") return false;
  return Boolean(c.signedAt) && now.getTime() - new Date(c.signedAt!).getTime() <= SIGNED_LINK_DAYS * DAY;
}

/**
 * The signer's IP address for the audit record. A platform's own header is trusted only on
 * that platform (elsewhere a browser could send it), because the first X-Forwarded-For entry
 * can be whatever the browser chose. Netlify sets x-nf-client-connection-ip; Vercel sets
 * x-real-ip and overwrites x-forwarded-for.
 */
export function clientIp(
  h: { get(name: string): string | null },
  env: Record<string, string | undefined> = process.env,
): string {
  const trusted = env.NETLIFY ? h.get("x-nf-client-connection-ip") : env.VERCEL ? h.get("x-real-ip") : null;
  const ip = trusted?.trim() || (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  return ip.slice(0, 64);
}
