import { saveClient } from "@/app/actions";
import { SubmitButton } from "@/components/buttons";
import type { Client } from "@/db/schema";

export function ClientForm({ client }: { client?: Client }) {
  return (
    <form action={saveClient} className="card flex max-w-2xl flex-col gap-3">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field">
          Contact name *
          <input name="name" required defaultValue={client?.name} className="input" autoComplete="off" />
        </label>
        <label className="field">
          Business name
          <input name="company" defaultValue={client?.company} className="input" autoComplete="off" />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" defaultValue={client?.email} className="input" autoComplete="off" />
        </label>
        <label className="field">
          Phone
          <input name="phone" type="tel" defaultValue={client?.phone} className="input" autoComplete="off" />
        </label>
      </div>
      <label className="field">
        Address (for invoices)
        <textarea name="address" rows={3} defaultValue={client?.address} className="input py-2" />
      </label>
      <label className="field">
        Notes
        <textarea name="notes" rows={3} defaultValue={client?.notes} className="input py-2" />
      </label>
      <div>
        <SubmitButton>{client ? "Save changes" : "Add client"}</SubmitButton>
      </div>
    </form>
  );
}
