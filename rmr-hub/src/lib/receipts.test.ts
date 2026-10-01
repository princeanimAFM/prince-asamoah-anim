import { describe, expect, it } from "vitest";
import { receiptFileName, sniffReceipt } from "./receipts";

const bytes = (head: number[] | string) =>
  new Uint8Array([...(typeof head === "string" ? Buffer.from(head) : head), ...new Array(16).fill(0)]);

describe("receipts", () => {
  it("recognises photos and PDFs by their contents", () => {
    expect(sniffReceipt(bytes([0xff, 0xd8, 0xff, 0xe0]))?.ext).toBe("jpg");
    expect(sniffReceipt(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.ext).toBe("png");
    expect(sniffReceipt(bytes("%PDF-1.7"))?.mime).toBe("application/pdf");
    expect(sniffReceipt(bytes("RIFF\0\0\0\0WEBPVP8 "))?.ext).toBe("webp");
    expect(sniffReceipt(bytes("\0\0\0\x18ftypheic"))?.ext).toBe("heic");
  });

  it("rejects anything else", () => {
    expect(sniffReceipt(bytes("<html><script>"))).toBeNull();
    expect(sniffReceipt(bytes("MZ\x90\0"))).toBeNull();
    expect(sniffReceipt(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });

  it("makes a safe file name", () => {
    expect(receiptFileName("2026-10-01", 'Claude: "Pro" / month', "jpg")).toBe("2026-10-01 Claude Pro month.jpg");
    expect(receiptFileName("2026-10-01", "  ", "pdf")).toBe("2026-10-01 Receipt.pdf");
  });
});
