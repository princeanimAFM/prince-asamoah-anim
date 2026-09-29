"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Icon, type IconName } from "@/components/icons";

/** Submit button that shows progress while its form's server action runs. */
export function SubmitButton({
  children,
  className = "btn-primary",
  pendingText = "Saving…",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

/** Runs a server action on click, optionally after a confirmation. */
export function ActionButton({
  action,
  children,
  className = "btn-secondary",
  confirm,
  icon,
  label,
}: {
  action: () => Promise<unknown>;
  children?: React.ReactNode;
  className?: string;
  confirm?: string;
  icon?: IconName;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      aria-label={label}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          await action();
        });
      }}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}

/** Runs a server action that reports back a message and optional link (e.g. Drive saves). */
export function ResultButton({
  action,
  children,
  icon = "drive",
  className = "btn-secondary",
}: {
  action: () => Promise<{ ok: boolean; message: string; link?: string }>;
  children: React.ReactNode;
  icon?: IconName;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string; link?: string } | null>(null);
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => start(async () => setResult(await action()))}
      >
        <Icon name={icon} size={18} />
        {pending ? "Working…" : children}
      </button>
      {result ? (
        <p role="status" className={`text-sm font-semibold ${result.ok ? "text-good" : "text-bad"}`}>
          {result.message}{" "}
          {result.link ? (
            <a href={result.link} target="_blank" rel="noreferrer" className="link">
              Open
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
