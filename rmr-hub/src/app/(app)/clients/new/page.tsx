import type { Metadata } from "next";
import { ClientForm } from "@/components/ClientForm";
import { PageHeader } from "@/components/ui";
import { companiesHouseConfigured } from "@/lib/companies-house";

export const metadata: Metadata = { title: "New client" };

export default function NewClient() {
  return (
    <>
      <PageHeader title="New client" />
      <ClientForm lookup={companiesHouseConfigured()} />
    </>
  );
}
