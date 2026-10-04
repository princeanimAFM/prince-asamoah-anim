import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Empty, PageHeader, StatusBadge } from "@/components/ui";
import { listInvoices } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { formatGBP } from "@/lib/money";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const invoices = await listInvoices();
  const sum = (s: string) => invoices.filter((i) => i.status === s).reduce((a, i) => a + i.total, 0);

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle={`${formatGBP(sum("sent"))} waiting · ${formatGBP(sum("paid"))} paid · ${formatGBP(sum("draft"))} in drafts`}
        action={
          <Link href="/invoices/new" className="btn-primary">
            <Icon name="plus" size={18} /> New invoice
          </Link>
        }
      />
      {invoices.length === 0 ? (
        <Empty href="/invoices/new" cta="Create an invoice">
          Create invoices from your logged hours or a fixed price. Each one gets a branded PDF you can send and save to
          Google Drive.
        </Empty>
      ) : (
        <div className="card overflow-x-auto p-0 sm:p-0">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-4">Invoice</th>
                <th>Client</th>
                <th className="hidden sm:table-cell">Due</th>
                <th className="text-right">Amount</th>
                <th className="pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-ground">
                  <td className="pl-4">
                    <Link href={`/invoices/${i.id}`} className="link">
                      {i.number}
                    </Link>
                    <div className="text-xs text-grey">{formatDate(i.issueDate)}</div>
                  </td>
                  <td>{i.clientName}</td>
                  <td className="hidden whitespace-nowrap sm:table-cell">{formatDate(i.dueDate)}</td>
                  <td className="text-right font-bold whitespace-nowrap">{formatGBP(i.total)}</td>
                  <td className="pr-4">
                    <StatusBadge status={i.status} overdue={i.overdue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
