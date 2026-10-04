import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setClientArchived } from "@/app/actions";
import { ActionButton } from "@/components/buttons";
import { Icon } from "@/components/icons";
import { PageHeader, StatusBadge } from "@/components/ui";
import { getClient, listInvoices, listTimeEntries } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { formatGBP, formatHours } from "@/lib/money";

export const metadata: Metadata = { title: "Client" };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const client = await getClient(id);
  if (!client) notFound();
  const [invoices, unbilled] = await Promise.all([listInvoices({ clientId: id }), listTimeEntries({ clientId: id, unbilled: true })]);
  const unbilledMinutes = unbilled.reduce((a, e) => a + e.entry.minutes, 0);

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={client.company || undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/invoices/new?clientId=${id}`} className="btn-primary">
              <Icon name="invoice" size={18} /> New invoice
            </Link>
            <Link href={`/contracts/new?clientId=${id}`} className="btn-secondary">
              <Icon name="pen" size={18} /> New contract
            </Link>
            <Link href={`/clients/${id}/edit`} className="btn-secondary">
              Edit
            </Link>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <section className="card text-sm" aria-label="Contact details">
          <dl className="flex flex-col gap-2">
            {[
              ["Email", client.email],
              ["Phone", client.phone],
              ["Address", client.address],
              ["Notes", client.notes],
            ].map(([k, v]) =>
              v ? (
                <div key={k}>
                  <dt className="label">{k}</dt>
                  <dd className="whitespace-pre-line">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>
          <p className="mt-3 text-grey">
            Unbilled time: <b className="text-navy">{formatHours(unbilledMinutes)}</b>
          </p>
          <div className="mt-4">
            <ActionButton action={setClientArchived.bind(null, id, !client.archived)} className="btn-secondary">
              {client.archived ? "Restore client" : "Archive client"}
            </ActionButton>
          </div>
        </section>

        <section className="card" aria-labelledby="inv-h">
          <h2 id="inv-h" className="mb-2 text-xl font-extrabold">
            Invoices
          </h2>
          {invoices.length === 0 ? (
            <p className="text-grey">No invoices yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {invoices.map((i) => (
                <li key={i.id}>
                  <Link href={`/invoices/${i.id}`} className="flex items-center justify-between py-2.5">
                    <span>
                      <span className="font-bold">{i.number}</span>
                      <span className="ml-2 text-sm text-grey">{formatDate(i.issueDate)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-bold">{formatGBP(i.total)}</span>
                      <StatusBadge status={i.status} overdue={i.overdue} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
