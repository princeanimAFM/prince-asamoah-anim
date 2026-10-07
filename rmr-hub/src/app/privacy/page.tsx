import type { Metadata } from "next";
import Link from "next/link";
import { Blocks } from "@/components/icons";
import { getSettings } from "@/lib/data";
import { SIGNED_LINK_DAYS } from "@/lib/signing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Privacy" };

/** Public privacy notice (linked from the login page and Google's consent screen). */
export default async function Privacy() {
  const s = await getSettings();
  const owner = s.ownerName || "the owner";
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-6 flex items-center gap-3">
        <Blocks size={34} />
        <div className="font-display text-xl font-extrabold">
          RMR <span className="text-blue">Hub</span>
        </div>
      </header>
      <article className="card flex flex-col gap-4 leading-relaxed">
        <h1 className="text-3xl font-extrabold">Privacy notice</h1>
        <p>
          RMR Hub is the private business tool of {owner}, trading as {s.businessName}. It is used to keep business
          records: hours, clients, invoices, payments, contracts and tax. Only {owner} can sign in.
        </p>

        <h2 className="text-xl font-extrabold">Google account data</h2>
        <p>When {owner} signs in with Google, RMR Hub receives and uses:</p>
        <ul className="list-disc pl-6">
          <li>Their name and email address, to confirm it is them.</li>
          <li>
            Google Drive access limited to files RMR Hub creates (the <code>drive.file</code> permission), to save
            invoices, signed contracts, receipts and backups in an &ldquo;RMR Dev Works&rdquo; folder. It cannot see any other
            files.
          </li>
          <li>
            Permission to send email (<code>gmail.send</code>), only for invoices and payment reminders. It cannot read
            any email.
          </li>
        </ul>
        <p>
          Google data is used only for these features. It is never sold, shared with others, used for advertising, or
          used to train AI models. The sign-in tokens are stored in RMR Hub&apos;s database so these features keep working,
          and can be revoked at any time at{" "}
          <a className="link" href="https://myaccount.google.com/permissions">
            myaccount.google.com/permissions
          </a>
          . RMR Hub&apos;s use of information received from Google APIs adheres to the{" "}
          <a className="link" href="https://developers.google.com/terms/api-services-user-data-policy">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>

        <h2 className="text-xl font-extrabold">Clients and people we pay or are paid by</h2>
        <p>
          {owner} is the data controller. If you are a client of {s.businessName}, RMR Hub holds your name, company,
          email address, phone number, postal address and any notes about our work together, plus the hours worked for
          you, your invoices and payments, and any agreement you sign online. Bank transactions brought in from{" "}
          {owner}&apos;s bank (Monzo or a statement file) include the name and payment reference of whoever paid or was
          paid.
        </p>
        <p>
          Signing an agreement online records your typed name, your signature if you draw one, and the time, IP address
          and browser used, as proof of signing. These appear on the signed PDF. Your signing link shows the agreement
          and its signed copy for {SIGNED_LINK_DAYS} days after you sign, then stops working; ask {owner} if you need
          another copy.
        </p>

        <h2 className="text-xl font-extrabold">Why, and the legal basis</h2>
        <ul className="list-disc pl-6">
          <li>To agree, deliver and invoice our work, and chase unpaid invoices: to carry out our contract with you.</li>
          <li>To keep accounts and tax records: a legal obligation (HMRC record-keeping rules).</li>
          <li>
            To keep proof of who signed an agreement and when: our legitimate interest in being able to show the
            agreement was made.
          </li>
        </ul>
        <p>Your information is never sold, used for marketing, or used to make automated decisions about you.</p>

        <h2 className="text-xl font-extrabold">Where it is kept</h2>
        <p>
          Records are kept with the services RMR Hub runs on: Netlify (hosting), Neon (database), Google (Drive and
          Gmail) and, for {owner}&apos;s own bank transactions, Monzo (read-only). A full backup of the records, including
          signing records, is saved to {owner}&apos;s Google Drive every day. Netlify, Neon and Google may process data
          in the United States; those transfers are covered by the UK&ndash;US data bridge or the providers&apos; standard
          data protection clauses.
        </p>

        <h2 className="text-xl font-extrabold">How long it is kept</h2>
        <p>
          Invoices, payments and other accounting records are kept for 6 years after the end of the tax year they belong
          to, as HMRC requires. Signed agreements and their signing records are kept for 6 years after the agreement
          ends, the period in which a claim about it could be made. After that, {owner} deletes them, including from the
          backups in Google Drive.
        </p>

        <h2 className="text-xl font-extrabold">Your rights and contact</h2>
        <p>
          Under UK GDPR you can ask for a copy of the data held about you, ask for it to be corrected, deleted where we
          don&apos;t need to keep it, or restricted, object to us using it, and ask for it in a portable format. Contact{" "}
          {owner}
          {s.email ? (
            <>
              {" "}
              at{" "}
              <a className="link" href={`mailto:${s.email}`}>
                {s.email}
              </a>
            </>
          ) : null}
          {s.phone ? <> or on {s.phone}</> : null}. If you are unhappy with how your data is handled, you can complain to
          the Information Commissioner&apos;s Office at{" "}
          <a className="link" href="https://ico.org.uk/make-a-complaint/">
            ico.org.uk
          </a>
          .
        </p>
        <p className="text-sm text-grey">
          <Link href="/login" className="link">
            Back to sign in
          </Link>
        </p>
      </article>
    </main>
  );
}
