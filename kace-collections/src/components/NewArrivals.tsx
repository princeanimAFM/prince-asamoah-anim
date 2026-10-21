"use client";
import { Suspense, useEffect, useState } from "react";
import { Listing } from "./Listing";

// "New" depends on today's date, so it's worked out in the browser.
export function NewArrivals() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  if (!today) return null;
  return (
    <Suspense>
      <Listing title="New in" intro="Pieces added in the last 30 days." basePath="/new-arrivals" filter={{ newSince: today }} />
    </Suspense>
  );
}
