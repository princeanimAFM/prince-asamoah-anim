"use client";

import { useState, useTransition } from "react";
import { type CompanySearchResult, findCompanies, saveClient } from "@/app/actions";
import { SubmitButton } from "@/components/buttons";
import type { Client } from "@/db/schema";
import type { CompanyMatch } from "@/lib/companies-house-map";

export function ClientForm({ client, lookup = false }: { client?: Client; lookup?: boolean }) {
  const [company, setCompany] = useState(client?.company ?? "");
  const [address, setAddress] = useState(client?.address ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  function fillFromCompany(c: CompanyMatch) {
    setCompany(c.name);
    if (c.address) setAddress(c.address);
    const line = `Company number: ${c.number}`;
    setNotes((n) => (n.includes(c.number) ? n : n ? `${n}\n${line}` : line));
  }

  return (
    <form action={saveClient} className="card flex max-w-2xl flex-col gap-3">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}
      {lookup ? <CompanyLookup onPick={fillFromCompany} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="field">
          Contact name *
          <input name="name" required defaultValue={client?.name} className="input" autoComplete="off" />
        </label>
        <label className="field">
          Business name
          <input name="company" value={company} onChange={(e) => setCompany(e.target.value)} className="input" autoComplete="off" />
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
        <textarea name="address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="input py-2" />
      </label>
      <label className="field">
        Notes
        <textarea name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input py-2" />
      </label>
      <div>
        <SubmitButton>{client ? "Save changes" : "Add client"}</SubmitButton>
      </div>
    </form>
  );
}

/**
 * Search the Companies House register and fill in the business details. It sits inside the
 * client form, so its box has no name (it isn't saved) and Enter searches instead of saving.
 */
function CompanyLookup({ onPick }: { onPick: (c: CompanyMatch) => void }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CompanySearchResult | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function search() {
    if (query.trim().length < 2) return;
    setPicked(null);
    startTransition(async () => setResult(await findCompanies(query)));
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
      <label className="field">
        Look up a UK company (Companies House)
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Company name or number"
            maxLength={100}
            className="input flex-1"
            autoComplete="off"
          />
          <button type="button" className="btn-secondary" onClick={search} disabled={pending}>
            {pending ? "Searching…" : "Search"}
          </button>
        </div>
      </label>
      {result && !result.ok ? (
        <p role="status" className="text-sm font-semibold text-bad">
          {result.message}
        </p>
      ) : null}
      {result?.ok && result.companies.length === 0 ? (
        <p role="status" className="text-sm text-grey">
          No companies found. Sole traders and partnerships aren&apos;t on the register; fill in their details below.
        </p>
      ) : null}
      {result?.ok && result.companies.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {result.companies.map((c) => (
            <li key={c.number}>
              <button
                type="button"
                onClick={() => {
                  onPick(c);
                  setPicked(c.number);
                }}
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 ${picked === c.number ? "bg-black/5" : ""}`}
              >
                <span className="font-semibold">{c.name}</span>{" "}
                <span className="text-grey">
                  {c.number}
                  {c.status && c.status !== "active" ? ` · ${c.status.replace(/-/g, " ")}` : ""}
                </span>
                {c.address ? <span className="block text-xs text-grey">{c.address.split("\n").join(", ")}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {picked ? <p className="text-xs text-grey">Filled in below. Check the details, then add the contact&apos;s name.</p> : null}
    </div>
  );
}
