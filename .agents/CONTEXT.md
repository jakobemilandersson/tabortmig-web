# TaBortMig — Domain Context

TaBortMig is a small web app that helps Swedish users keep track of when they
have opted out from Swedish people-search sites and sends reminder emails before
those opt-outs may need to be renewed.

This is a portfolio/case-study product, not a large SaaS. Scope stays focused
and clean.

## MVP v1 — exact behaviour

### Free tier (no account required)
- A curated list of supported sites with a link to each site's opt-out page.
- Brief instructions/guide on how to opt out at each site.

### Paid tier (requires account; payment UI deferred to post-MVP)
- Mark "I have opted out" per site and enter the opt-out date.
- A single **Save** button persists all changes at once.
- Email reminder sent 7 days before estimated expiry
  (`optOutDate + defaultDurationMonths`).

### What MVP v1 explicitly excludes
- Automatic GDPR submissions, scraping, or status checks.
- Payment processing (data model stubs exist, but no payment UI).
- Advanced dashboard or analytics.

## Domain language

- `Site`
  - A Swedish people-search or data-aggregator site supported by the app.
  - Has: `id`, `name`, `optOutUrl`, `defaultDurationMonths`, short `description`.
  - Defined as static config in `src/data/sites.ts`.
  - The `defaultDurationMonths` values are **heuristics**, not legal facts.
    The UI must communicate this clearly.

- `User`
  - A person using TaBortMig, identified by email via Firebase Auth.
  - Stored in Firestore `users/{uid}`.
  - Fields: `email`, `isPaid: boolean`, `paidUntil: Timestamp | null`.
  - `isPaid` / `paidUntil` are stubs for a future paywall (~10 SEK/year for
    reminders). The reminder job must already filter on `isPaid` even in MVP.

- `OptOutEntry`
  - A record that a `User` has opted out from a `Site`.
  - Stored in Firestore `users/{uid}/optOutEntries/{siteId}`.
  - Fields: `siteId`, `optOutDate: Timestamp`, `expiryDate: Timestamp`.
  - `expiryDate` is always derived: `optOutDate + site.defaultDurationMonths`.
  - Computed in `src/features/optOuts/computeExpiryDate.ts`.

- `Reminder`
  - A conceptual event triggered when an `OptOutEntry` is 7 days from expiry.
  - Implemented as a daily Cloud Scheduler → Cloud Function job.
  - Sends a transactional email via an external provider (SendGrid/Mailgun/Brevo).

## Supported sites — v1

| Site | `defaultDurationMonths` |
|---|---|
| Ratsit | 12 |
| MrKoll | 6 |
| Hitta | 12 |
| Merinfo | 12 |
| Eniro | 12 |

## Views

- `/` — `HomePage`
  - Explains the service. Shows the site list with opt-out links.
  - Unauthenticated: checkbox and date input disabled, CTA to sign in.
  - Authenticated: renders full `SiteCard` per site with Save button.

- `/auth` — `AuthPage`
  - Email sign-up / sign-in via Firebase Auth.
  - Redirects to `/` on success.

- `/account` — `AccountPage`
  - Protected route (redirects to `/auth` if not signed in).
  - Shows saved opt-out entries, allows editing and saving.

## Routing

- React Router v7, `BrowserRouter` + `<Routes>`.
- `ProtectedRoute` wrapper redirects unauthenticated users to `/auth`.
- Agents must not add, remove, or rename routes without explicit user request.

## Environment variables

The Firebase web SDK requires the following environment variables. These are
**not secrets** — they are public identifiers. Security is enforced by
Firestore rules and Firebase Auth.

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (e.g. `project-id.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

**Local development:** copy these into `.env.local` (gitignored).

**CI/CD:** all six variables must be set as GitHub Actions secrets and injected
at build time:

```yaml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
  VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
  VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
  VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
  VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
```
