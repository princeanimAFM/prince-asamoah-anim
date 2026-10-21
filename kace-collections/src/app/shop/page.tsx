import type { Metadata } from "next";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Shop all" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string | string[]; sort?: string | string[]; availability?: string | string[] }> }) {
  return (
    <Listing
      title="Shop all"
      intro="Pieces in stock and ready to send, and pieces made to order for you by our designers in Ghana."
      basePath="/shop"
      filter={{}}
      searchParams={await searchParams}
    />
  );
}
