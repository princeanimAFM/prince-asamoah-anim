import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn, skipAuth } from "@/auth";
import { Blocks } from "@/components/icons";

export const metadata: Metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (skipAuth) redirect("/");
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center">
        <div className="mb-4 flex justify-center">
          <Blocks size={56} />
        </div>
        <h1 className="text-3xl font-extrabold">
          RMR <span className="text-blue">Hub</span>
        </h1>
        <p className="mt-1 mb-6 text-grey">Your RMR Dev Works assistant</p>
        {error ? (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-bad">
            That account can't sign in here. Use your RMR Dev Works Google account.
          </p>
        ) : null}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button className="btn-primary w-full">Sign in with Google</button>
        </form>
        <p className="mt-4 text-xs text-grey">Signing in also lets RMR Hub save your invoices and records to Google Drive.</p>
        <p className="mt-3 text-xs">
          <a href="/privacy" className="link">
            Privacy notice
          </a>
        </p>
      </div>
    </main>
  );
}
