import { collectBackup } from "@/lib/backup";
import { signedIn } from "@/lib/monzo-oauth";

export const dynamic = "force-dynamic";

/** Download a full backup file (the same as the daily one in Drive). */
export async function GET() {
  if (!(await signedIn())) return new Response("Unauthorised", { status: 401 });
  const backup = await collectBackup();
  return new Response(JSON.stringify(backup), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="RMR Hub backup ${backup.createdAt.slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
