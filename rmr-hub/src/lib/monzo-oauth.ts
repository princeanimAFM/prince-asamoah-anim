import "server-only";
import { auth, skipAuth } from "@/auth";

export const STATE_COOKIE = "monzo_oauth_state";

/** Where Monzo sends you back. Register exactly this address in the Monzo developer portal. */
export function monzoRedirectUri(req: Request): string {
  // APP_URL if set; on Netlify, URL is the site's main address.
  const base = (process.env.APP_URL || process.env.URL || new URL(req.url).origin).replace(/\/+$/, "");
  return `${base}/api/monzo/callback`;
}

/** True when you are signed in to the hub (or sign-in is skipped locally). */
export async function signedIn(): Promise<boolean> {
  return skipAuth || Boolean((await auth())?.user);
}
