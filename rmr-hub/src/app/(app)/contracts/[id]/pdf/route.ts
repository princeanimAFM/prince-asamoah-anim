import { auth, skipAuth } from "@/auth";
import { getSettings } from "@/lib/data";
import { renderContractPdf } from "@/lib/contract-pdf";
import { contractFileName, getContract } from "@/lib/contracts";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!skipAuth && !(await auth())?.user) return new Response("Unauthorised", { status: 401 });
  const row = await getContract(Number((await params).id));
  if (!row) return new Response("Not found", { status: 404 });
  const pdf = await renderContractPdf({ settings: await getSettings(), ...row });
  const name = contractFileName(row.contract.title, row.client.company || row.client.name);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contract-${row.contract.id}.pdf"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
