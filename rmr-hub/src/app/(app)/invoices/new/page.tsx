import type { Metadata } from "next";
import { createInvoice } from "@/app/actions";
import { SubmitButton } from "@/components/buttons";
import { Empty, Notice, PageHeader } from "@/components/ui";
import { getClient, getSettings, listClients, listTimeEntries } from "@/lib/data";
import { formatDate, todayISO } from "@/lib/dates";
import { formatGBP, formatHours } from "@/lib/money";

export const metadata: Metadata = { title: "New invoice" };

export default async function NewInvoice({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const clientId = Number(sp.clientId) || 0;
  const [clients, settings] = await Promise.all([listClients(), getSettings()]);

  if (clients.length === 0) {
    return (
      <>
        <PageHeader title="New invoice" />
        <Empty href="/clients/new" cta="Add a client">
          Add a client first, then come back to invoice them.
        </Empty>
      </>
    );
  }

  const client = clientId ? await getClient(clientId) : null;
  if (!client) {
    return (
      <>
        <PageHeader title="New invoice" subtitle="Who is it for?" />
        <form className="card flex max-w-md flex-col gap-3" method="get">
          <label className="field">
            Client
            <select name="clientId" className="input" required defaultValue="">
              <option value="" disabled>
                Choose a client
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary">Continue</button>
        </form>
      </>
    );
  }

  const unbilled = await listTimeEntries({ clientId, unbilled: true });

  return (
    <>
      <PageHeader title="New invoice" subtitle={`For ${client.company || client.name}`} />
      {sp.error === "empty" && <Notice tone="bad">Add at least one line: tick some hours or fill in a line below.</Notice>}
      <form action={createInvoice} className="flex max-w-3xl flex-col gap-4">
        <input type="hidden" name="clientId" value={clientId} />

        <section className="card" aria-labelledby="hours-h">
          <h2 id="hours-h" className="text-xl font-extrabold">
            Unbilled hours
          </h2>
          <p className="mb-3 text-sm text-grey">Charged at your rate of {formatGBP(settings.hourlyRate)} an hour.</p>
          {unbilled.length === 0 ? (
            <p className="text-sm text-grey">No unbilled hours for this client.</p>
          ) : (
            <ul className="divide-y divide-line">
              {unbilled.map(({ entry }) => (
                <li key={entry.id}>
                  <label className="flex min-h-11 items-center gap-3 py-2">
                    <input type="checkbox" name="entry" value={entry.id} defaultChecked className="size-5 accent-blue" />
                    <span className="flex-1">
                      {entry.description || "Software development"}
                      <span className="block text-xs text-grey">{formatDate(entry.date)}</span>
                    </span>
                    <span className="font-bold">{formatHours(entry.minutes)}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="lines-h">
          <h2 id="lines-h" className="mb-3 text-xl font-extrabold">
            Fixed-price lines
          </h2>
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_4.5rem_6.5rem] gap-2">
                <label className="field">
                  <span className={i ? "sr-only" : ""}>Description</span>
                  <input name="itemDescription" className="input" placeholder={i === 0 ? "e.g. Website design and build" : ""} />
                </label>
                <label className="field">
                  <span className={i ? "sr-only" : ""}>Qty</span>
                  <input name="itemQuantity" type="number" min="0" step="0.25" defaultValue="1" className="input" />
                </label>
                <label className="field">
                  <span className={i ? "sr-only" : ""}>Price £</span>
                  <input name="itemPrice" inputMode="decimal" className="input" placeholder="0.00" />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="card grid gap-3 sm:grid-cols-2">
          <label className="field">
            Invoice date
            <input type="date" name="issueDate" defaultValue={todayISO()} className="input" required />
          </label>
          <p className="self-end pb-3 text-sm text-grey">Due {settings.paymentTermsDays} days later (change in Settings).</p>
          <label className="field sm:col-span-2">
            Note on the invoice (optional)
            <textarea name="notes" rows={2} className="input py-2" placeholder="e.g. 50% deposit for the booking system" />
          </label>
        </section>

        <div>
          <SubmitButton pendingText="Creating…">Create invoice</SubmitButton>
        </div>
      </form>
    </>
  );
}
