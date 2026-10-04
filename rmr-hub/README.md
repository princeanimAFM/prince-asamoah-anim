# RMR Hub

The RMR Dev Works business assistant. It runs in the browser and installs on your phone's home screen.

- **Hours**: log time per client, with a warning as you approach the 20-hour weekly visa limit
- **Clients**: contact details that fill in your invoices
- **Invoices**: create them from logged hours or fixed prices, get a branded PDF, and email it to the client from your Gmail with the PDF attached. Send payment reminders with one tap, or switch on automatic reminders (1, 7 and 14 days after the due date) in Settings.
- **Money**: Monzo syncs by itself every morning (or import any bank's CSV statement). Payments that quote an invoice number are matched and the invoice is marked paid. Snap a photo of a receipt against any expense; it's filed in Drive.
- **Tax**: an estimate of income tax and Class 4 NI on your freelance profit on top of your salary, plus what you've saved in your tax pot and key deadlines
- **Contracts**: build a plain-English agreement from a template (buy outright in 1 to 3 payments, or a start fee plus monthly payments with care included and an early buy-out; Scottish or English law), edit it, then send the client a private signing link by WhatsApp or email. They read and sign on their phone with no account; you get a signed PDF with an audit record (time, IP, browser and a fingerprint of the exact text), filed in Drive under `Contracts/<client>`. Withdrawing a link or voiding a contract stops the old link working.
- **Backups**: every morning everything is copied to Google Drive (a full backup file per day plus spreadsheets). Settings also lets you download a backup, or restore one.
- **Google Drive**: invoices and yearly records saved in an `RMR Dev Works` folder:

```
RMR Dev Works/
  Invoices/2026-27/RMR-0001 - KM Express Couriers.pdf
  Contracts/KM Express Couriers/Software Development Agreement… .pdf
  Receipts/2026-27/2026-10-01 Claude subscription.jpg
  Tax/2026-27/Money in and out 2026-27.csv
  Tax/2026-27/Hours log 2026-27.csv
  Backups/2026/RMR Hub backup 2026-10-04.json
  Backups/Spreadsheets/Clients.csv, Invoices.csv, Money in and out.csv, …
```

The tax figures are planning estimates using Scottish or rest-of-UK income tax bands (choose in Settings). Your Self Assessment return is the real figure. Rates are in `src/lib/tax.ts`; add each new tax year's bands there when they're announced.

## Try it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd rmr-hub
npm install
cp .env.example .env.local
# In .env.local set DEV_SKIP_AUTH=true and any AUTH_SECRET to skip sign-in locally
npm run dev
```

Open http://localhost:3000. With no `DATABASE_URL`, data is stored in `rmr-hub/data/` on your computer. Without Google connected, emails you "send" locally are saved in `rmr-hub/data/outbox/` instead of being sent.

Checks: `npm test`, `npm run typecheck` and `npx next build`.

## Put it online (free tiers)

RMR Hub runs on Netlify's free plan (business use allowed) with a free Neon Postgres database. It also runs on Vercel (`vercel.json` holds the daily job there), but Vercel's free plan is for non-commercial use only.

### 1. Database: Neon
1. Sign up at [neon.tech](https://neon.tech) and create a project called `rmr-hub` in **AWS Europe West 2 (London)**.
2. On the project dashboard press **Connect**, turn on **Connection pooling**, and copy the connection string. That's your `DATABASE_URL`.
3. Tables are created automatically the first time the app starts.

### 2. Google sign-in, Drive and Gmail
1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project called "RMR Hub".
2. **APIs & Services › Library**: enable the **Google Drive API** and the **Gmail API**.
3. **OAuth consent screen** (Google Auth Platform): app name "RMR Hub", your email as the support contact.
   - If your email is a Google Workspace address, choose **Internal**.
   - If it's a normal Gmail address, choose **External**, then under **Audience** press **Publish app** so it's "In production". (In "Testing", Google signs you out of Drive and Gmail every 7 days.) Google will show an "unverified app" warning when you sign in: that's expected for your own private app; choose **Advanced › Go to RMR Hub**. Only `ALLOWED_EMAIL` can get in.
4. **Clients › Create client › Web application**:
   - Authorised redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://YOUR-SITE.netlify.app/api/auth/callback/google`
5. Copy the client ID and secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

RMR Hub asks for two permissions: `drive.file` (it can see and change only the files it creates, not the rest of your Drive) and `gmail.send` (it can send email as you; it can't read your inbox).

### 3. Hosting: Netlify
1. In [Netlify](https://app.netlify.com): **Add new project › Import an existing project › GitHub**, and pick this repo.
2. Set **Base directory** to `rmr-hub`. The rest is read from `rmr-hub/netlify.toml`.
3. Add the environment variables (mark the secret ones as secret):
   - `DATABASE_URL`
   - `AUTH_SECRET`: 32 or more random characters (e.g. from https://generate-secret.vercel.app/32, or `npx auth secret`)
   - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
   - `ALLOWED_EMAIL` (your Google account)
   - `CRON_SECRET`: another long random value. The scheduled function in `netlify/functions/daily.mts` uses it every morning at 7am UTC to sync Monzo, send automatic reminders and back everything up to Drive.
   - `MONZO_CLIENT_ID` and `MONZO_CLIENT_SECRET` (step 4, optional)
4. Deploy, then open the site on your phone and choose **Add to Home Screen**.

Only the `ALLOWED_EMAIL` account can sign in. `DEV_SKIP_AUTH` is ignored in production. On first sign-in, check **Settings › Business details**: the email there is shown on invoices and used as the reply-to address for invoice emails.

### 4. Monzo sync (optional)
Monzo's developer API lets you read your own account. It can't move money.
1. Sign in at [developers.monzo.com](https://developers.monzo.com) with the email your Monzo account uses, and approve the sign-in in the Monzo app.
2. **Clients › New OAuth client**:
   - Name: RMR Hub
   - Redirect URL: `https://YOUR-SITE.netlify.app/api/monzo/callback`
   - Confidentiality: **Confidential** (so it can stay signed in)
3. Copy the client ID and secret into `MONZO_CLIENT_ID` and `MONZO_CLIENT_SECRET` in Netlify and redeploy.
4. In RMR Hub go to **Settings › Monzo › Connect Monzo**, sign in, then approve access in the Monzo app and press **Sync now**.

The first sync brings in the last 90 days (Monzo's limit). After that it syncs every morning. If Monzo asks you to reconnect, Settings shows a message; press **Reconnect**.

Only the `ALLOWED_EMAIL` account can sign in. `DEV_SKIP_AUTH` is ignored in production.

## Importing a statement instead

If Monzo isn't connected, or for another bank: in the Monzo app go to **Account › Statements › Export**, choose **CSV** and a date range, then upload it on the Money page.
- Re-importing the same file is safe, because transactions already imported are skipped.
- Ask clients to use the invoice number (e.g. `RMR-0001`) as their payment reference, so payments are matched automatically.
- Moves into a pot are treated as tax savings. You can change the type of any transaction.
- Synced and imported transactions share Monzo's transaction IDs, so nothing is added twice.
