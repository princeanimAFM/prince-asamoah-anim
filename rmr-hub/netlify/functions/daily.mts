/**
 * Netlify scheduled function: every morning at 7:00 UTC, run the hub's daily job
 * (/api/cron/daily) one step at a time, so each request stays within Netlify's time limit.
 * Needs the CRON_SECRET environment variable; Netlify sets URL to the site address.
 */
export default async () => {
  const base = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.log("Daily job skipped: URL or CRON_SECRET is not set");
    return;
  }
  for (const task of ["monzo", "reminders", "backup"]) {
    try {
      const res = await fetch(`${base}/api/cron/daily?task=${task}`, { headers: { authorization: `Bearer ${secret}` } });
      console.log(`Daily job ${task}: ${res.status} ${await res.text()}`);
    } catch (e) {
      console.log(`Daily job ${task} failed: ${(e as Error).message}`);
    }
  }
};

export const config = { schedule: "0 7 * * *" };
