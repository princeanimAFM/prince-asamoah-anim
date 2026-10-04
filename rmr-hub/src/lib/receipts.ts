/** Receipt files: identified by their first bytes, never by the name or type the browser sends. */

export const MAX_RECEIPT_BYTES = 8_000_000;

const TYPES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", test: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v) },
  { mime: "image/webp", ext: "webp", test: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
  { mime: "application/pdf", ext: "pdf", test: (b) => ascii(b, 0, 5) === "%PDF-" },
  {
    mime: "image/heic",
    ext: "heic",
    test: (b) => ascii(b, 4, 8) === "ftyp" && ["heic", "heix", "mif1", "msf1"].includes(ascii(b, 8, 12)),
  },
];

function ascii(b: Uint8Array, from: number, to: number) {
  return String.fromCharCode(...b.subarray(from, to));
}

export function sniffReceipt(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes.length < 12) return null;
  const t = TYPES.find((x) => x.test(bytes));
  return t ? { mime: t.mime, ext: t.ext } : null;
}

/** e.g. "2026-10-01 Claude subscription.jpg" (no characters Drive or Windows dislike). */
export function receiptFileName(date: string, description: string, ext: string) {
  const what = description.replace(/[\\/:*?"<>|\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "Receipt";
  return `${date} ${what}.${ext}`;
}
