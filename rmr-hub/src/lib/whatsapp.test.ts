import { describe, expect, it } from "vitest";
import { invoiceWhatsApp, whatsAppNumber } from "./whatsapp";

describe("whatsAppNumber", () => {
  it("turns UK and Ghanaian numbers into international form", () => {
    expect(whatsAppNumber("07700 900123")).toBe("447700900123");
    expect(whatsAppNumber("+44 7700 900123")).toBe("447700900123");
    expect(whatsAppNumber("0044 7700 900123")).toBe("447700900123");
    expect(whatsAppNumber("024 412 3456")).toBe("233244123456");
    expect(whatsAppNumber("+233 24 412 3456")).toBe("233244123456");
  });
  it("returns nothing for missing or unusable numbers", () => {
    expect(whatsAppNumber("")).toBe("");
    expect(whatsAppNumber("call me")).toBe("");
    expect(whatsAppNumber("123")).toBe("");
  });
});

describe("invoiceWhatsApp", () => {
  it("gives the amount, due date and payment reference", () => {
    const text = invoiceWhatsApp({ number: "RMR-0003", amountDue: 16666, dueDate: "2026-11-05", clientName: "Adu Mensah", ownerName: "Prince" });
    expect(text).toContain("Hi Adu,");
    expect(text).toContain("invoice RMR-0003 for £166.66");
    expect(text).toContain("5 Nov 2026");
    expect(text).toContain("Please use RMR-0003 as the payment reference");
  });
});
