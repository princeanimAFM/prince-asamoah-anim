import { timingSafeEqual } from "node:crypto";
import { runBackup } from "@/lib/backup";
import { googleEmail } from "@/lib/google";
import { runAutoReminders } from "@/lib/invoice-mail";
import { monzoStatus, syncMonzo } from "@/lib/monzo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily job: syncs Monzo, emails automatic payment reminders (after the sync, so invoices
 * just paid aren't chased), then backs everything up to Google Drive.
 *
 * On Netlify, netlify/functions/daily.mts calls it once per step (?task=monzo, then
 * reminders, then backup) so each request stays short. Without ?task it runs all three.
 * Callers must send "Authorization: Bearer <CRON_SECRET>"; anything else is refused.
 */
function authorised(header: string | null): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (secret.length < 16 || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

const TASKS = {
  async monzo() {
    if (!(await monzoStatus()).connected) return "not connected";
    const r = await syncMonzo();
    return `added ${r.added}, matched ${r.matched}`;
  },
  async reminders() {
    return runAutoReminders();
  },
  async backup() {
    if (!(await googleEmail())) return "Google not connected";
    return `saved ${(await runBackup()).date}`;
  },
};

type Task = keyof typeof TASKS;

export async function GET(req: Request) {
  if (!authorised(req.headers.get("authorization"))) return new Response("Unauthorised", { status: 401 });
  const asked = new URL(req.url).searchParams.get("task");
  if (asked && !(asked in TASKS)) return new Response("Unknown task", { status: 400 });
  const tasks = asked ? [asked as Task] : (Object.keys(TASKS) as Task[]);
  const result: Record<string, unknown> = {};
  for (const t of tasks) {
    try {
      result[t] = await TASKS[t]();
    } catch {
      result[t] = "failed";
    }
  }
  return Response.json(result);
}
