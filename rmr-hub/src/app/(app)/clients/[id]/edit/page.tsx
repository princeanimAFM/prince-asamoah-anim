import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/ClientForm";
import { PageHeader } from "@/components/ui";
import { getClient } from "@/lib/data";

export const metadata: Metadata = { title: "Edit client" };

export default async function EditClient({ params }: { params: Promise<{ id: string }> }) {
  const client = await getClient(Number((await params).id));
  if (!client) notFound();
  return (
    <>
      <PageHeader title={`Edit ${client.name}`} />
      <ClientForm client={client} />
    </>
  );
}
