import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Everything except sign-in routes, static files and the web app manifest.
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|logo).*)"],
};
