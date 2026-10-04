import type { Metadata } from "next";
import Link from "next/link";
import { addTransaction, exportRecordsToDrive } from "@/app/actions";
import { ResultButton, SubmitButton } from "@/components/buttons";
import { Notice, PageHeader, Stat } from "@/components/ui";
import { taxSummary } from "@/lib/data";
import { formatDate, selfAssessmentDates, taxYearOf, todayISO } from "@/lib/dates";
import { driveStatus } from "@/lib/google";
import { formatGBP, percent } from "@/lib/money";
import { REGIONS } from "@/lib/tax";

export const metadata: Metadata = { title: "Tax" };

export default async function TaxPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const sp = await searchParams;
  const current = taxYearOf(todayISO());
  const year = /^\d{4}-\d{2}$/.test(sp.year ?? "") ? sp.year! : current;
  const [t, drive] = await Promise.all([taxSummary(year), driveStatus()]);
  const e = t.estimate;
  const shortfall = e.total - t.saved - t.paid;
  const dates = selfAssessmentDates(year);
  const prev = `${Number(year.slice(0, 4)) - 1}-${year.slice(2, 4)}`;
  const next = `${Number(year.slice(0, 4)) + 1}-${String((Number(year.slice(0, 4)) + 2) % 100).padStart(2, "0")}`;

  return (
    <>
      <PageHeader
        title={`Tax ${year}`}
        subtitle={`6 April ${year.slice(0, 4)} to 5 April ${Number(year.slice(0, 4)) + 1}`}
        action={
          <div className="flex gap-2">
            <Link href={`/tax?year=${prev}`} className="btn-secondary min-h-9">
              ← {prev}
            </Link>
            {year !== current && (
              <Link href={`/tax?year=${next}`} className="btn-secondary min-h-9">
                {next} →
              </Link>
            )}
          </div>
        }
      />

      {t.salary === 0 && (
        <Notice tone="warn">
          Add your expected nursing salary in <Link href="/settings" className="underline">Settings</Link> so the estimate
          uses the right tax band.
        </Notice>
      )}
      {e.coveredByTradingAllowance ? (
        <Notice tone="good">
          Your income this year ({formatGBP(e.income)}) is within the £1,000 trading allowance, so there's no tax to pay
          on it and you don't need to register yet.
        </Notice>
      ) : (
        <Notice>
          Your income is over £1,000, so you need to be registered for Self Assessment by {formatDate(dates.register)}.
        </Notice>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Estimated tax" value={formatGBP(e.total)} hint={`${formatGBP(e.extraIncomeTax)} income tax + ${formatGBP(e.class4)} NI`} />
        <Stat label="Set aside" value={formatGBP(t.saved + t.paid)} hint={`${formatGBP(t.saved)} in pot, ${formatGBP(t.paid)} paid`} />
        <Stat
          label={shortfall > 0 ? "Still to set aside" : "Ahead by"}
          value={formatGBP(Math.abs(shortfall))}
          tone={shortfall > 0 ? "warn" : "good"}
        />
        <Stat label="Save from each payment" value={percent(e.setAsideRate)} hint={`Next £ taxed at ${percent(e.marginalRate)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card" aria-labelledby="calc-h">
          <h2 id="calc-h" className="mb-3 text-xl font-extrabold">
            How it's worked out
          </h2>
          <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
            <dt>Income received</dt>
            <dd className="text-right font-bold">{formatGBP(e.income)}</dd>
            <dt>
              {e.coveredByTradingAllowance
                ? "Trading allowance (covers it all)"
                : e.usesTradingAllowance
                  ? "Trading allowance (better than your expenses)"
                  : "Business expenses"}
            </dt>
            <dd className="text-right font-bold">-{formatGBP(e.deduction)}</dd>
            <dt className="border-t border-line pt-2 font-bold">Taxable profit</dt>
            <dd className="border-t border-line pt-2 text-right font-extrabold">{formatGBP(e.profit)}</dd>
            <dt>Extra income tax (on top of your salary of {formatGBP(t.salary)})</dt>
            <dd className="text-right font-bold">{formatGBP(e.extraIncomeTax)}</dd>
            <dt>Class 4 National Insurance</dt>
            <dd className="text-right font-bold">{formatGBP(e.class4)}</dd>
            <dt className="border-t border-line pt-2 font-bold">Estimated tax for {year}</dt>
            <dd className="border-t border-line pt-2 text-right font-extrabold">{formatGBP(e.total)}</dd>
          </dl>
          <p className="mt-3 text-xs text-grey">
            Estimate using {REGIONS[t.region]} income tax bands (change this in Settings)
            {e.rates.confirmed ? ` for ${e.rates.label}` : `. ${year} rates aren't in the app yet, so it uses the latest confirmed rates`}
            , on money actually received (cash basis). National Insurance is the same across the UK. It doesn't include student loan repayments, pension contributions or other income. Your Self
            Assessment return is the final figure. If your bill is over £1,000, HMRC may also ask for payments on account
            towards next year.
          </p>
        </section>

        <div className="flex flex-col gap-4">
          <form action={addTransaction} className="card flex flex-col gap-3">
            <h2 className="text-xl font-extrabold">Record tax money</h2>
            <input type="hidden" name="returnTo" value={`/tax?year=${year}`} />
            <div className="grid grid-cols-2 gap-3">
              <label className="field">
                What
                <select name="kind" className="input" defaultValue="tax_saving">
                  <option value="tax_saving">Moved to tax pot</option>
                  <option value="tax_payment">Paid to HMRC</option>
                </select>
              </label>
              <label className="field">
                Amount £
                <input name="amount" required inputMode="decimal" className="input" placeholder="0.00" />
              </label>
            </div>
            <label className="field">
              Date
              <input type="date" name="date" defaultValue={todayISO()} className="input" />
            </label>
            <input type="hidden" name="description" value="Tax" />
            <div>
              <SubmitButton>Save</SubmitButton>
            </div>
          </form>

          <section className="card" aria-labelledby="dates-h">
            <h2 id="dates-h" className="mb-2 text-xl font-extrabold">
              Key dates for {year}
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <b>{formatDate(dates.register)}</b>: register for Self Assessment (if you haven't already)
              </li>
              <li>
                <b>{formatDate(dates.fileAndPay)}</b>: file your online return and pay the tax
              </li>
              <li>
                <b>{formatDate(dates.secondPaymentOnAccount)}</b>: second payment on account, if HMRC asks for them
              </li>
            </ul>
          </section>

          <section className="card flex flex-col gap-2" aria-labelledby="rec-h">
            <h2 id="rec-h" className="text-xl font-extrabold">
              Records for your return
            </h2>
            <p className="text-sm text-grey">
              Saves your money in/out and hours log for {year} as spreadsheets in Google Drive (RMR Dev Works › Tax ›{" "}
              {year}). Keep records for at least 5 years.
            </p>
            {drive.connected ? (
              <ResultButton action={exportRecordsToDrive.bind(null, year)}>Save records to Drive</ResultButton>
            ) : (
              <p className="text-sm text-grey">Sign in with Google to save records to Drive.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
