"use client";
import { useShop } from "./ShopProvider";

export function Price({ pence, compareAt, className = "" }: { pence: number; compareAt?: number; className?: string }) {
  const { format, currency } = useShop();
  const onSale = compareAt !== undefined && compareAt > pence;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 tabular-nums ${className}`}>
      <span className={onSale ? "text-clay" : undefined}>
        {currency === "GHS" && <span className="sr-only">about </span>}
        {format(pence)}
      </span>
      {onSale && (
        <s className="text-muted text-[0.9em] font-normal">
          <span className="sr-only">was </span>
          {format(compareAt)}
        </s>
      )}
    </span>
  );
}
