import Link from "next/link";
import { Icon } from "@/components/icons";
import { HoursMeter, Notice, Stat, StatusBadge } from "@/components/ui";
import { getSettings, listInvoices, taxSummary, weeklyHours } from "@/lib/data";
import { formatDate, selfAssessmentDates, todayISO, ukHour } from "@/lib/dates";
import { formatGBP, formatHours, percent } from "@/lib/money";

export default async function Dashboard() {
  const [settings, weeks, invoices, tax] = await Promise.all([
    getSettings(),
    weeklyHours(1),
    listInvoices(),
    taxSummary(),
  ]);
  const thisWeek = weeks[0].minutes;
  const limit = settings.weeklyHourLimit;
  const unpaid = invoices.filter((i) => i.status === "sent");
  const unpaidTotal = unpaid.reduce((a, i) => a + i.total, 0);
  const overdue = unpaid.filter((i) => i.overdue);
  const shortfall = tax.estimate.total - tax.saved - tax.paid;
  const deadlines = selfAssessmentDates(tax.taxYear);
  const hour = ukHour();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="mb-5">
        <p className="text-grey">{formatDate(todayISO())}</p>
        <h1 className="text-3xl font-extrabold">
          {greeting}, {settings.ownerName.split(" ")[0]}
        </h1>
      </div>

      {thisWeek > limit * 60 ? (
        <Notice tone="bad">
          You've logged {formatHours(thisWeek)} this week, over your {limit}-hour visa limit. Stop client work for this
          week and check your hours log.
        </Notice>
      ) : thisWeek >= (limit - 4) * 60 ? (
        <Notice tone="warn">
          {formatHours(limit * 60 - thisWeek)} left before your {limit}-hour weekly limit.
        </Notice>
      ) : null}
      {overdue.length > 0 && (
        <Notice tone="warn">
          {overdue.length} overdue invoice{overdue.length > 1 ? "s" : ""}.{" "}
          <Link href="/invoices" className="underline">
            Review
          </Link>
        </Notice>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card col-span-2">
          <div className="flex items-baseline justify-between">
            <div className="label">Hours this week</div>
            <div className="text-sm text-grey">limit {limit}h</div>
          </div>
          <div className="font-display mt-1 mb-3 text-2xl font-extrabold">{formatHours(thisWeek)}</div>
          <HoursMeter minutes={thisWeek} limit={limit} />
          <Link href="/hours" className="btn-primary mt-4 w-full sm:w-auto">
            <Icon name="plus" size={18} /> Log time
          </Link>
        </div>
        <Stat label="Unpaid invoices" value={formatGBP(unpaidTotal)} hint={`${unpaid.length} waiting`} />
        <Stat label={`Earned ${tax.taxYear}`} value={formatGBP(tax.income)} hint="Money received this tax year" />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Tax set-aside</h2>
            <Link href="/tax" className="link text-sm">
              Details
            </Link>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-grey">Estimated tax {tax.taxYear}</dt>
            <dd className="text-right font-bold">{formatGBP(tax.estimate.total)}</dd>
            <dt className="text-grey">Saved in tax pot</dt>
            <dd className="text-right font-bold">{formatGBP(tax.saved)}</dd>
            <dt className="text-grey">{shortfall > 0 ? "Still to set aside" : "Ahead by"}</dt>
            <dd className={`text-right font-bold ${shortfall > 0 ? "text-warn" : "text-good"}`}>
              {formatGBP(Math.abs(shortfall))}
            </dd>
          </dl>
          <p className="mt-3 text-sm text-grey">
            Put about <b className="text-navy">{percent(tax.estimate.setAsideRate)}</b> of each payment into your tax pot.
            Next deadline: register by {formatDate(deadlines.register)}, pay by {formatDate(deadlines.fileAndPay)}.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Waiting for payment</h2>
            <Link href="/invoices" className="link text-sm">
              All invoices
            </Link>
          </div>
          {unpaid.length === 0 ? (
            <p className="mt-3 text-sm text-grey">Nothing outstanding.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {unpaid.slice(0, 5).map((i) => (
                <li key={i.id}>
                  <Link href={`/invoices/${i.id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{i.clientName}</span>
                      <span className="text-sm text-grey">
                        {i.number} · due {formatDate(i.dueDate)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="font-bold">{formatGBP(i.total)}</span>
                      <StatusBadge status={i.status} overdue={i.overdue} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/invoices/new" className="btn-secondary">
          <Icon name="invoice" size={18} /> New invoice
        </Link>
        <Link href="/money#add" className="btn-secondary">
          <Icon name="money" size={18} /> Add payment
        </Link>
        <Link href="/money#import" className="btn-secondary">
          <Icon name="upload" size={18} /> Import bank
        </Link>
        <Link href="/clients/new" className="btn-secondary">
          <Icon name="users" size={18} /> New client
        </Link>
      </div>
    </>
  );
}
