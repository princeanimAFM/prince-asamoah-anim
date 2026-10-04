# Working rules for Claude Code

This repo holds Prince's portfolio site (root) and RMR Hub (`rmr-hub/`), the RMR Dev Works business app.

## Security review is required

Before calling any feature, fix or change "done", and before every commit that touches app code:

1. Run the `/security-review` command on the pending changes.
2. Fix every finding rated medium or higher, or explain clearly why it is safe.
3. Re-run the tests and type check after the fixes.

Pay particular attention to anything handling money, logins, personal data (UK GDPR), file uploads,
API keys or payment links. Never commit secrets: keys go in environment variables (`.env.local`,
Vercel/GitHub secrets), and `.env*` files stay git-ignored.

## RMR Hub checks

From `rmr-hub/`: `npm test`, `npm run typecheck` and `npx next build` must all pass before a commit.
