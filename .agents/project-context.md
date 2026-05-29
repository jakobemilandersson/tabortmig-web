# TaBortMig — Project Context

Architectural constraints, folder ownership rules, routing rules, AI-agent
workflow, and git conventions for the TaBortMig project. Read by the AI agent
at the start of each conversation in the TaBortMig space.

This file covers decisions that cannot be inferred from reading the source
alone. It does not document feature implementations — read the source for those.

## Project

React + TypeScript + Vite SPA. TaBortMig helps users track when they opted out
from Swedish people-search sites (Ratsit, MrKoll, Hitta, Merinfo, Eniro, etc.)
and sends reminder emails shortly before those opt-outs may need to be renewed.

Frontend is a static React SPA hosted on GitHub Pages under
`tabortmig.jakob.now`. Backend services (authentication, storage, scheduled
reminders, and email sending) are provided by Firebase (Firestore, Auth,
Cloud Functions + Cloud Scheduler) and an external transactional email provider
(SendGrid, Mailgun, or Brevo).

## Folder ownership

This section defines who owns what in `src/` and which directions imports are
allowed to flow.

- `src/pages/`
  - Owns top-level route components (e.g. `HomePage`, `AuthPage`, `AccountPage`).
  - Pages wire together features, components, and data for a specific route.
  - Pages may contain light UI logic (form handlers, navigation), but no
    reusable UI primitives. Extract shared UI into `src/components/`.

- `src/features/`
  - Owns domain and business logic grouped by feature (e.g. `sites`, `optOuts`,
    `auth`).
  - Contains TypeScript types, hooks, and pure functions for those features.
  - Must not import from `src/pages/` or from React Router.
  - Firebase SDK calls live here (not in components or data).

- `src/components/`
  - Owns reusable presentational components: buttons, cards, layout wrappers,
    simple form controls.
  - Components are UI-only: no routing, no Firebase calls, no business rules.
  - Components receive data and callbacks via props from pages or features.

- `src/data/`
  - Owns static data and configuration: the list of supported sites (Ratsit,
    MrKoll, Hitta, Merinfo, Eniro, etc.), default opt-out durations per site,
    and other constants.
  - No React imports here; this is plain TypeScript/JSON data.

- `functions/`
  - Owns Firebase Cloud Functions (backend, not part of the SPA build).
  - Deployed independently via `firebase deploy --only functions`.
  - Must never be imported by anything under `src/`.

### Import rules

- `pages` may import from `features`, `components`, and `data`.
- `features` may import from `data` but must not import from `pages`.
- `components` must not import from `pages`, routing, or Firebase directly.
- `functions/` is a separate package; no cross-imports with `src/`.

## Routing & pages

TaBortMig is a single-page React app using React Router v7. Routes:

- `/` — `HomePage` (public)
- `/auth` — `AuthPage` (public)
- `/account` — `AccountPage` (protected)

Routing must be implemented with `BrowserRouter` and `<Routes>`, not manual
`window.location` changes. Agents must not add, remove, or rename routes without
an explicit user request.

## Security model

### Firebase web config (VITE_FIREBASE_* env vars)

Firebase web config values (`apiKey`, `projectId`, `appId`, etc.) are **not
secrets** — they are public identifiers designed to be embedded in client-side
code. Security is enforced by Firestore rules and Firebase Auth, not by hiding
these values.

- Locally: stored in `.env.local` (gitignored).
- In CI/CD: injected as GitHub Actions secrets at build time:
  ```yaml
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    # etc.
  ```
- Must never be hardcoded in source files.

### Secrets that must never appear in the repo

| Secret | Where it lives |
|---|---|
| Email provider API key (SendGrid/Mailgun/Brevo) | Firebase Function secrets (`firebase functions:secrets:set`) |
| Firebase Admin SDK service account | Firebase Function runtime only |
| Any future payment API keys | Firebase secrets or GitHub Actions secrets |

### Firestore security rules

Users may only read and write their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /optOutEntries/{siteId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

These rules must be kept in `firestore.rules` at the repo root and deployed
via `firebase deploy --only firestore:rules`.

## AI-agent workflow & behavior

This project is developed **AI-first**. Agents must follow these rules when
working in this repository.

### Skill chain for new features

For any new feature, non-trivial refactor, or behavior change, agents must:

1. **grill-with-docs**
   - Ask clarifying questions about goals, constraints, and existing docs.
   - Use `.agents/project-context.md` and `.agents/CONTEXT.md` as primary
     references, not generic React advice.

2. **to-prd**
   - Turn the clarified idea into a short product-style description (user story,
     scope, acceptance criteria).

3. **to-issues**
   - Break the PRD into small, concrete tasks (issues) that map onto this
     codebase's structure (pages, features, components, data).

4. **tdd**
   - For implementation tasks, propose tests first (Vitest + React Testing
     Library where applicable), then code to satisfy them.

Agents must run these skills **one step at a time** and ask **one question per
message**, waiting for user answers before moving on.

### Interaction rules

- When asked for code, give a **1–2 line explanation** first, then a concise code
  block only.
- Do not scaffold new files, folders, or large refactors unless the user
  explicitly asks for them.
- When debugging, ask clarifying questions if the problem is ambiguous before
  suggesting fixes.
- Prefer **small, targeted edits** that respect the existing folder ownership and
  import rules.
- If any instruction in this file conflicts with generic best practices, **this
  file wins**.

### Required docs at conversation start

Space instructions for `tabortmig-web` must ensure that agents:

1. Read `.agents/project-context.md`
2. Read `.agents/CONTEXT.md`

at the start of every new conversation, before giving any substantive answer.

## Git Conventions

### Commits & PR titles

Commit messages and PR titles SHOULD follow a lightweight conventional-commits style:

  <type>(<scope>): <short behavioral change>

Examples:

  feat(sites): add supported site list
  fix(optOuts): handle invalid date input
  refactor(components): extract shared Button
  docs(space): update SPACE instructions

- **type** reflects intent: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`.
- **scope** aligns with the owning area: `sites`, `optOuts`, `auth`, `pages`,
  `components`, `data`, `functions`, `space`, etc.
- The description reflects observable behavior or user impact, not implementation details.

### Branch naming and workflow

All non-trivial code changes (features, bug fixes, refactors) MUST be done on a branch, not directly on `main`.

Branch names follow:

  <type>/<short-description>

Examples:

  feat/sites-supported-list
  fix/optouts-empty-date
  refactor/components-button
  docs/space-instructions-v1-1

Rules:

- `type` mirrors the conventional commit type for the change.
- Description is lowercase, hyphen-delimited, 3–6 words.
- Direct commits to `main` are only acceptable for extremely small documentation or config tweaks; code changes should always go through a branch and PR.

Agents should assume:

- When proposing changes, they recommend creating an appropriate branch name first.
- When preparing work, they structure it so it can be reviewed as a focused PR.
