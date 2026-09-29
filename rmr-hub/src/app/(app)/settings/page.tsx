import type { Metadata } from "next";
import { saveSettings } from "@/app/actions";
import { SubmitButton } from "@/components/buttons";
import { Notice, PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { driveStatus } from "@/lib/google";
import { REGIONS } from "@/lib/tax";

export const metadata: Metadata = { title: "Settings" };

const pounds = (pence: number) => (pence / 100).toFixed(2);

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [s, drive, sp] = await Promise.all([getSettings(), driveStatus(), searchParams]);
  return (
    <>
      <PageHeader title="Settings" />
      {sp.saved && <Notice tone="good">Settings saved.</Notice>}
      <form action={saveSettings} className="flex max-w-3xl flex-col gap-4">
        <section className="card grid gap-3 sm:grid-cols-2" aria-labelledby="biz-h">
          <h2 id="biz-h" className="text-xl font-extrabold sm:col-span-2">
            Business details (shown on invoices)
          </h2>
          <label className="field">
            Your name
            <input name="ownerName" defaultValue={s.ownerName} className="input" />
          </label>
          <label className="field">
            Trading name
            <input name="businessName" defaultValue={s.businessName} className="input" />
          </label>
          <label className="field">
            Email
            <input name="email" type="email" defaultValue={s.email} className="input" />
          </label>
          <label className="field">
            Phone
            <input name="phone" type="tel" defaultValue={s.phone} className="input" />
          </label>
          <label className="field">
            Website
            <input name="website" defaultValue={s.website} className="input" />
          </label>
          <label className="field sm:col-span-2">
            Business address (sole traders must show one on invoices)
            <textarea name="address" rows={2} defaultValue={s.address} className="input py-2" />
          </label>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2" aria-labelledby="bank-h">
          <h2 id="bank-h" className="text-xl font-extrabold sm:col-span-2">
            Payment details
          </h2>
          <label className="field">
            Bank
            <input name="bankName" defaultValue={s.bankName} className="input" />
          </label>
          <label className="field">
            Account name
            <input name="accountName" defaultValue={s.accountName} className="input" />
          </label>
          <label className="field">
            Sort code
            <input name="sortCode" defaultValue={s.sortCode} className="input" inputMode="numeric" placeholder="04-00-04" />
          </label>
          <label className="field">
            Account number
            <input name="accountNumber" defaultValue={s.accountNumber} className="input" inputMode="numeric" />
          </label>
          <label className="field">
            Payment terms (days)
            <input name="paymentTermsDays" type="number" min="0" defaultValue={s.paymentTermsDays} className="input" />
          </label>
          <label className="field">
            Invoice number prefix
            <input name="invoicePrefix" defaultValue={s.invoicePrefix} className="input" />
          </label>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2" aria-labelledby="work-h">
          <h2 id="work-h" className="text-xl font-extrabold sm:col-span-2">
            Work and tax
          </h2>
          <label className="field">
            Hourly rate £
            <input name="hourlyRate" inputMode="decimal" defaultValue={pounds(s.hourlyRate)} className="input" />
          </label>
          <label className="field">
            Weekly hour limit (visa)
            <input name="weeklyHourLimit" type="number" min="1" defaultValue={s.weeklyHourLimit} className="input" />
          </label>
          <label className="field">
            Where you live (for income tax)
            <select name="taxRegion" defaultValue={s.taxRegion} className="input">
              {Object.entries(REGIONS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field sm:col-span-2">
            Expected nursing salary this tax year £ (before tax)
            <input name="salary" inputMode="decimal" defaultValue={pounds(s.salary)} className="input" />
            <span className="font-normal">Used only to work out which tax band your freelance profit falls into.</span>
          </label>
        </section>

        <div>
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>

      <section className="card mt-4 max-w-3xl" aria-labelledby="drive-h">
        <h2 id="drive-h" className="text-xl font-extrabold">
          Google Drive
        </h2>
        <p className="mt-1 text-sm text-grey">
          {drive.connected
            ? `Connected as ${drive.email}. Files are saved in a "RMR Dev Works" folder. RMR Hub can only see files it created.`
            : "Not connected. Sign out and sign in with Google to connect."}
        </p>
      </section>
    </>
  );
}
