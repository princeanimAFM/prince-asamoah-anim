import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Empty, PageHeader } from "@/components/ui";
import { listClients, listInvoices } from "@/lib/data";
import { formatGBP } from "@/lib/money";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage() {
  const [clients, invoices] = await Promise.all([listClients(true), listInvoices()]);
  const active = clients.filter((c) => !c.archived);
  const archived = clients.filter((c) => c.archived);
  const billed = (id: number) =>
    invoices.filter((i) => i.clientId === id && i.status !== "void").reduce((a, i) => a + i.total, 0);

  return (
    <>
      <PageHeader
        title="Clients"
        action={
          <Link href="/clients/new" className="btn-primary">
            <Icon name="plus" size={18} /> New client
          </Link>
        }
      />
      {active.length === 0 ? (
        <Empty href="/clients/new" cta="Add your first client">
          Add the people and businesses you work for. Their details fill in your invoices automatically.
        </Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {active.map((c) => (
            <li key={c.id}>
              <Link href={`/clients/${c.id}`} className="card flex items-center justify-between gap-3 hover:border-light">
                <span className="min-w-0">
                  <span className="block truncate font-bold">{c.name}</span>
                  <span className="block truncate text-sm text-grey">{c.company || c.email || "—"}</span>
                </span>
                <span className="shrink-0 text-right text-sm">
                  <span className="block font-bold">{formatGBP(billed(c.id))}</span>
                  <span className="text-grey">billed</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {archived.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-bold text-grey">Archived ({archived.length})</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {archived.map((c) => (
              <li key={c.id}>
                <Link href={`/clients/${c.id}`} className="link">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
