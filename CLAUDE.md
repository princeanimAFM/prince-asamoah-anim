# Working rules for Claude Code

This repo holds Prince's portfolio site (root) and RMR Hub (`rmr-hub/`), the RMR Dev Works business app.
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
