import "server-only";
import { SITE } from "./site";

export type CheckoutStatus =
  | { ready: true; secretKey: string; siteUrl: string; testMode: boolean }
  | { ready: false; reason: string };

/**
 * Checkout opens only when Stripe and the site address are configured. While the shop is in
 * preview, only Stripe test keys are accepted, so no real payment can be taken by mistake.
 */
export function checkoutStatus(env: Record<string, string | undefined> = process.env): CheckoutStatus {
  const secretKey = env.STRIPE_SECRET_KEY?.trim() ?? "";
  const siteUrl = (env.SITE_URL?.trim() ?? "").replace(/\/+$/, "");
  if (!/^sk_(test|live)_[A-Za-z0-9]+$/.test(secretKey)) return { ready: false, reason: "STRIPE_SECRET_KEY is missing" };
  if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(siteUrl) && !/^http:\/\/localhost(:\d+)?$/.test(siteUrl)) {
    return { ready: false, reason: "SITE_URL is missing or not an https address" };
  }
  const testMode = secretKey.startsWith("sk_test_");
  if (SITE.preview && !testMode) return { ready: false, reason: "live keys are blocked while the shop is in preview" };
  return { ready: true, secretKey, siteUrl, testMode };
}
