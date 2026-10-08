# Safety and legal checklist

Applies to every project in this repo (the portfolio, RMR Hub, and anything added later).
Claude Code works through it before calling a change done, and every pull request repeats
it as a checklist. It's a practical guide for a UK sole trader, not legal advice: for
anything uncertain, ask before shipping.

## What runs automatically

| When | Check | Where |
| --- | --- | --- |
| Claude runs `git commit` | Blocks `.env` files and known key formats (Stripe, Google, GitHub, AWS, OpenAI, Anthropic, private keys, database URLs with passwords) | `.claude/hooks/pre-commit-check.sh` |
| Every pull request, push to main, and weekly | gitleaks scans the whole git history for secrets | `.github/workflows/security.yml` |
| Same | CodeQL scans the code for security bugs (results in the repo's **Security** tab) | same |
| Same | Every npm project: no high or critical vulnerabilities; no GPL, AGPL, SSPL or non-commercial licences | `.github/scripts/check-dependencies.sh` |
| Pull requests | New dependencies are checked for vulnerabilities and licences before merging | same workflow |
| Weekly | Dependabot opens pull requests for dependency updates and security fixes | `.github/dependabot.yml` |
| Every Claude change to app code | `/security-review`, with medium-and-above findings fixed | `CLAUDE.md` |

New projects in this repo are picked up automatically (any folder with a `package-lock.json`).

## Security

- [ ] Every server action, API route and page that shows business data checks the user is signed in. Public routes (like contract signing links) use long random tokens and show only what that person should see.
- [ ] All input from forms, URLs, uploads and webhooks is validated on the server. Database access goes through Drizzle (no SQL built from strings).
- [ ] No `dangerouslySetInnerHTML` or HTML built from strings, unless it is escaped.
- [ ] Keys stay server-side in environment variables (never `NEXT_PUBLIC_…`). Error messages shown to users don't include keys, stack traces or other people's data.
- [ ] Uploads: type checked from the file's contents, size limited, never executed or served from the app's own domain.
- [ ] Payments: never store card details. Payment links come from the payment provider. Amounts are worked out on the server.
- [ ] Calls to other services have a timeout, use a fixed address (the user can't choose the host), and send no more data than they need.

## Personal data (UK GDPR and the Data Protection Act 2018)

- [ ] Collect only what the feature needs, and know why (the lawful basis: usually *contract* for clients, *legal obligation* for tax records).
- [ ] The privacy notice (`rmr-hub/src/app/privacy`) is updated when a feature collects new data, sends data to a new service, or keeps it for a different length of time.
- [ ] Any new service that receives personal data is in the UK or EEA, or has UK transfer safeguards. List it in the privacy notice under "Where it is kept".
- [ ] Personal data is not logged, put in URLs, or sent to analytics.
- [ ] People can get a copy of their data, have it corrected, or have it deleted when it no longer needs to be kept (backups and exports included).
- [ ] Records HMRC needs are kept for at least 5 years after the 31 January deadline for that tax year. Anything else isn't kept longer than needed.
- [ ] **Once, for the business:** check whether RMR Dev Works must pay the ICO data protection fee (most businesses that keep client records on computer do; small businesses pay the lowest tier). Check at ico.org.uk/fee.

## Websites (PECR, Equality Act, business names)

- [ ] No non-essential cookies, tracking pixels or analytics without the visitor's consent first. Essential sign-in cookies are fine.
- [ ] Prefer serving fonts, scripts and images from the site itself. Every third-party request shares the visitor's IP address with that company.
- [ ] Marketing emails go only to people who opted in, or to existing clients about similar services, with an unsubscribe link every time. Invoices and reminders are service emails, not marketing.
- [ ] Accessible to WCAG 2.2 AA where practical: labelled form fields, keyboard use, colour contrast, alt text, works when zoomed in on a phone.
- [ ] Trading under a business name: invoices, contracts, emails and the website show Prince's own name and a UK address where documents can be served (business names rules, Companies Act 2006 Part 41).

## Clients, contracts and money

- [ ] Invoices show: the business name and owner's name, address, invoice number, date, a description of the work, and the amount. Add a VAT number and VAT only if registered for VAT.
- [ ] If a client is a consumer (not a business), off-premises and online contracts need the 14-day cancellation information (Consumer Contracts Regulations 2013), and terms must be fair (Consumer Rights Act 2015).
- [ ] Late payment interest or fees are claimed only from business clients, as the Late Payment of Commercial Debts Act allows.

## Code, content and licences

- [ ] Dependencies, fonts, images, icons and code snippets have licences that allow commercial use. Note any that require attribution.
- [ ] No client data, real names or real contracts in tests, examples, screenshots or commits. Use made-up data.
- [ ] Data from free APIs: follow their terms (attribution, rate limits, commercial use).
