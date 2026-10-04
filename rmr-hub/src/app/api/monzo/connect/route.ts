import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { monzoAuthUrl, monzoConfigured } from "@/lib/monzo";
import { STATE_COOKIE, monzoRedirectUri, signedIn } from "@/lib/monzo-oauth";

export const dynamic = "force-dynamic";

/** Start connecting Monzo: send you to Monzo's sign-in with a one-time state value. */
export async function GET(req: Request) {
  if (!(await signedIn())) return NextResponse.redirect(new URL("/login", req.url));
  if (!monzoConfigured()) return NextResponse.redirect(new URL("/settings?monzo=setup#monzo", req.url));
  const state = randomBytes(24).toString("base64url");
  const res = NextResponse.redirect(monzoAuthUrl(state, monzoRedirectUri(req)));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/monzo",
    maxAge: 600,
  });
  return res;
}
