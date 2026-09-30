import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Empty, PageHeader } from "@/components/ui";
import { listContracts } from "@/lib/contracts";

export const metadata: Metadata = { title: "Contracts" };

const BADGE: Record<string, string> = {
  draft: "bg-ground text-grey border border-line",
  sent: "bg-pale text-blue",
  signed: "bg-green-50 text-good",
  void: "bg-ground text-grey line-through",
};
const LABEL: Record<string, string> = { draft: "Draft", sent: "Waiting for signature", signed: "Signed", void: "Void" };

export default async function ContractsPage() {
  const rows = await listContracts();
  return (
    <>
      <PageHeader
        title="Contracts"
        subtitle="Create an agreement, send the signing link, and keep the signed copy."
        action={
          <Link href="/contracts/new" className="btn-primary">
            <Icon name="plus" size={18} /> New contract
          </Link>
        }
      />
      {rows.length === 0 ? (
        <Empty href="/contracts/new" cta="Create a contract">
          Contracts are made from your standard agreement, filled in with the client, price and timeline. Clients sign on
          their phone from a private link.
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map(({ contract, clientName, company }) => (
            <li key={contract.id}>
              <Link href={`/contracts/${contract.id}`} className="card flex items-center justify-between gap-3 hover:border-light">
                <span className="min-w-0">
                  <span className="block truncate font-bold">{contract.title}</span>
                  <span className="text-sm text-grey">{company || clientName}</span>
                </span>
                <span className={`badge shrink-0 ${BADGE[contract.status]}`}>{LABEL[contract.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
