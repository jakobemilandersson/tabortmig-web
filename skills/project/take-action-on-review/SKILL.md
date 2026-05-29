# Skill: Take Action on Review

Triggered when the user says something like
"take action on the latest review for PR #X" in
`jakobemilandersson/tabortmig-web`.

## Steps

Follow these steps in order.

### 1. Read the review

Fetch the most recent `COMMENT`-type pull request review for the specified PR in
`jakobemilandersson/tabortmig-web`.

### 2. Analyse action items

Identify all items listed under `## Action items` in that review.

- Fix all **Blocker** items unconditionally.
- Fix **Minor** items unless there is a clear reason not to (e.g. out of scope,
  conflicts with architectural rules, or requires clarification from the user).

### 3. Implement the fixes

Make the necessary code changes on the PR branch, respecting all layer ownership,
import direction, and testing rules defined in `.agents/project-context.md`.

Specific reminders for TaBortMig:
- Business logic for opt-outs, sites, and reminders lives in `src/features/`.
- Presentational UI lives in `src/components/`.
- Static site configuration lives in `src/data/`.
- Firebase calls must not leak into `components` or `data`.

### 4. Commit and push

Push the changes to the PR branch in a single commit using conventional commit
format:

```
fix(<scope>): <description of what was fixed>
```

where `<scope>` aligns with the owning area: `sites`, `optOuts`, `pages`,
`components`, `data`, etc.
