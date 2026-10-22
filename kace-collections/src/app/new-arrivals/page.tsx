import type { Metadata } from "next";
import { NewArrivals } from "@/components/NewArrivals";

export const metadata: Metadata = { title: "New in" };

export default function Page() {
  return <NewArrivals />;
}
