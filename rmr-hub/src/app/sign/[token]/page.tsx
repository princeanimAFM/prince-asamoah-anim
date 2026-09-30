import type { Metadata } from "next";
import { signContract } from "@/app/contract-actions";
import { ContractText } from "@/components/ContractText";
import { SignaturePad } from "@/components/SignaturePad";
import { SubmitButton } from "@/components/buttons";
import { Blocks } from "@/components/icons";
import { Notice } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { getContractByToken } from "@/lib/contracts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign agreement", referrer: "no-referrer", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  details: "Please type your full name and tick the box to agree.",
  signature: "That signature couldn't be read. Clear it and draw it again, or leave it blank.",
  changed: "This agreement has changed since it was sent. Please ask for a new link.",
};

export default async function SignPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ signed?: string; error?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const [row, settings] = await Promise.all([getContractByToken(token), getSettings()]);

  const shell = (children: React.ReactNode) => (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6 flex items-center gap-3">
        <Blocks size={34} />
        <div>
          <div className="font-display text-xl font-extrabold">
            RMR <span className="text-blue">Dev Works</span>
          </div>
          <div className="text-sm text-grey">{settings.ownerName} · Where ideas take shape</div>
        </div>
      </header>
      {children}
    </main>
  );

  if (!row) {
    return shell(
      <div className="card">
        <h1 className="text-2xl font-extrabold">This link isn&apos;t active</h1>
        <p className="mt-2 text-grey">
          It may have been withdrawn or replaced. Please contact {settings.ownerName} on {settings.phone} for a new link.
        </p>
      </div>,
    );
  }

  const { contract, client } = row;
  const signed = contract.status === "signed";
  return shell(
    <>
      {signed ? (
        <Notice tone="good">
          {sp.signed ? "Thank you, the agreement is signed. " : "This agreement has been signed. "}
          <a href={`/sign/${token}/pdf`} className="underline">
            Download your signed copy (PDF)
          </a>
          .
        </Notice>
      ) : (
        <p className="mb-4 text-grey">
          {settings.ownerName} has sent this agreement to {client.company || client.name}. Please read it, then sign at the
          bottom.
        </p>
      )}
      {sp.error && !signed && <Notice tone="bad">{ERRORS[sp.error] ?? "Something went wrong. Please try again."}</Notice>}

      <article className="card mb-4">
        <h1 className="mb-3 text-2xl font-extrabold">{contract.title}</h1>
        <ContractText body={contract.body} />
      </article>

      {!signed && (
        <form action={signContract} className="card flex flex-col gap-4" aria-labelledby="sign-h">
          <h2 id="sign-h" className="text-xl font-extrabold">
            Sign the agreement
          </h2>
          <input type="hidden" name="token" value={token} />
          <label className="field">
            Your full name
            <input name="name" required minLength={2} maxLength={120} autoComplete="name" className="input" />
          </label>
          <div className="field">
            <span>Your signature</span>
            <SignaturePad />
          </div>
          <label className="flex min-h-11 items-start gap-3 text-sm font-semibold">
            <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-blue" />
            <span>
              I have read this agreement, I am authorised to sign it for {client.company || client.name}, and I agree to
              sign it electronically.
            </span>
          </label>
          <div>
            <SubmitButton pendingText="Signing…">Sign agreement</SubmitButton>
          </div>
          <p className="text-xs text-grey">
            We record your name, the time, your IP address and browser as proof of signing. You&apos;ll get a signed PDF
            copy straight away.
          </p>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-grey">
        <a href={`/sign/${token}/pdf`} className="link">
          Download as PDF
        </a>
      </p>
    </>,
  );
}
