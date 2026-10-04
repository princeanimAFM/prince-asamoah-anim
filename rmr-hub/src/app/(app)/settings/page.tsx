import type { Metadata } from "next";
import { backupNow, disconnectMonzoAccount, restoreFromBackup, saveSettings, syncMonzoNow } from "@/app/actions";
import { ActionButton, ResultButton, SubmitButton } from "@/components/buttons";
import { Notice, PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { driveStatus } from "@/lib/google";
import { monzoStatus } from "@/lib/monzo";
import { REGIONS } from "@/lib/tax";

export const metadata: Metadata = { title: "Settings" };

const pounds = (pence: number) => (pence / 100).toFixed(2);

const MONZO_NOTICES: Record<string, { tone: "good" | "bad"; text: string }> = {
  approve: {
    tone: "good",
    text: "Monzo is connected. Now open the Monzo app and approve access (look for the notification), then press Sync now.",
  },
  failed: { tone: "bad", text: "Monzo couldn't be connected. Please try again." },
  setup: { tone: "bad", text: "Monzo isn't set up yet: add MONZO_CLIENT_ID and MONZO_CLIENT_SECRET (see the README)." },
};

const RESTORE_ERRORS: Record<string, string> = {
  confirm: "Tick the box to confirm you want to replace everything with the backup.",
  file: "Choose a backup file (.json) first.",
  big: "That file is too large to be an RMR Hub backup.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; monzo?: string; restore?: string; why?: string; restored?: string; clients?: string }>;
}) {
  const [s, drive, monzo, sp] = await Promise.all([getSettings(), driveStatus(), monzoStatus(), searchParams]);
  const monzoNotice = sp.monzo ? MONZO_NOTICES[sp.monzo] : undefined;
  return (
    <>
      <PageHeader title="Settings" />
      {sp.saved && <Notice tone="good">Settings saved.</Notice>}
      {monzoNotice && <Notice tone={monzoNotice.tone}>{monzoNotice.text}</Notice>}
      {sp.restored && (
        <Notice tone="good">
          Backup restored: {sp.clients ?? 0} clients and {sp.restored} invoices, with all their payments, hours and contracts.
        </Notice>
      )}
      {sp.restore && (
        <Notice tone="bad">
          {sp.restore === "failed" ? `Nothing was changed. ${sp.why?.slice(0, 200) ?? ""}` : RESTORE_ERRORS[sp.restore] ?? "Nothing was changed."}
        </Notice>
      )}

      <section id="monzo" className="card mb-4 flex max-w-3xl scroll-mt-20 flex-col gap-3" aria-labelledby="monzo-h">
        <h2 id="monzo-h" className="text-xl font-extrabold">
          Monzo
        </h2>
        {monzo.connected ? (
          <>
            <p className="text-sm">
              Connected{monzo.accountName ? <> to your <b>{monzo.accountName}</b></> : null}.{" "}
              {monzo.lastSyncAt
                ? `Last synced ${formatDate(monzo.lastSyncAt.toISOString().slice(0, 10))}. It syncs by itself every morning.`
                : "Not synced yet."}
            </p>
            {monzo.personal && (
              <p className="rounded-xl bg-ground p-3 text-sm">
                This is a personal account, so only business transactions are brought in: payments in that quote an
                invoice number (e.g. RMR-0002), and anything you tag <b>#rmr</b> in the transaction&apos;s notes in the
                Monzo app (business costs, or a client payment without a reference).
              </p>
            )}
            {monzo.lastError && <p className="text-sm font-semibold text-bad">{monzo.lastError}</p>}
            <div className="flex flex-wrap gap-2">
              <ResultButton action={syncMonzoNow} icon="money" className="btn-primary">
                Sync now
              </ResultButton>
              <a href="/api/monzo/connect" className="btn-secondary">
                Reconnect
              </a>
              <ActionButton
                action={disconnectMonzoAccount}
                confirm="Disconnect Monzo? Transactions already imported stay."
                className="btn-danger"
              >
                Disconnect
              </ActionButton>
            </div>
            <p className="text-xs text-grey">
              Read-only: the app can see transactions, never move money. Monzo asks you to reconnect every so often for
              security; you&apos;ll see a message here when it does.
            </p>
          </>
        ) : monzo.configured ? (
          <>
            <p className="text-sm text-grey">
              Bring in your Monzo transactions automatically instead of uploading statements. You sign in to Monzo, then
              approve access in the Monzo app.
            </p>
            <div>
              <a href="/api/monzo/connect" className="btn-primary">
                Connect Monzo
              </a>
            </div>
          </>
        ) : (
          <p className="text-sm text-grey">
            To sync Monzo automatically, create a free client at developers.monzo.com and add its ID and secret as
            MONZO_CLIENT_ID and MONZO_CLIENT_SECRET (steps in the README). Until then, import statement CSVs on the Money
            page.
          </p>
        )}
      </section>
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

        <section id="reminders" className="card flex flex-col gap-2 scroll-mt-20" aria-labelledby="rem-h">
          <h2 id="rem-h" className="text-xl font-extrabold">
            Payment reminders
          </h2>
          <label className="flex min-h-11 items-center gap-3 font-semibold">
            <input type="checkbox" name="autoReminders" defaultChecked={s.autoReminders} className="size-5 accent-blue" />
            Email reminders automatically, 1, 7 and 14 days after an invoice is due
          </label>
          <p className="text-sm text-grey">
            Only for invoices you emailed from the app, until they're marked paid. Reminders come from your Gmail with the
            invoice attached.
          </p>
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
          Google Drive and Gmail
        </h2>
        <p className="mt-1 text-sm text-grey">
          {drive.connected
            ? `Connected as ${drive.email}. Files are saved in a "RMR Dev Works" folder, and invoices are emailed from this address. RMR Hub can only see files it created, and can send email but not read it. If emailing says it isn't allowed yet, sign out and sign in again.`
            : "Not connected. Sign out and sign in with Google to connect."}
        </p>
      </section>

      <section id="backups" className="card mt-4 flex max-w-3xl scroll-mt-20 flex-col gap-3" aria-labelledby="backup-h">
        <h2 id="backup-h" className="text-xl font-extrabold">
          Backups
        </h2>
        <p className="text-sm text-grey">
          Every morning everything is copied to Google Drive, in <b>RMR Dev Works › Backups</b>: a full backup file for each
          day, and spreadsheets of your clients, invoices, money, hours and contracts that open in Google Sheets or Excel.
          {s.lastBackupAt ? ` Last backup: ${formatDate(s.lastBackupAt.toISOString().slice(0, 10))}.` : " No backup yet."}
        </p>
        <div className="flex flex-wrap gap-2">
          {drive.connected && <ResultButton action={backupNow}>Back up now</ResultButton>}
          <a href="/settings/backup" className="btn-secondary">
            Download a backup
          </a>
        </div>
        <details className="rounded-xl bg-ground p-3">
          <summary className="cursor-pointer font-bold">Restore from a backup</summary>
          <form action={restoreFromBackup} className="mt-3 flex flex-col gap-3">
            <p className="text-sm">
              Replaces <b>all</b> clients, invoices, payments, hours, contracts and settings with the ones in the backup file.
              Your Google and Monzo connections stay. If anything goes wrong, nothing is changed.
            </p>
            <label className="field">
              Backup file (RMR Hub backup ….json)
              <input type="file" name="backup" accept=".json,application/json" required className="input py-2" />
            </label>
            <label className="flex min-h-11 items-center gap-3 font-semibold">
              <input type="checkbox" name="confirm" className="size-5 accent-blue" />
              Replace everything with this backup
            </label>
            <div>
              <SubmitButton className="btn-danger" pendingText="Restoring…">
                Restore
              </SubmitButton>
            </div>
          </form>
        </details>
      </section>
    </>
  );
}
