import { timingSafeEqual } from "node:crypto";
import { runBackup } from "@/lib/backup";
import { googleEmail } from "@/lib/google";
import { runAutoReminders } from "@/lib/invoice-mail";
import { monzoStatus, syncMonzo } from "@/lib/monzo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily job (see vercel.json): syncs Monzo, emails automatic payment reminders (after the
 * sync, so invoices just paid aren't chased), then backs everything up to Google Drive.
 * Vercel calls it with "Authorization: Bearer <CRON_SECRET>"; anything else is refused.
 */
function authorised(header: string | null): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (secret.length < 16 || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorised(req.headers.get("authorization"))) return new Response("Unauthorised", { status: 401 });
  let monzo: string = "not connected";
  if ((await monzoStatus()).connected) {
    try {
      const r = await syncMonzo();
      monzo = `added ${r.added}, matched ${r.matched}`;
    } catch {
      monzo = "failed";
    }
  }
  const reminders = await runAutoReminders();
  let backup = "Google not connected";
  if (await googleEmail()) {
    try {
      backup = `saved ${(await runBackup()).date}`;
    } catch {
      backup = "failed";
    }
  }
  return Response.json({ monzo, reminders, backup });
}
