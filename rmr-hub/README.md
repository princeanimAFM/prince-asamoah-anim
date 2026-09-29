# RMR Hub

The RMR Dev Works business assistant. It runs in the browser and installs on your phone's home screen.

- **Hours**: log time per client, with a warning as you approach the 20-hour weekly visa limit
- **Clients**: contact details that fill in your invoices
- **Invoices**: create them from logged hours or fixed prices, get a branded PDF, mark sent and paid
- **Money**: import Monzo (or any bank) CSV statements. Payments that quote an invoice number are matched and the invoice is marked paid.
- **Tax**: an estimate of income tax and Class 4 NI on your freelance profit on top of your salary, plus what you've saved in your tax pot and key deadlines
- **Google Drive**: invoices and yearly records saved in an `RMR Dev Works` folder:

```
RMR Dev Works/
  Invoices/2026-27/RMR-0001 - KM Express Couriers.pdf
  Tax/2026-27/Money in and out 2026-27.csv
  Tax/2026-27/Hours log 2026-27.csv
```

The tax figures are planning estimates for England, Wales and Northern Ireland. Your Self Assessment return is the real figure.

## Try it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd rmr-hub
npm install
cp .env.example .env.local
# In .env.local set DEV_SKIP_AUTH=true and any AUTH_SECRET to skip sign-in locally
npm run dev
```

Open http://localhost:3000. With no `DATABASE_URL`, data is stored in `rmr-hub/data/` on your computer.

Checks: `npm test` (tax, dates and bank import) and `npm run typecheck`.

## Put it online (free tiers)

### 1. Database: Supabase
1. Create a project at [supabase.com](https://supabase.com) (choose the London region).
2. Go to **Project settings › Database › Connection string › URI** (use the "Transaction pooler" one) and copy it. That's your `DATABASE_URL`.
3. Tables are created automatically the first time the app starts.

### 2. Google sign-in and Drive
1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project called "RMR Hub".
2. **APIs & Services › Library**: enable the **Google Drive API**.
3. **OAuth consent screen**: set it to External, app name "RMR Hub", and add your email as a test user.
4. **Credentials › Create credentials › OAuth client ID › Web application**:
   - Authorised redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://YOUR-APP.vercel.app/api/auth/callback/google`
5. Copy the client ID and secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

RMR Hub asks only for the `drive.file` permission. It can see and change only the files it creates, not the rest of your Drive.

### 3. Hosting: Vercel
1. Import this GitHub repo at [vercel.com](https://vercel.com) and set **Root Directory** to `rmr-hub`.
2. Add the environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET` (run `npx auth secret` to make one)
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `ALLOWED_EMAIL` (your Google account)
3. Deploy, then open the site on your phone and choose **Add to Home Screen**.

Only the `ALLOWED_EMAIL` account can sign in. `DEV_SKIP_AUTH` is ignored in production.

## Importing from Monzo

In the Monzo app go to **Account › Statements › Export**, choose **CSV** and a date range, then upload it on the Money page.
- Re-importing the same file is safe, because transactions already imported are skipped.
- Ask clients to use the invoice number (e.g. `RMR-0001`) as their payment reference, so payments are matched automatically.
- Moves into a pot are treated as tax savings. You can change the type of any transaction.

## Planned next

- Contracts from a template, with online signing and signed PDFs saved to Drive
- Emailing invoices and reminders directly from the app
- Automatic Monzo sync through Monzo's API (limited to your own account, with re-authorisation every 90 days)
- Receipt photos for expenses
