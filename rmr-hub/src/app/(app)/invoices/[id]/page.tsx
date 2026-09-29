import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addInvoiceItem,
  deleteDraftInvoice,
  markInvoicePaid,
  removeInvoiceItem,
  saveInvoiceToDrive,
  setInvoiceStatus,
  updateInvoiceDetails,
} from "@/app/actions";
import { ActionButton, ResultButton, SubmitButton } from "@/components/buttons";
import { Icon } from "@/components/icons";
import { Notice, PageHeader, StatusBadge } from "@/components/ui";
import { getInvoice, getSettings, lineAmount } from "@/lib/data";
import { formatDate, todayISO } from "@/lib/dates";
import { driveLink, driveStatus } from "@/lib/google";
import { formatGBP } from "@/lib/money";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [data, settings, drive] = await Promise.all([getInvoice(id), getSettings(), driveStatus()]);
  if (!data) notFound();
  const { invoice, client, items, payments, total } = data;
  const received = payments.filter((p) => p.kind === "income").reduce((a, p) => a + p.amount, 0);
  const due = Math.max(0, total - received);
  const draft = invoice.status === "draft";
  const overdue = invoice.status === "sent" && invoice.dueDate < todayISO();
  const mailto = client.email
    ? `mailto:${client.email}?subject=${encodeURIComponent(`Invoice ${invoice.number} from ${settings.businessName}`)}&body=${encodeURIComponent(
        `Hi ${client.name.split(" ")[0]},\n\nPlease find attached invoice ${invoice.number} for ${formatGBP(due)}, due on ${formatDate(invoice.dueDate)}.\n\nPayment details are on the invoice. Please use ${invoice.number} as the reference.\n\nThank you,\n${settings.ownerName}\n${settings.businessName}`,
      )}`
    : null;

  return (
    <>
      <PageHeader
        title={invoice.number}
        subtitle={
          <>
            <Link href={`/clients/${client.id}`} className="link">
              {client.company || client.name}
            </Link>{" "}
            · {formatGBP(total)} <StatusBadge status={invoice.status} overdue={overdue} />
          </>
        }
        action={
          <div className="flex flex-wrap gap-2">
            <a href={`/invoices/${id}/pdf`} target="_blank" rel="noreferrer" className="btn-primary">
              <Icon name="download" size={18} /> PDF
            </a>
            {mailto && (
              <a href={mailto} className="btn-secondary">
                Email client
              </a>
            )}
          </div>
        }
      />

      {draft && (
        <Notice>
          This is a draft. Check the lines, download the PDF, send it to your client, then mark it as sent.
        </Notice>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="card" aria-labelledby="items-h">
          <h2 id="items-h" className="mb-2 text-xl font-extrabold">
            Lines
          </h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                  {draft && (
                    <th>
                      <span className="sr-only">Remove</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.description}</td>
                    <td className="text-right">{it.quantity / 100}</td>
                    <td className="text-right whitespace-nowrap">{formatGBP(it.unitPrice)}</td>
                    <td className="text-right font-bold whitespace-nowrap">{formatGBP(lineAmount(it))}</td>
                    {draft && (
                      <td className="text-right">
                        <ActionButton
                          action={removeInvoiceItem.bind(null, id, it.id)}
                          className="btn-danger min-h-9 px-2"
                          icon="trash"
                          label={`Remove ${it.description}`}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right font-bold">
                    Total
                  </td>
                  <td className="text-right text-lg font-extrabold whitespace-nowrap">{formatGBP(total)}</td>
                </tr>
                {received > 0 && (
                  <tr>
                    <td colSpan={3} className="text-right">
                      Paid so far
                    </td>
                    <td className="text-right whitespace-nowrap">{formatGBP(received)}</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {draft && (
            <form action={addInvoiceItem} className="mt-4 grid grid-cols-[1fr_4.5rem_6.5rem] gap-2 border-t border-line pt-4">
              <input type="hidden" name="invoiceId" value={id} />
              <label className="field">
                Add a line
                <input name="description" required className="input" />
              </label>
              <label className="field">
                Qty
                <input name="quantity" type="number" min="0" step="0.25" defaultValue="1" className="input" />
              </label>
              <label className="field">
                Price £
                <input name="price" required inputMode="decimal" className="input" />
              </label>
              <div className="col-span-3">
                <SubmitButton className="btn-secondary">Add line</SubmitButton>
              </div>
            </form>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className="card flex flex-col gap-3" aria-labelledby="status-h">
            <h2 id="status-h" className="text-xl font-extrabold">
              Status
            </h2>
            {draft && (
              <ActionButton action={setInvoiceStatus.bind(null, id, "sent")} className="btn-primary">
                Mark as sent
              </ActionButton>
            )}
            {(invoice.status === "sent" || (draft && total > 0)) && (
              <form action={markInvoicePaid} className="flex flex-col gap-2 rounded-xl bg-ground p-3">
                <input type="hidden" name="id" value={id} />
                <div className="grid grid-cols-2 gap-2">
                  <label className="field">
                    Paid on
                    <input type="date" name="date" defaultValue={todayISO()} className="input" />
                  </label>
                  <label className="field">
                    Amount £
                    <input name="amount" inputMode="decimal" defaultValue={(due / 100).toFixed(2)} className="input" />
                  </label>
                </div>
                <SubmitButton className="btn-secondary">Record payment</SubmitButton>
                <p className="text-xs text-grey">Tip: importing your Monzo statement matches payments that use {invoice.number} as the reference.</p>
              </form>
            )}
            {invoice.status === "paid" && <p className="font-bold text-good">Paid on {formatDate(invoice.paidDate)}</p>}
            {invoice.status === "sent" && (
              <ActionButton action={setInvoiceStatus.bind(null, id, "draft")} className="btn-secondary">
                Back to draft
              </ActionButton>
            )}
            {invoice.status !== "paid" && invoice.status !== "void" && !draft && (
              <ActionButton
                action={setInvoiceStatus.bind(null, id, "void")}
                confirm="Cancel this invoice? It stays in your records as void, and its hours become unbilled again."
                className="btn-danger"
              >
                Cancel invoice (void)
              </ActionButton>
            )}
            {draft && (
              <ActionButton
                action={deleteDraftInvoice.bind(null, id)}
                confirm="Delete this draft invoice?"
                className="btn-danger"
              >
                Delete draft
              </ActionButton>
            )}
          </section>

          <section className="card flex flex-col gap-3" aria-labelledby="drive-h">
            <h2 id="drive-h" className="text-xl font-extrabold">
              Google Drive
            </h2>
            {drive.connected ? (
              <>
                <p className="text-sm text-grey">Saved in RMR Dev Works › Invoices. Saving again updates the same file.</p>
                <ResultButton action={saveInvoiceToDrive.bind(null, id)}>
                  {invoice.driveFileId ? "Update in Drive" : "Save to Drive"}
                </ResultButton>
                {invoice.driveFileId && (
                  <a href={driveLink(invoice.driveFileId)} target="_blank" rel="noreferrer" className="link text-sm">
                    Open in Drive
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-grey">Sign in with Google to save invoices to Drive.</p>
            )}
          </section>

          <details className="card">
            <summary className="cursor-pointer font-bold">Dates and note</summary>
            <form action={updateInvoiceDetails} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="id" value={id} />
              <div className="grid grid-cols-2 gap-2">
                <label className="field">
                  Issued
                  <input type="date" name="issueDate" defaultValue={invoice.issueDate} className="input" />
                </label>
                <label className="field">
                  Due
                  <input type="date" name="dueDate" defaultValue={invoice.dueDate} className="input" />
                </label>
              </div>
              <label className="field">
                Note
                <textarea name="notes" rows={2} defaultValue={invoice.notes} className="input py-2" />
              </label>
              <SubmitButton className="btn-secondary">Save</SubmitButton>
            </form>
          </details>
        </div>
      </div>
    </>
  );
}
