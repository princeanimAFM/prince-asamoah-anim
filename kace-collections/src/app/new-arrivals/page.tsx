import type { Metadata } from "next";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "New in" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  return (
    <Listing
      title="New in"
      intro="Pieces added in the last 30 days."
      basePath="/new-arrivals"
      filter={{ newSince: new Date() }}
      searchParams={await searchParams}
    />
  );
}
