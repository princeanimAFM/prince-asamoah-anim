import "server-only";
import path from "node:path";
import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Client, Invoice, InvoiceItem, Settings, Transaction } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { formatGBP } from "@/lib/money";
import { lineAmount } from "@/lib/data";

const NAVY = "#1E2A44";
const BLUE = "#2B6CE0";
const GREY = "#4A5877";
const LINE = "#D9E2F1";
const PALE = "#EAF1FD";

const s = StyleSheet.create({
  page: { padding: 44, fontFamily: "Helvetica", fontSize: 10, color: NAVY, lineHeight: 1.4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  logo: { width: 190 },
  title: { fontSize: 26, fontFamily: "Helvetica-Bold", color: NAVY, textAlign: "right", lineHeight: 1, marginBottom: 6 },
  meta: { textAlign: "right", color: GREY, marginTop: 4 },
  cols: { flexDirection: "row", gap: 24, marginBottom: 24 },
  col: { flex: 1 },
  label: { fontSize: 8, color: GREY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, fontFamily: "Helvetica-Bold" },
  bold: { fontFamily: "Helvetica-Bold" },
  thead: { flexDirection: "row", borderBottomWidth: 1.5, borderBottomColor: NAVY, paddingBottom: 5, marginBottom: 2 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE, paddingVertical: 6 },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 50, textAlign: "right" },
  cRate: { width: 70, textAlign: "right" },
  cAmt: { width: 80, textAlign: "right" },
  totals: { marginTop: 10, marginLeft: "auto", width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grand: { flexDirection: "row", justifyContent: "space-between", backgroundColor: PALE, padding: 8, marginTop: 4, borderRadius: 4 },
  grandText: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  pay: { marginTop: 28, padding: 14, borderRadius: 6, backgroundColor: "#F7F9FD" },
  notes: { marginTop: 16, color: GREY },
  footer: { position: "absolute", bottom: 28, left: 44, right: 44, fontSize: 8, color: GREY, textAlign: "center", borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8 },
  paid: { position: "absolute", top: 520, left: 70, fontSize: 40, color: "#1E9E6A", opacity: 0.25, fontFamily: "Helvetica-Bold", transform: "rotate(-14deg)" },
});

const qty = (q: number) => (q % 100 === 0 ? String(q / 100) : (q / 100).toFixed(2));

export function InvoiceDocument(props: {
  settings: Settings;
  invoice: Invoice;
  client: Client;
  items: InvoiceItem[];
  payments: Transaction[];
  total: number;
}) {
  const { settings: st, invoice, client, items, payments, total } = props;
  const received = payments.filter((p) => p.kind === "income").reduce((a, p) => a + p.amount, 0);
  const due = Math.max(0, total - received);
  const logo = path.join(process.cwd(), "public", "logo-invoice.png");

  return (
    <Document title={`Invoice ${invoice.number}`} author={st.businessName}>
      <Page size="A4" style={s.page}>
        {invoice.status === "paid" && <Text style={s.paid}>PAID</Text>}
        <View style={s.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logo} style={s.logo} />
          <View>
            <Text style={s.title}>INVOICE</Text>
            <Text style={s.meta}>{invoice.number}</Text>
            <Text style={s.meta}>Issued {formatDate(invoice.issueDate)}</Text>
            <Text style={s.meta}>Due {formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={s.cols}>
          <View style={s.col}>
            <Text style={s.label}>From</Text>
            <Text style={s.bold}>{st.ownerName}</Text>
            <Text>trading as {st.businessName}</Text>
            {st.address ? <Text>{st.address}</Text> : null}
            <Text>{st.email}</Text>
            <Text>{st.phone}</Text>
          </View>
          <View style={s.col}>
            <Text style={s.label}>Bill to</Text>
            <Text style={s.bold}>{client.company || client.name}</Text>
            {client.company ? <Text>{client.name}</Text> : null}
            {client.address ? <Text>{client.address}</Text> : null}
            {client.email ? <Text>{client.email}</Text> : null}
          </View>
        </View>

        <View style={s.thead}>
          <Text style={[s.cDesc, s.label]}>Description</Text>
          <Text style={[s.cQty, s.label]}>Qty</Text>
          <Text style={[s.cRate, s.label]}>Rate</Text>
          <Text style={[s.cAmt, s.label]}>Amount</Text>
        </View>
        {items.map((it) => (
          <View key={it.id} style={s.row} wrap={false}>
            <Text style={s.cDesc}>{it.description}</Text>
            <Text style={s.cQty}>{qty(it.quantity)}</Text>
            <Text style={s.cRate}>{formatGBP(it.unitPrice)}</Text>
            <Text style={s.cAmt}>{formatGBP(lineAmount(it))}</Text>
          </View>
        ))}

        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text>Total</Text>
            <Text>{formatGBP(total)}</Text>
          </View>
          {received > 0 && (
            <View style={s.totalRow}>
              <Text>Paid</Text>
              <Text>-{formatGBP(received)}</Text>
            </View>
          )}
          <View style={s.grand}>
            <Text style={s.grandText}>Amount due</Text>
            <Text style={s.grandText}>{formatGBP(due)}</Text>
          </View>
          <Text style={{ fontSize: 8, color: GREY, marginTop: 4, textAlign: "right" }}>Not VAT registered</Text>
        </View>

        <View style={s.pay}>
          <Text style={s.label}>How to pay</Text>
          <Text>
            Bank transfer to <Text style={s.bold}>{st.accountName || st.ownerName}</Text>
            {st.bankName ? ` (${st.bankName})` : ""}
          </Text>
          <Text>
            Sort code <Text style={s.bold}>{st.sortCode || "—"}</Text>   Account <Text style={s.bold}>{st.accountNumber || "—"}</Text>
          </Text>
          <Text>
            Please use <Text style={s.bold}>{invoice.number}</Text> as the payment reference. Payment is due within{" "}
            {st.paymentTermsDays} days.
          </Text>
        </View>

        {invoice.notes ? <Text style={s.notes}>{invoice.notes}</Text> : null}

        <Text style={s.footer} fixed>
          {st.ownerName} trading as {st.businessName} · {st.website} · Software development · Where ideas take shape
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(props: Parameters<typeof InvoiceDocument>[0]): Promise<Uint8Array> {
  const buf = await renderToBuffer(<InvoiceDocument {...props} />);
  return new Uint8Array(buf);
}

export function invoiceFileName(invoice: Invoice, client: Client) {
  const who = (client.company || client.name).replace(/[\\/:*?"<>|]/g, "").trim();
  return `${invoice.number} - ${who}.pdf`;
}
