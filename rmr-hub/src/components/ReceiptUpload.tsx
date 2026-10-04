"use client";

import { useRef, useState, useTransition } from "react";
import { Icon } from "@/components/icons";

type Result = { ok: boolean; message: string; link?: string };

/** Make big phone photos smaller (longest side 2000px, JPEG) before uploading. */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Take a photo of a receipt (or pick a PDF) and file it in Drive against a transaction. */
export function ReceiptUpload({
  id,
  action,
  link,
}: {
  id: number;
  action: (f: FormData) => Promise<Result>;
  link?: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const href = result?.link ?? link;

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="link text-sm whitespace-nowrap">
            Receipt
          </a>
        )}
        <button
          type="button"
          className="btn-secondary min-h-9 px-2 text-xs whitespace-nowrap"
          disabled={pending}
          onClick={() => input.current?.click()}
          aria-label={href ? "Replace receipt" : "Add receipt"}
        >
          <Icon name="upload" size={16} />
          {pending ? "Saving…" : href ? "Replace" : "Receipt"}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          start(async () => {
            const blob = await shrink(file);
            const f = new FormData();
            f.set("id", String(id));
            f.set("receipt", blob, file.name);
            setResult(await action(f));
          });
        }}
      />
      {result && !result.ok && (
        <p role="alert" className="max-w-56 text-xs font-semibold text-bad">
          {result.message}
        </p>
      )}
    </div>
  );
}
