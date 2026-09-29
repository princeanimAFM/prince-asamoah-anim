import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Sign in with Google. Only ALLOWED_EMAIL may sign in. The same sign-in grants the
 * `drive.file` scope, which lets the app create and manage the files it saves to
 * Google Drive (and nothing else in the Drive).
 *
 * This file is shared with the middleware, so it must not import database code.
 */

export const skipAuth = process.env.NODE_ENV !== "production" && process.env.DEV_SKIP_AUTH === "true";

const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();

export const authConfig = {
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      return Boolean(allowed && email === allowed && profile?.email_verified !== false);
    },
    authorized({ auth }) {
      return skipAuth || Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
