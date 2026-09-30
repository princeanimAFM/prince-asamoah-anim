import "server-only";
import path from "node:path";
import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Client, Contract, Settings } from "@/db/schema";
import { parseContract } from "@/lib/contract-template";

const NAVY = "#1E2A44";
const BLUE = "#2B6CE0";
const GREY = "#4A5877";
const LINE = "#D9E2F1";

const s = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 60, paddingHorizontal: 50, fontFamily: "Helvetica", fontSize: 10, color: NAVY, lineHeight: 1.45 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  logo: { width: 160 },
  kicker: { fontSize: 8, color: GREY, letterSpacing: 1, textTransform: "uppercase", fontFamily: "Helvetica-Bold", textAlign: "right" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 12, lineHeight: 1.2 },
  h: { fontSize: 11.5, fontFamily: "Helvetica-Bold", color: BLUE, marginTop: 10, marginBottom: 4 },
  p: { marginBottom: 6, textAlign: "justify" },
  li: { flexDirection: "row", marginBottom: 3, paddingLeft: 8 },
  dot: { width: 10 },
  sigs: { flexDirection: "row", gap: 24, marginTop: 24 },
  sig: { flex: 1, borderTopWidth: 1, borderTopColor: NAVY, paddingTop: 6 },
  label: { fontSize: 8, color: GREY, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  sigImg: { height: 48, objectFit: "contain", marginBottom: 4, alignSelf: "flex-start" },
  typed: { fontSize: 14, fontFamily: "Helvetica-Oblique", marginBottom: 4 },
  audit: { marginTop: 22, padding: 10, borderWidth: 1, borderColor: LINE, borderRadius: 4, fontSize: 8, color: GREY },
  footer: { position: "absolute", bottom: 26, left: 50, right: 50, fontSize: 8, color: GREY, textAlign: "center", borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6 },
});

const when = (d: Date | null) =>
  d ? d.toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "long", timeStyle: "short" }) + " (UK time)" : "";

export function ContractDocument({ settings, contract, client }: { settings: Settings; contract: Contract; client: Client }) {
  const blocks = parseContract(contract.body);
  const signed = contract.status === "signed";
  return (
    <Document title={contract.title} author={settings.businessName}>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={path.join(process.cwd(), "public", "logo-invoice.png")} style={s.logo} />
          <Text style={s.kicker}>{signed ? "Signed agreement" : "Agreement"}</Text>
        </View>
        <Text style={s.title}>{contract.title}</Text>
        {blocks.map((b, i) =>
          b.kind === "heading" ? (
            <Text key={i} style={s.h} minPresenceAhead={40}>
              {b.text}
            </Text>
          ) : b.kind === "bullet" ? (
            <View key={i} style={s.li} wrap={false}>
              <Text style={s.dot}>•</Text>
              <Text style={{ flex: 1 }}>{b.text}</Text>
            </View>
          ) : (
            <Text key={i} style={s.p}>
              {b.text}
            </Text>
          ),
        )}

        <View style={s.sigs} wrap={false}>
          <View style={s.sig}>
            <Text style={s.label}>For {settings.businessName}</Text>
            <Text style={s.typed}>{settings.ownerName}</Text>
            <Text>{settings.ownerName}, owner</Text>
            <Text style={{ color: GREY }}>Issued {when(contract.sentAt)}</Text>
          </View>
          <View style={s.sig}>
            <Text style={s.label}>For {client.company || client.name}</Text>
            {signed && contract.signatureImage ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={contract.signatureImage} style={s.sigImg} />
            ) : null}
            <Text style={s.typed}>{signed ? contract.signerName : " "}</Text>
            <Text>{signed ? contract.signerName : "Awaiting signature"}</Text>
            {signed ? <Text style={{ color: GREY }}>Signed {when(contract.signedAt)}</Text> : null}
          </View>
        </View>

        {signed ? (
          <View style={s.audit} wrap={false}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Electronic signature record</Text>
            <Text>
              Signed electronically by {contract.signerName} on {when(contract.signedAt)}, after confirming they agree to sign
              electronically.
            </Text>
            <Text>IP address: {contract.signerIp || "not recorded"}</Text>
            <Text>Browser: {(contract.signerAgent || "not recorded").slice(0, 160)}</Text>
            <Text>Document fingerprint (SHA-256): {contract.bodyHash}</Text>
          </View>
        ) : null}

        <Text
          style={s.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${settings.ownerName} trading as ${settings.businessName} · ${settings.website} · Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}

export async function renderContractPdf(props: Parameters<typeof ContractDocument>[0]): Promise<Uint8Array> {
  return new Uint8Array(await renderToBuffer(<ContractDocument {...props} />));
}
