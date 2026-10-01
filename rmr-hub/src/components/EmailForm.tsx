"use client";

import { useActionState, useState } from "react";
import type { FormResult } from "@/app/actions";
import { SubmitButton } from "@/components/buttons";

type Draft = { subject: string; text: string };

/**
 * Email an invoice, or a payment reminder once it has been sent. One component for both,
 * so the result message stays on screen when the invoice changes from draft to sent.
 */
export function EmailPanel({
  action,
  id,
  to,
  invoice,
  reminder,
}: {
  action: (prev: FormResult, f: FormData) => Promise<FormResult>;
  id: number;
  to: string;
  invoice: Draft;
  /** Present once the invoice has been emailed: reminders become the main action. */
  reminder: Draft | null;
}) {
  const [result, formAction] = useActionState(action, null);
  const [resend, setResend] = useState(false);
  const kind = reminder && !resend ? "reminder" : "invoice";
  const draft = kind === "reminder" ? reminder! : invoice;

  return (
    <div className="flex flex-col gap-2">
      <form key={kind} action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="kind" value={kind} />
        <label className="field">
          To
          <input name="to" type="email" required defaultValue={to} className="input" />
        </label>
        <label className="field">
          Subject
          <input name="subject" required defaultValue={draft.subject} className="input" />
        </label>
        <label className="field">
          Message
          <textarea name="text" rows={9} required defaultValue={draft.text} className="input py-2" />
        </label>
        <p className="text-xs text-grey">The invoice PDF is attached.</p>
        <SubmitButton pendingText="Sending…">{kind === "reminder" ? "Send reminder" : "Send invoice"}</SubmitButton>
      </form>
      {reminder && (
        <button type="button" className="link self-start text-sm" onClick={() => setResend(!resend)}>
          {resend ? "Send a payment reminder instead" : "Send the invoice again instead"}
        </button>
      )}
      {result && (
        <p role="status" className={`text-sm font-semibold ${result.ok ? "text-good" : "text-bad"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
