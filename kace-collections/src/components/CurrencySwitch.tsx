"use client";
import { useShop } from "./ShopProvider";

export function CurrencySwitch() {
  const { currency, setCurrency, ghsPerGbp } = useShop();
  if (!ghsPerGbp) return null;
  return (
    <label className="flex items-center gap-1 text-sm">
      <span className="sr-only">Show prices in</span>
      <select
        id="currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value === "GHS" ? "GHS" : "GBP")}
        className="cursor-pointer rounded border border-line bg-paper px-2 py-1 font-semibold"
      >
        <option value="GBP">£ GBP</option>
        <option value="GHS">₵ GHS</option>
      </select>
    </label>
  );
}
