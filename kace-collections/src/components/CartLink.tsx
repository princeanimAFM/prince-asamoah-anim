"use client";
import Link from "next/link";
import { useShop } from "./ShopProvider";

export function CartLink() {
  const { count, ready } = useShop();
  return (
    <Link href="/cart" className="relative flex items-center gap-2 font-semibold" aria-label={`Bag, ${ready ? count : 0} items`}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 8h14l-1.2 12H6.2L5 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span className="hidden sm:inline">Bag</span>
      {ready && count > 0 && (
        <span className="absolute -top-2 left-3 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
