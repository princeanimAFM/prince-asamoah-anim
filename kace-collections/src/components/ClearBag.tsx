"use client";
import { useEffect } from "react";
import { useShop } from "./ShopProvider";

// Empties the bag once the order has been paid.
export function ClearBag() {
  const { dispatch, ready } = useShop();
  useEffect(() => {
    if (ready) dispatch({ type: "clear" });
  }, [ready, dispatch]);
  return null;
}
