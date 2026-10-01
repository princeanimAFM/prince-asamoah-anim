import { describe, expect, it } from "vitest";
import { buildMime, encodeHeader, invoiceEmail, isEmail, mailbox, reminderDue, reminderEmail } from "./email";

const inv = {
  number: "RMR-0003",
  amountDue: 100000,
  dueDate: "2026-10-14",
  clientName: "Kwame Mensah",
  ownerName: "Prince Asamoah Anim",
  businessName: "RMR Dev Works",
  today: "2026-10-01",
};

describe("email building", () => {
  it("checks addresses", () => {
    expect(isEmail("kwame@mighty.co.uk")).toBe(true);
    expect(isEmail("kwame@mighty")).toBe(false);
    expect(isEmail("a@b.com\r\nBcc: x@y.com")).toBe(false);
    expect(isEmail("Kwame <k@m.com>")).toBe(false);
  });

  it("keeps headers on one line and encodes non-ASCII", () => {
    expect(encodeHeader("Invoice\r\nBcc: evil@x.com")).toBe("Invoice Bcc: evil@x.com");
    expect(encodeHeader("£1,000 due")).toMatch(/^=\?UTF-8\?B\?.+\?=$/);
    expect(mailbox('Prince "P" Anim', "p@x.com")).toBe('"Prince P Anim" <p@x.com>');
  });

  it("builds a message with a PDF attachment", () => {
    const raw = buildMime(
      {
        from: mailbox("Prince Asamoah Anim", "p@x.com"),
        to: "kwame@mighty.co.uk",
        replyTo: "prince@rmrdevworks.co.uk",
        subject: "Invoice RMR-0003",
        text: "Hello £",
        attachments: [{ filename: "RMR-0003.pdf", mimeType: "application/pdf", data: new Uint8Array([37, 80, 68, 70]) }],
      },
      "b1",
    );
    expect(raw).toContain("To: <kwame@mighty.co.uk>\r\n");
    expect(raw).toContain("Reply-To: <prince@rmrdevworks.co.uk>\r\n");
    expect(raw).toContain('Content-Type: multipart/mixed; boundary="b1"');
    expect(raw).toContain('Content-Disposition: attachment; filename="RMR-0003.pdf"');
    expect(raw).toContain(Buffer.from("Hello £").toString("base64"));
    expect(raw).toContain("JVBERg=="); // %PDF
    expect(raw.trimEnd().endsWith("--b1--")).toBe(true);
  });

  it("refuses a bad recipient", () => {
    expect(() => buildMime({ from: "<p@x.com>", to: "nope", subject: "s", text: "t" })).toThrow(/valid email/);
  });
});

describe("invoice wording", () => {
  it("writes the invoice email", () => {
    const e = invoiceEmail(inv);
    expect(e.subject).toBe("Invoice RMR-0003 from RMR Dev Works");
    expect(e.text).toContain("Hi Kwame,");
    expect(e.text).toContain("£1,000.00");
    expect(e.text).toContain("use RMR-0003 as the payment reference");
  });

  it("words reminders before and after the due date", () => {
    expect(reminderEmail(inv).subject).toContain("is due on");
    const late = reminderEmail({ ...inv, today: "2026-10-20" });
    expect(late.subject).toBe("Reminder: invoice RMR-0003 is overdue");
    expect(late.text).toContain("still unpaid");
  });
});

describe("automatic reminders", () => {
  const due = "2026-10-14";
  it("sends on day 1, 7 and 14 after the due date, then stops", () => {
    expect(reminderDue({ dueDate: due, today: "2026-10-14", sent: 0, lastSent: null })).toBe(false);
    expect(reminderDue({ dueDate: due, today: "2026-10-15", sent: 0, lastSent: null })).toBe(true);
    expect(reminderDue({ dueDate: due, today: "2026-10-20", sent: 1, lastSent: "2026-10-15" })).toBe(false);
    expect(reminderDue({ dueDate: due, today: "2026-10-21", sent: 1, lastSent: "2026-10-15" })).toBe(true);
    expect(reminderDue({ dueDate: due, today: "2026-10-28", sent: 2, lastSent: "2026-10-21" })).toBe(true);
    expect(reminderDue({ dueDate: due, today: "2026-12-01", sent: 3, lastSent: "2026-10-28" })).toBe(false);
  });
  it("never sends twice in a day", () => {
    expect(reminderDue({ dueDate: due, today: "2026-11-30", sent: 1, lastSent: "2026-11-30" })).toBe(false);
  });
});
