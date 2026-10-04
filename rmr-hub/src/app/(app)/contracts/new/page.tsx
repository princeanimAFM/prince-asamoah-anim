import type { Metadata } from "next";
import { createContract } from "@/app/contract-actions";
import { SubmitButton } from "@/components/buttons";
import { Empty, Notice, PageHeader } from "@/components/ui";
import { getSettings, listClients } from "@/lib/data";
import { todayISO } from "@/lib/dates";

export const metadata: Metadata = { title: "New contract" };

export default async function NewContract({ searchParams }: { searchParams: Promise<{ clientId?: string; error?: string }> }) {
  const [clients, settings, sp] = await Promise.all([listClients(), getSettings(), searchParams]);
  if (clients.length === 0) {
    return (
      <>
        <PageHeader title="New contract" />
        <Empty href="/clients/new" cta="Add a client">
          Add the client first, then create their contract.
        </Empty>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="New contract"
        subtitle="Fill in the details. You can read and edit the full wording before sending it."
      />
      {sp.error && <Notice tone="bad">Choose a client.</Notice>}
      <form action={createContract} className="flex max-w-3xl flex-col gap-4">
        <section className="card grid gap-3 sm:grid-cols-2">
          <label className="field">
            Client
            <select name="clientId" required className="input" defaultValue={sp.clientId ?? ""}>
              <option value="" disabled>
                Choose a client
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Project name
            <input name="projectTitle" required className="input" placeholder="e.g. Parcel booking and payments app" />
          </label>
          <label className="field sm:col-span-2">
            What's included (one item per line)
            <textarea
              name="scope"
              rows={6}
              required
              className="input py-2"
              placeholder={"Website with online booking\nShipping labels with QR codes\nAutomatic payment requests and reminders"}
            />
          </label>
        </section>

        <fieldset className="card grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Price</legend>
          <h2 className="text-xl font-extrabold sm:col-span-2">Price</h2>
          <div className="flex flex-col gap-2 sm:col-span-2" role="radiogroup" aria-label="Payment plan">
            <label className="flex min-h-11 items-center gap-2 font-semibold">
              <input type="radio" name="model" value="one_off" defaultChecked className="size-5 accent-blue" /> Buy it (paid
              in stages, theirs at launch)
            </label>
            <label className="flex min-h-11 items-center gap-2 font-semibold">
              <input type="radio" name="model" value="monthly" className="size-5 accent-blue" /> Start fee + monthly (care
              included, theirs at the end)
            </label>
          </div>
          <label className="field">
            Price, or start fee (monthly) £
            <input name="price" required inputMode="decimal" className="input" placeholder="3000" />
          </label>
          <label className="field">
            Paid in (buying)
            <select name="stages" defaultValue="3" className="input">
              <option value="3">3 payments: start, first working version, launch</option>
              <option value="2">2 payments: start, launch</option>
              <option value="1">1 payment before work starts</option>
            </select>
          </label>
          <label className="field">
            Care plan £/month (after buying, or after the monthly term)
            <input name="careMonthly" inputMode="decimal" defaultValue="50" className="input" />
          </label>
          <label className="field">
            Free fixes after launch (days, buying)
            <input name="warrantyDays" type="number" min="0" defaultValue="30" className="input" />
          </label>
          <label className="field">
            Small fix without care £
            <input name="smallFix" inputMode="decimal" defaultValue="150" className="input" />
          </label>
          <label className="field">
            Bigger change without care £
            <input name="biggerChange" inputMode="decimal" defaultValue="300" className="input" />
          </label>
          <h3 className="mt-2 font-extrabold sm:col-span-2">Monthly plan only</h3>
          <label className="field">
            Monthly fee £ (care included)
            <input name="monthly" inputMode="decimal" className="input" placeholder="155" />
          </label>
          <label className="field">
            Monthly payments until it's theirs
            <input name="termMonths" type="number" min="1" defaultValue="24" className="input" />
          </label>
          <label className="field">
            Minimum months
            <input name="minimumMonths" type="number" min="1" defaultValue="12" className="input" />
          </label>
          <label className="field">
            Early buy-out £ per month left
            <input name="buyoutPerMonth" inputMode="decimal" className="input" placeholder="105" />
          </label>
        </fieldset>

        <section className="card grid gap-3 sm:grid-cols-2">
          <h2 className="text-xl font-extrabold sm:col-span-2">Timing and terms</h2>
          <label className="field">
            Start date
            <input name="startDate" type="date" defaultValue={todayISO()} className="input" />
          </label>
          <label className="field">
            Expected time to launch
            <input name="timeline" defaultValue="5 to 6 weeks" className="input" />
          </label>
          <label className="field">
            Rounds of changes included
            <input name="reviewRounds" type="number" min="0" defaultValue="2" className="input" />
          </label>
          <label className="field">
            Governing law
            <select name="law" defaultValue={settings.taxRegion === "rest_of_uk" ? "england_wales" : "scotland"} className="input">
              <option value="scotland">Scotland</option>
              <option value="england_wales">England and Wales</option>
            </select>
          </label>
        </section>
        <p className="text-sm text-grey">
          The standard agreement is a practical starting point, not legal advice. Read it through before sending, and have
          a solicitor check it once if you can.
        </p>
        <div>
          <SubmitButton pendingText="Creating…">Create draft</SubmitButton>
        </div>
      </form>
    </>
  );
}
