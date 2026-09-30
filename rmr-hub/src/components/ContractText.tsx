import { parseContract } from "@/lib/contract-template";

export function ContractText({ body }: { body: string }) {
  const blocks = parseContract(body);
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: number) => {
    if (list.length) {
      out.push(
        <ul key={`l${key}`} className="mb-3 list-disc pl-5">
          {list.map((t, i) => (
            <li key={i} className="mb-1">
              {t}
            </li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  blocks.forEach((b, i) => {
    if (b.kind === "bullet") {
      list.push(b.text);
      return;
    }
    flush(i);
    out.push(
      b.kind === "heading" ? (
        <h3 key={i} className="mt-5 mb-2 text-lg font-extrabold text-blue">
          {b.text}
        </h3>
      ) : (
        <p key={i} className="mb-3 leading-relaxed">
          {b.text}
        </p>
      ),
    );
  });
  flush(blocks.length);
  return <div className="text-[15px]">{out}</div>;
}
