import "server-only";
import { auth, skipAuth } from "@/auth";

export const STATE_COOKIE = "monzo_oauth_state";

/** Where Monzo sends you back. Register exactly this address in the Monzo developer portal. */
export function monzoRedirectUri(req: Request): string {
  const base = (process.env.APP_URL || new URL(req.url).origin).replace(/\/+$/, "");
  return `${base}/api/monzo/callback`;
}

export async function signedIn(): Promise<boolean> {
  return skipAuth || Boolean((await auth())?.user);
}
