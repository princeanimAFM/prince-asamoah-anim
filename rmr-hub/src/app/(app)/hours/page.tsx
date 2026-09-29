import type { Metadata } from "next";
import Link from "next/link";
import { deleteTimeEntry, logTime } from "@/app/actions";
import { ActionButton, SubmitButton } from "@/components/buttons";
import { HoursMeter, Notice, PageHeader } from "@/components/ui";
import { getSettings, listClients, listTimeEntries, weeklyHours } from "@/lib/data";
import { addDays, formatDate, todayISO } from "@/lib/dates";
import { formatHours } from "@/lib/money";

export const metadata: Metadata = { title: "Hours" };

export default async function HoursPage({
  searchParams,
}: {
  searchParams: Promise<{ logged?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const [settings, clients, weeks, entries] = await Promise.all([
    getSettings(),
    listClients(),
    weeklyHours(8),
    listTimeEntries({ from: addDays(todayISO(), -60) }),
  ]);
  const limit = settings.weeklyHourLimit;
  const thisWeek = weeks[0].minutes;

  return (
    <>
      <PageHeader
        title="Hours"
        subtitle={`Every hour on RMR Dev Works counts towards your ${limit}-hour weekly visa limit, including admin and your own projects.`}
      />
      {sp.logged && (
        <Notice tone={thisWeek > limit * 60 ? "bad" : "good"}>
          Logged {formatHours(Number(sp.logged))}. This week: {formatHours(thisWeek)} of {limit}h.
          {thisWeek > limit * 60 ? " That's over your weekly limit." : ""}
        </Notice>
      )}
      {sp.error && <Notice tone="bad">Enter how long you worked.</Notice>}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <form action={logTime} className="card flex flex-col gap-3" aria-labelledby="log-heading">
          <h2 id="log-heading" className="text-xl font-extrabold">
            Log time
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">
              Date
              <input type="date" name="date" defaultValue={todayISO()} className="input" required />
            </label>
            <label className="field">
              Client
              <select name="clientId" className="input" defaultValue="">
                <option value="">RMR Dev Works (own work)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Hours
              <input type="number" name="hours" min="0" max="24" step="1" inputMode="numeric" defaultValue="1" className="input" />
            </label>
            <label className="field">
              Minutes
              <select name="minutes" className="input" defaultValue="0">
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            What did you do?
            <input name="description" className="input" placeholder="e.g. Booking page layout" />
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="billable" defaultChecked className="size-5 accent-blue" />
            Billable to the client
          </label>
          <SubmitButton>Save time</SubmitButton>
        </form>

        <section className="card" aria-labelledby="weeks-heading">
          <h2 id="weeks-heading" className="text-xl font-extrabold">
            Weekly totals
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {weeks.map((w, i) => (
              <li key={w.week}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{i === 0 ? "This week" : `w/c ${formatDate(w.week)}`}</span>
                  <span className={w.minutes > limit * 60 ? "font-bold text-bad" : "text-grey"}>
                    {formatHours(w.minutes)} / {limit}h
                  </span>
                </div>
                <HoursMeter minutes={w.minutes} limit={limit} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card mt-4" aria-labelledby="entries-heading">
        <h2 id="entries-heading" className="mb-2 text-xl font-extrabold">
          Recent entries
        </h2>
        {entries.length === 0 ? (
          <p className="text-grey">No time logged in the last 60 days.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Work</th>
                  <th className="text-right">Time</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map(({ entry, clientName }) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap">{formatDate(entry.date)}</td>
                    <td>{clientName ?? "Own work"}</td>
                    <td>
                      {entry.description || "—"}
                      {entry.invoiceId ? (
                        <Link href={`/invoices/${entry.invoiceId}`} className="link ml-2 text-xs">
                          invoiced
                        </Link>
                      ) : !entry.billable ? (
                        <span className="ml-2 text-xs text-grey">not billable</span>
                      ) : null}
                    </td>
                    <td className="text-right font-bold whitespace-nowrap">{formatHours(entry.minutes)}</td>
                    <td className="text-right">
                      {!entry.invoiceId && (
                        <ActionButton
                          action={deleteTimeEntry.bind(null, entry.id)}
                          confirm="Delete this time entry?"
                          className="btn-danger min-h-9 px-2"
                          icon="trash"
                          label="Delete entry"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
