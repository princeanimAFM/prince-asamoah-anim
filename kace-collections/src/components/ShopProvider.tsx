"use client";
// Cart and display currency, kept in this browser only (no cookies, nothing sent anywhere).
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { cartReducer, priceCart, type CartAction, type CartLine } from "@/lib/cart";
import { formatPrice, type Currency } from "@/lib/currency";

const CART_KEY = "kace-cart-v1";
const CURRENCY_KEY = "kace-currency";

type Shop = {
  lines: CartLine[];
  dispatch: (action: CartAction) => void;
  count: number;
  ready: boolean;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  ghsPerGbp: number | null;
  format: (pence: number) => string;
};

const ShopContext = createContext<Shop | null>(null);

function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* storage blocked: keep in memory */ }
}

export function ShopProvider({ ghsPerGbp, children }: { ghsPerGbp: number | null; children: React.ReactNode }) {
  const [lines, dispatch] = useReducer((state: CartLine[], action: CartAction) => cartReducer(state, action), []);
  const [currency, setCurrencyState] = useState<Currency>("GBP");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = read(CART_KEY);
      if (saved) dispatch({ type: "replace", lines: JSON.parse(saved) });
    } catch { /* ignore a damaged saved cart */ }
    if (ghsPerGbp && read(CURRENCY_KEY) === "GHS") setCurrencyState("GHS");
    setReady(true);
  }, [ghsPerGbp]);

  useEffect(() => {
    if (ready) write(CART_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    write(CURRENCY_KEY, c);
  }, []);

  const value = useMemo<Shop>(() => {
    const shown: Currency = ghsPerGbp ? currency : "GBP";
    return {
      lines,
      dispatch,
      count: priceCart(lines).count,
      ready,
      currency: shown,
      setCurrency,
      ghsPerGbp,
      format: (pence) => formatPrice(pence, shown, ghsPerGbp),
    };
  }, [lines, ready, currency, setCurrency, ghsPerGbp]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): Shop {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error("useShop must be used inside ShopProvider");
  return shop;
}
