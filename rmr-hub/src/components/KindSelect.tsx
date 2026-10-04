"use client";

import { useTransition } from "react";
import { setTransactionKind } from "@/app/actions";
import { KINDS } from "@/lib/kinds";

export function KindSelect({ id, kind }: { id: number; kind: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Type"
      defaultValue={kind}
      disabled={pending}
      className="input min-h-9 w-auto py-1 text-sm"
      onChange={(e) => {
        const value = e.target.value;
        start(async () => {
          await setTransactionKind(id, value);
        });
      }}
    >
      {Object.entries(KINDS).map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}
