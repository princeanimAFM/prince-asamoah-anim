import { auth, skipAuth } from "@/auth";
import { getInvoice, getSettings } from "@/lib/data";
import { invoiceFileName, renderInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!skipAuth && !(await auth())?.user) return new Response("Unauthorised", { status: 401 });
  const data = await getInvoice(Number((await params).id));
  if (!data) return new Response("Not found", { status: 404 });
  const pdf = await renderInvoicePdf({ settings: await getSettings(), ...data });
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${data.invoice.number}.pdf"; filename*=UTF-8''${encodeURIComponent(
        invoiceFileName(data.invoice, data.client),
      )}`,
      "Cache-Control": "private, no-store",
    },
  });
}
