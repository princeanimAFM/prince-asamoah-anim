import { getSettings } from "@/lib/data";
import { renderContractPdf } from "@/lib/contract-pdf";
import { contractFileName, getContractByToken } from "@/lib/contracts";

/** The client's copy: available to whoever holds the signing link, once the contract is sent. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const row = await getContractByToken((await params).token);
  if (!row) return new Response("Not found", { status: 404 });
  const pdf = await renderContractPdf({ settings: await getSettings(), ...row });
  const name = contractFileName(row.contract.title, row.client.company || row.client.name);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="agreement.pdf"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    },
  });
}
