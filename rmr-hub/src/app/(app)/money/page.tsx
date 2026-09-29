import type { Metadata } from "next";
import Link from "next/link";
import { addTransaction, deleteTransaction, importBankCsv } from "@/app/actions";
import { ActionButton, SubmitButton } from "@/components/buttons";
import { KindSelect } from "@/components/KindSelect";
import { KINDS } from "@/lib/kinds";
import { Notice, PageHeader, Stat } from "@/components/ui";
import { getSettings, listTransactions, taxSummary } from "@/lib/data";
import { formatDate, taxYearOf, todayISO } from "@/lib/dates";
import { formatGBP } from "@/lib/money";

export const metadata: Metadata = { title: "Money" };

const ERRORS: Record<string, string> = {
  amount: "Enter an amount and choose a type.",
  file: "Choose a CSV file to import.",
  big: "That file is too large. Export a shorter date range.",
  format: "That file doesn't look like a bank statement CSV. It needs Date and Amount columns.",
};

export default async function MoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; imported?: string; matched?: string; dupes?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const current = taxYearOf(todayISO());
  const year = /^\d{4}-\d{2}$/.test(sp.year ?? "") ? sp.year! : current;
  const [rows, summary, settings] = await Promise.all([listTransactions(year), taxSummary(year), getSettings()]);
  const startYear = Number(current.slice(0, 4));
  const years = [0, 1, 2].map((i) => `${startYear - i}-${String((startYear - i + 1) % 100).padStart(2, "0")}`);

  return (
    <>
      <PageHeader title="Money" subtitle="Everything in and out of your business account." />
      {sp.imported && (
        <Notice tone="good">
          Imported {sp.imported} new transaction{sp.imported === "1" ? "" : "s"}
          {Number(sp.matched) > 0 ? `, matched ${sp.matched} to invoices` : ""}
          {Number(sp.dupes) > 0 ? ` (${sp.dupes} already here, skipped)` : ""}. Check the types below.
        </Notice>
      )}
      {sp.error && <Notice tone="bad">{ERRORS[sp.error] ?? "Something went wrong."}</Notice>}

      <nav aria-label="Tax year" className="mb-4 flex flex-wrap gap-2">
        {years.map((y) => (
          <Link
            key={y}
            href={`/money?year=${y}`}
            aria-current={y === year ? "page" : undefined}
            className={y === year ? "btn-primary min-h-9" : "btn-secondary min-h-9"}
          >
            {y}
          </Link>
        ))}
      </nav>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Income" value={formatGBP(summary.income)} tone="good" />
        <Stat label="Expenses" value={formatGBP(summary.expenses)} />
        <Stat label="Saved for tax" value={formatGBP(summary.saved)} />
        <Stat label="Paid to HMRC" value={formatGBP(summary.paid)} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <form id="import" action={importBankCsv} className="card flex flex-col gap-3">
          <h2 className="text-xl font-extrabold">Import bank statement</h2>
          <p className="text-sm text-grey">
            In the {settings.bankName || "banking"} app: <b>Account › Statements › Export</b> as CSV, then upload it here.
            Transactions already imported are skipped. Payments that mention an invoice number (e.g.{" "}
            {settings.invoicePrefix}-0001) are matched automatically.
          </p>
          <label className="field">
            CSV file
            <input type="file" name="file" accept=".csv,text/csv" required className="input py-2" />
          </label>
          <div>
            <SubmitButton pendingText="Importing…">Import</SubmitButton>
          </div>
        </form>

        <form id="add" action={addTransaction} className="card flex flex-col gap-3">
          <h2 className="text-xl font-extrabold">Add manually</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">
              Date
              <input type="date" name="date" defaultValue={todayISO()} className="input" />
            </label>
            <label className="field">
              Amount £
              <input name="amount" required inputMode="decimal" className="input" placeholder="0.00" />
            </label>
          </div>
          <label className="field">
            Type
            <select name="kind" className="input" defaultValue="expense">
              {Object.entries(KINDS)
                .filter(([k]) => k !== "ignore")
                .map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label className="field">
            Description
            <input name="description" className="input" placeholder="e.g. Claude subscription" />
          </label>
          <div>
            <SubmitButton>Add</SubmitButton>
          </div>
        </form>
      </div>

      <section className="card" aria-labelledby="tx-h">
        <h2 id="tx-h" className="mb-2 text-xl font-extrabold">
          Transactions {year}
        </h2>
        {rows.length === 0 ? (
          <p className="text-grey">Nothing recorded for this tax year yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th>
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ tx, invoiceNumber }) => (
                  <tr key={tx.id} className={tx.kind === "ignore" ? "text-grey" : ""}>
                    <td className="whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="min-w-48">
                      {tx.description}
                      {invoiceNumber && tx.invoiceId ? (
                        <Link href={`/invoices/${tx.invoiceId}`} className="link ml-2 text-xs">
                          {invoiceNumber}
                        </Link>
                      ) : null}
                    </td>
                    <td>
                      <KindSelect id={tx.id} kind={tx.kind} />
                    </td>
                    <td className={`text-right font-bold whitespace-nowrap ${tx.amount > 0 ? "text-good" : ""}`}>
                      {formatGBP(tx.amount, { sign: true })}
                    </td>
                    <td className="text-right">
                      <ActionButton
                        action={deleteTransaction.bind(null, tx.id)}
                        confirm="Delete this transaction?"
                        className="btn-danger min-h-9 px-2"
                        icon="trash"
                        label="Delete transaction"
                      />
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
