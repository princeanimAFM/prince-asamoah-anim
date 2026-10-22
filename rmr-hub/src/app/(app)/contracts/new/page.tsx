import type { Metadata } from "next";
import { createContract } from "@/app/contract-actions";
import { SubmitButton } from "@/components/buttons";
import { ContractPriceFields } from "@/components/ContractPriceFields";
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

        <ContractPriceFields />

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
