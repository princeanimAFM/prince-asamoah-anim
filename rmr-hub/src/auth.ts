import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { saveGoogleTokens } from "@/lib/google";

export { skipAuth } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  events: {
    async signIn({ account, profile }) {
      if (!account || account.provider !== "google" || !profile?.email) return;
      await saveGoogleTokens({
        email: profile.email,
        accessToken: account.access_token ?? null,
        refreshToken: account.refresh_token ?? null,
        expiresAt: account.expires_at ?? null,
      });
    },
  },
});
