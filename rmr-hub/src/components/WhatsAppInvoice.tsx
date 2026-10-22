"use client";
// Sends the invoice PDF on WhatsApp straight from the phone: the share sheet opens with the PDF
// attached, so nothing is put online. Where a browser can't share files, it falls back to
// opening WhatsApp with the message and the PDF to attach by hand.
import { useState, useTransition } from "react";

type Props = {
  invoiceId: number;
  fileName: string;
  message: string;
  /** Client's number in international form, or "" if none is saved. */
  phone: string;
  /** Marks the invoice as sent; only passed while it's a draft. */
  markSent?: () => Promise<unknown>;
};

export function WhatsAppInvoice({ invoiceId, fileName, message, phone, markSent }: Props) {
  const [state, setState] = useState<"idle" | "busy" | "shared" | "manual">("idle");
  const [note, setNote] = useState("");
  const [marking, startMarking] = useTransition();
  const [marked, setMarked] = useState(false);
  const chat = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  async function share() {
    setState("busy");
    setNote("");
    try {
      // WhatsApp sometimes drops the text when a file is attached, so it's on the clipboard too.
      await navigator.clipboard?.writeText(message).catch(() => {});
      const res = await fetch(`/invoices/${invoiceId}/pdf`, { credentials: "same-origin" });
      if (!res.ok) throw new Error(`PDF ${res.status}`);
      const file = new File([await res.blob()], fileName, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: message });
        setState("shared");
        return;
      }
      setState("manual");
    } catch (error) {
      // Closing the share sheet without choosing an app isn't an error.
      if (error instanceof DOMException && error.name === "AbortError") {
        setState("idle");
        return;
      }
      setNote("Couldn't open sharing on this device.");
      setState("manual");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={share} disabled={state === "busy"} className="btn-secondary">
        {state === "busy" ? "Preparing PDF…" : "Send on WhatsApp"}
      </button>

      {state === "shared" && (
        <div className="flex flex-col gap-2 rounded-xl bg-ground p-3 text-sm">
          <p>The message is also copied, in case WhatsApp didn&apos;t add it: paste it under the PDF.</p>
          {markSent && !marked && (
            <button
              type="button"
              className="btn-primary"
              disabled={marking}
              onClick={() => startMarking(async () => { await markSent(); setMarked(true); })}
            >
              {marking ? "Saving…" : "Sent it? Mark as sent"}
            </button>
          )}
          {marked && <p className="font-bold text-good">Marked as sent.</p>}
        </div>
      )}

      {state === "manual" && (
        <div className="flex flex-col gap-2 rounded-xl bg-ground p-3 text-sm">
          <p>
            {note ? `${note} ` : "This browser can't attach the PDF for you. "}
            Download the PDF, then attach it in WhatsApp. The message is copied for you.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={`/invoices/${invoiceId}/pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
              Download PDF
            </a>
            {phone ? (
              <a href={chat} target="_blank" rel="noreferrer" className="btn-secondary">
                Open chat
              </a>
            ) : (
              <span className="self-center text-grey">Add a phone number to the client to open the chat directly.</span>
            )}
          </div>
          {markSent && !marked && (
            <button
              type="button"
              className="btn-primary"
              disabled={marking}
              onClick={() => startMarking(async () => { await markSent(); setMarked(true); })}
            >
              {marking ? "Saving…" : "Sent it? Mark as sent"}
            </button>
          )}
          {marked && <p className="font-bold text-good">Marked as sent.</p>}
        </div>
      )}
    </div>
  );
}
