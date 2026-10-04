import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Everything except sign-in routes, clients' contract-signing pages (/sign/<secret>),
  // scheduled jobs (/api/cron, which check their own secret), the privacy notice, static
  // files and the manifest.
  matcher: ["/((?!api/auth|api/cron/|login|privacy|sign/|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|logo).*)"],
};
