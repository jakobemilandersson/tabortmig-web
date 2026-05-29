# Skill: PR Review

Triggered when the user asks to review a pull request in
`jakobemilandersson/tabortmig-web`.

## Output format

Post the review directly on the GitHub pull request using review type `COMMENT`.
Use this exact structure:

```
## Summary
One sentence describing what the change does.

## Verified
<type-specific checklist — only items relevant to this PR type>

## Action items
- Blocker: <specific violation — must fix before merge>
- Minor: <non-blocking improvement>
(omit section entirely if none)

## Verdict
<"No blockers — safe to merge" or "Blockers present — do not merge">

---
*Reviewed by AI pair-programmer (Perplexity)*
```

## Blocker definition

Anything violating rules defined in:
- `.agents/project-context.md` (architectural constraints, layer ownership,
  import rules, testing rules)
- Space Instructions (tech stack, architectural enforcement)

Everything else is **Minor** at most.

## Docs audit enforcement (CRITICAL — read before reviewing any feat or refactor PR)

For every `feat` or `refactor` PR that touches any file under `src/`:

1. Inspect the PR diff for changes to `.agents/CONTEXT.md` or
   `.agents/project-context.md`.
2. If **none** of those files appear in the diff, you **must** determine whether
   they should have been updated:
   - Did the PR introduce new domain types, terms, or UI components relating to
     opt-outs, sites, reminders, or auth? → `.agents/CONTEXT.md` required.
   - Did the PR change routing, layer rules, import constraints, or tooling?
     → `.agents/project-context.md` required.
3. If any of those should have been updated but weren't, it is a **Blocker**:
   > Blocker: Docs audit incomplete — `<file(s)>` must be updated to reflect
   > `<what changed>`.
4. If none needed updating, confirm this explicitly in the Verified section:
   > Docs audit: no new domain terms, architectural changes, or docs-worthy
   > decisions — not needed.

You **must not** approve a `feat` or `refactor` PR without explicitly resolving
step 4 above.

## Type-specific checklists

### `feat`
- Correct layer ownership — logic in right slice (`pages`, `features`,
  `components`, or `data`)
- Cross-slice imports respect direction rules (pages → features/components/data;
  features → data only; components → nothing upward)
- No direct Firebase calls from `components` or `data`
- Tests exist (Vitest + React Testing Library where applicable)
- No violations of `.agents/project-context.md` constraints
- Docs audit complete (see section above — **mandatory**)

### `fix`
- Root cause addressed, not just symptom
- Regression test covers the fixed case
- No unintended behaviour changes in adjacent logic (opt-out dates, site list,
  reminder scheduling)
- No violations of `.agents/project-context.md` constraints

### `refactor`
- Behaviour unchanged
- No layer boundary crossings introduced
- No violations of `.agents/project-context.md` constraints
- Docs audit complete (see section above — **mandatory**)

### `test`
- Uses explicit mock data, not prod Firebase state
- Ordering and edge cases asserted where filter/date logic is tested
- No violations of `.agents/project-context.md` constraints

### `docs`
- Content accurate against current source
- No stale site names, dates, or feature descriptions
- Formatting consistent

### `chore`
- CI still passes
- Linting enforcement intact
- No architectural rules inadvertently weakened
