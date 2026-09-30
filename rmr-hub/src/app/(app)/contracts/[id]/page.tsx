import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteDraftContract,
  saveContractToDrive,
  sendContract,
  updateContractDraft,
  voidContract,
  withdrawContract,
} from "@/app/contract-actions";
import { ContractText } from "@/components/ContractText";
import { CopyButton } from "@/components/CopyButton";
import { ActionButton, ResultButton, SubmitButton } from "@/components/buttons";
import { Icon } from "@/components/icons";
import { Notice, PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { getContract, siteUrl } from "@/lib/contracts";
import { driveLink, driveStatus } from "@/lib/google";

export const metadata: Metadata = { title: "Contract" };

const when = (d: Date | null) =>
  d ? d.toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" }) : "";

export default async function ContractPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const id = Number((await params).id);
  const [row, settings, drive, sp] = await Promise.all([getContract(id), getSettings(), driveStatus(), searchParams]);
  if (!row) notFound();
  const { contract, client } = row;
  const who = client.company || client.name;
  const link = contract.token ? `${await siteUrl()}/sign/${contract.token}` : "";
  const message = `Hi ${client.name.split(" ")[0]}, here is our agreement for "${contract.title.replace(/^Software Development Agreement: /, "")}". Please read it and sign here: ${link}\n\nThanks,\n${settings.ownerName}\n${settings.businessName}`;
  const phone = client.phone.replace(/\D/g, "").replace(/^0(?=7\d{9}$)/, "44").replace(/^0(?=\d{9}$)/, "233");

  return (
    <>
      <PageHeader
        title={contract.title}
        subtitle={
          <>
            <Link href={`/clients/${client.id}`} className="link">
              {who}
            </Link>
          </>
        }
        action={
          <a href={`/contracts/${id}/pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
            <Icon name="download" size={18} /> PDF
          </a>
        }
      />
      {sp.saved && <Notice tone="good">Draft saved.</Notice>}
      {sp.error && <Notice tone="bad">The title and wording can't be empty.</Notice>}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          {contract.status === "draft" ? (
            <form action={updateContractDraft} className="card flex flex-col gap-3">
              <input type="hidden" name="id" value={id} />
              <label className="field">
                Title
                <input name="title" defaultValue={contract.title} className="input" />
              </label>
              <label className="field">
                Wording (numbered headings on their own line; &quot;- &quot; for bullet points)
                <textarea name="body" defaultValue={contract.body} rows={24} className="input py-2 font-mono text-sm leading-relaxed" />
              </label>
              <div>
                <SubmitButton className="btn-secondary">Save draft</SubmitButton>
              </div>
            </form>
          ) : null}
          <article className="card" aria-label="Contract preview">
            <p className="label mb-2">{contract.status === "draft" ? "Preview" : "Agreement as sent"}</p>
            <ContractText body={contract.body} />
          </article>
        </div>

        <aside className="flex flex-col gap-4">
          {contract.status === "draft" && (
            <section className="card flex flex-col gap-3">
              <h2 className="text-xl font-extrabold">Ready to send?</h2>
              <p className="text-sm text-grey">
                Sending locks the wording and creates a private signing link for {client.name}.
              </p>
              <ActionButton action={sendContract.bind(null, id)} className="btn-primary">
                Create signing link
              </ActionButton>
              <ActionButton action={deleteDraftContract.bind(null, id)} confirm="Delete this draft?" className="btn-danger">
                Delete draft
              </ActionButton>
            </section>
          )}

          {contract.status === "sent" && (
            <section className="card flex flex-col gap-3">
              <h2 className="text-xl font-extrabold">Waiting for signature</h2>
              <p className="text-sm text-grey">Sent {when(contract.sentAt)}. Share this private link with {client.name}:</p>
              <p className="rounded-xl bg-ground p-3 font-mono text-xs break-all">{link}</p>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={link} />
                {phone && (
                  <a
                    className="btn-secondary"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
                  >
                    WhatsApp
                  </a>
                )}
                {client.email && (
                  <a
                    className="btn-secondary"
                    href={`mailto:${client.email}?subject=${encodeURIComponent(contract.title)}&body=${encodeURIComponent(message)}`}
                  >
                    Email
                  </a>
                )}
              </div>
              <ActionButton
                action={withdrawContract.bind(null, id)}
                confirm="Withdraw to edit? The current link will stop working."
                className="btn-secondary"
              >
                Withdraw to edit
              </ActionButton>
            </section>
          )}

          {contract.status === "signed" && (
            <section className="card flex flex-col gap-3">
              <h2 className="text-xl font-extrabold text-good">Signed</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-grey">By</dt>
                <dd className="font-semibold">{contract.signerName}</dd>
                <dt className="text-grey">When</dt>
                <dd>{when(contract.signedAt)}</dd>
                <dt className="text-grey">IP</dt>
                <dd>{contract.signerIp || "not recorded"}</dd>
              </dl>
              {contract.signatureImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={contract.signatureImage} alt={`Signature of ${contract.signerName}`} className="h-16 w-auto self-start" />
              ) : null}
              {drive.connected ? (
                <>
                  <ResultButton action={saveContractToDrive.bind(null, id)}>
                    {contract.driveFileId ? "Update in Drive" : "Save to Drive"}
                  </ResultButton>
                  {contract.driveFileId && (
                    <a href={driveLink(contract.driveFileId)} target="_blank" rel="noreferrer" className="link text-sm">
                      Open in Drive
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-grey">Sign in with Google to file signed contracts in Drive automatically.</p>
              )}
            </section>
          )}

          {(contract.status === "sent" || contract.status === "signed") && (
            <ActionButton
              action={voidContract.bind(null, id)}
              confirm="Mark this contract as void? The signing link stops working. This can't be undone."
              className="btn-danger"
            >
              Void contract
            </ActionButton>
          )}
          {contract.status === "void" && <Notice tone="warn">This contract is void.</Notice>}
        </aside>
      </div>
    </>
  );
}
