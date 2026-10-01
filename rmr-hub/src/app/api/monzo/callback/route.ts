import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { finishMonzoConnect } from "@/lib/monzo";
import { STATE_COOKIE, monzoRedirectUri, signedIn } from "@/lib/monzo-oauth";

export const dynamic = "force-dynamic";

function sameState(a: string | undefined, b: string | null): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Monzo sends you back here after sign-in. */
export async function GET(req: Request) {
  if (!(await signedIn())) return NextResponse.redirect(new URL("/login", req.url));
  const url = new URL(req.url);
  const cookie = req.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.slice(STATE_COOKIE.length + 1);
  const code = url.searchParams.get("code");
  let outcome = "failed";
  if (code && sameState(cookie, url.searchParams.get("state"))) {
    try {
      await finishMonzoConnect(code, monzoRedirectUri(req));
      outcome = "approve";
    } catch {
      outcome = "failed";
    }
  }
  const res = NextResponse.redirect(new URL(`/settings?monzo=${outcome}#monzo`, req.url));
  res.cookies.set(STATE_COOKIE, "", { path: "/api/monzo", maxAge: 0 });
  return res;
}
