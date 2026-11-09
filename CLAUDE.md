# Working rules for Claude Code

This repo holds Prince's portfolio site (root), RMR Hub (`rmr-hub/`), the RMR Dev Works business app, and
KACE COLLECTIONS (`kace-collections/`), an online fashion store built for a client.
These rules apply to every project in the repo, including new ones.

## Security review is required

Before calling any feature, fix or change "done", and before every commit that touches app code:

1. Run the `/security-review` command on the pending changes.
2. Fix every finding rated medium or higher, or explain clearly why it is safe.
3. Re-run the tests and type check after the fixes.

Pay particular attention to anything handling money, logins, personal data (UK GDPR), file uploads,
API keys or payment links. Never commit secrets: keys go in environment variables (`.env.local`,
Vercel/GitHub secrets), and `.env*` files stay git-ignored.

## Legal compliance is required

Work through `COMPLIANCE.md` for every change and tell Prince about anything that applies, in plain
words. In particular:

- A feature that collects new personal data, sends it to a new service, or keeps it longer → update
  the privacy notice in the same change.
- No analytics, tracking or non-essential cookies without consent first.
- Only add dependencies, fonts or images whose licences allow commercial use.
- Anything legally uncertain (consumer contracts, marketing emails, data leaving the UK) → ask
  before building it, rather than guessing.

## Automatic checks

- A hook blocks `git commit` if `.env` files or keys are staged (`.claude/hooks/pre-commit-check.sh`).
  If it blocks a commit, remove the secret; never work around the hook.
- Before pushing, run `.github/scripts/check-dependencies.sh` from the repo root (vulnerabilities and
  licences for every npm project). CI runs it again with gitleaks and CodeQL on every pull request
  (`.github/workflows/security.yml`). A red security check is a blocker, not a flake.
- A new project gets a `package-lock.json` (so it is checked automatically) and its own test, type
  check and build steps listed below.

## RMR Hub checks

From `rmr-hub/`: `npm test`, `npm run typecheck` and `npx next build` must all pass before a commit.

## KACE COLLECTIONS checks

From `kace-collections/`: `npm test`, `npm run typecheck` and `npx next build` must all pass before a commit.
It sells to consumers in the UK and Ghana, so the consumer-contract and privacy points in `COMPLIANCE.md`
apply to every feature that takes orders, payments, accounts or emails.

## RMR Dev Works brand

Use the same brand everywhere (RMR Hub, invoices, contracts, TikTok, the `apps/` link page):
- Logo: the three blue blocks with "RMR Dev Works · Where ideas take shape" (`rmr-hub/public/logo-invoice.png`,
  the `Blocks` component in `rmr-hub/src/components/icons.tsx`, `rmr-hub/public/icon-512.png`).
- Colours: blue `#2B6CE0`, light blues `#5A92EE` / `#9DC0F7`, navy `#1E2A44`.
- Fonts: Baloo 2 (headings) and Nunito (text), in `rmr-hub/src/app/fonts/`.
- Marketing doesn't name a country or nationality, and videos don't say "small business": say "your business"
  or name the type.
- Contact: customers reach Prince by TikTok messages or email (animasamoahprince@gmail.com) only.
  Never show WhatsApp or a phone number in marketing, videos or the link page.
