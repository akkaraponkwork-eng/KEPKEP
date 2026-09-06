---
name: fullstack-dev-review
description: Use this skill for any full-stack web development work that needs to be production-grade — writing or reviewing React/Next.js (or similar) code for security, architecture, and performance; designing/reviewing UX/UI; and drafting implementation plans, data schemas (ER diagrams), and sequence diagrams before or during a build. Trigger this whenever the user asks to "review my code," "audit," "check for security issues," "is this production-ready," "refactor," "improve architecture," "plan out this feature," "design the schema/data model," "draw a sequence/workflow diagram," build or critique a UI/UX, design a component library or design system, or generally build/ship a real web app or feature — even if they don't use the words "production-grade" or "code review" explicitly. Covers frontend, backend/API, database/data-layer, auth, planning/schema/sequence diagrams, and UX/UI in one pass.
---

# Full-Stack Production-Grade Development & Review

A working method for building or reviewing full-stack web apps (React/Next.js-style stacks, but the principles generalize) to a production bar — covering code quality, architecture, security, performance, and UX/UI.

This skill has two modes. Figure out which one the user needs (or do both):

- **Review mode**: the user has existing code/a repo and wants it audited or improved.
- **Build mode**: the user is building something new and wants it done right the first time. For anything nontrivial, this starts with a plan (see `references/implementation-planning.md`) — schema first, then sequencing — checkpointed with the user before heavy implementation, not code first and plan implied afterward.

## How to use this skill

1. **Scope the pass.** Don't try to cover everything in references/ at once. Read the relevant reference file(s) below based on what the user is asking about, then apply that checklist to the actual code/design in front of you.
2. **Be concrete, not generic.** Every finding or recommendation should point at specific code, specific components, or specific screens — not restate the checklist as advice. "This is a security issue" is useless; "the `/api/users/[id]` route reads `req.query.role` and never checks it against the session, so any authenticated user can pass `?role=admin`" is useful.
3. **Prioritize.** Real review output is triaged, not a wall of nitpicks. Use severity tiers: **Blocker** (data loss, auth bypass, crash in prod) → **High** (perf cliff, broken UX for a real user path, missing error handling) → **Medium** (maintainability, inconsistent patterns) → **Low/nit** (naming, formatting). Lead with blockers.
4. **Show the fix, not just the problem.** Where feasible, give the corrected code/component, not just a description of what's wrong.
5. **UX/UI is not an afterthought.** Even for backend-heavy requests, if user-facing screens are involved, sanity-check them against `references/uxui-guidelines.md`. Even for design requests, sanity-check feasibility/performance against the engineering checklists.

## Reference files — read what's relevant, skip the rest

- `references/code-review-checklist.md` — systematic checklist for reviewing existing code: correctness, error handling, data flow, testing, code smells. Read this whenever the user shares code and asks for review/audit/feedback.
- `references/production-architecture.md` — how to structure a full-stack app so it doesn't collapse under real usage: layering (routes/services/repositories), state management, API design, database/schema decisions, deployment/observability. Read this for architecture questions, "is this scalable," refactor requests, or when starting a new build.
- `references/implementation-planning.md` — how to draft an implementation plan before coding, design a data schema, and produce Mermaid ER/sequence diagrams. Read this whenever a build task is nontrivial (new feature spanning more than one file, schema change, integration with an external service) — plan and get sign-off before writing a lot of code, not after. Also read it whenever the user asks for a schema, data model, workflow diagram, or sequence diagram specifically.
- `references/security-checklist.md` — auth, authorization, input validation, secrets, common vulnerability classes (injection, XSS, IDOR, SSRF, etc.), and a threat-modeling pass. Read this for ANY review touching auth, user input, payments, admin panels, or file uploads — treat security as non-optional, not something the user has to ask for by name.
- `references/uxui-guidelines.md` — visual design, interaction design, accessibility, responsive behavior, and design-system thinking. Read this when building or reviewing anything user-facing: pages, components, forms, flows.

## Defaults when the user hasn't specified

- **Framework**: assume React + Next.js (App Router) unless told otherwise — it's the most common target, but adapt readily to Vue/Svelte/plain Node/etc. if that's what's shown.
- **Depth**: for a review request with no other context, do a full pass across code-review + security + (if user-facing) UX/UI — don't wait to be asked for "a security review" separately.
- **Output**: for code changes, prefer editing/creating the actual files over describing changes in prose (see the file-creation guidance in your main instructions — this still applies here). For a review-only request, a structured written report (findings by severity, each with file/line reference and suggested fix) is the right artifact.
- **Testing**: production-grade means testable. If a build task doesn't include tests and the codebase has a test setup (or the user hasn't said "skip tests"), add reasonable test coverage for the new/changed logic rather than treating tests as optional.

## Pace and rigor

Production-grade work is not a speed contest. Don't rush to a finished-looking answer:

- **Read before writing.** For a review, actually read the relevant code/files in full before producing findings — don't infer likely issues from filenames or a partial view and pattern-match to "typical" bugs. For a build task, look at the surrounding codebase's existing conventions before writing new code, so the result fits in rather than introducing a fourth pattern for the same thing.
- **Verify before reporting.** Before listing something as a Blocker/High finding, trace it through the actual code path — confirm the vulnerable line is genuinely reachable with attacker-controlled input, confirm the "missing" check isn't handled one layer up (middleware, a wrapper, a shared validator) before flagging it as absent. A false positive costs the user's trust more than a missed nit does.
- **Re-check your own output.** After writing code or a fix, reread it against the checklist you just used — did the fix introduce a new issue (e.g. the auth check you added actually blocks legitimate users, the sanitization breaks valid input)? After a review, scan your own findings list for duplicates, contradictions, or a Blocker that's actually just a Low dressed up.
- **It's fine to say "I need to look at X to be sure"** rather than guessing and presenting the guess with unearned confidence. If a review can't fully verify something without more context (e.g. can't see the middleware file, can't see the DB schema), say so explicitly next to that finding instead of asserting it flatly.

## Token efficiency

Thoroughness above is about correctness, not about maximizing output length — the two are not the same, and padding is its own failure mode:

- Load only the reference file(s) actually relevant to the current request. Don't read all four upfront "just in case" — a pure UX review doesn't need the security checklist loaded, a backend-only change doesn't need uxui-guidelines.md.
- In review output, state each finding once, concisely, with the file/line and the fix — don't restate the same issue in a summary paragraph and then again in the findings list and then again in a "conclusion." One clear location per finding.
- Skip boilerplate preamble ("Let me review your code carefully...") and boilerplate closing summaries that just restate the finding counts already visible in the report above them.
- When showing a code fix, show only the changed function/block plus enough surrounding context to place it — not the entire file, unless the whole file is short or nearly everything changed.
- Don't over-explain checklist items that don't apply — silently skip them rather than writing "N/A: this doesn't apply because..." for every non-issue category.

## Anti-patterns for this skill itself

- Don't produce a checklist-shaped report that just restates every item in references/ as a generic bullet ("✅ Consider adding error handling somewhere"). Every bullet should be traceable to something specific you looked at.
- Don't gate a security or accessibility pass behind the user asking for it by name — these are part of "production-grade" by default.
- Don't rewrite an entire codebase to your own taste when the user asked for a review — separate "must fix" from "would prefer" and let them choose scope for the latter.
