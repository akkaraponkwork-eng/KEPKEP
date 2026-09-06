# Code Review Checklist

Work through these categories against the actual code. Skip categories that don't apply (e.g. no DB in this diff). Tag every finding with a severity: **Blocker / High / Medium / Low**.

## 1. Correctness
- Does the code do what the function/component name and surrounding usage imply it does?
- Off-by-one errors, incorrect boolean logic, wrong comparison operators.
- Async correctness: unhandled promise rejections, missing `await`, race conditions between parallel requests, stale closures in `useEffect`/callbacks capturing old state.
- Null/undefined handling: does every external input (API response, DB row, query param, `localStorage`, env var) get checked before use, or does the code assume happy path?
- Edge cases: empty arrays, zero, negative numbers, very long strings, unicode/emoji in user input, timezone/DST boundaries, leap years.

## 2. Error Handling
- Are errors caught at a boundary that can actually do something useful with them (show the user a message, retry, log), not swallowed silently or caught-and-ignored?
- Do API routes/server actions return proper HTTP status codes and structured error bodies, not just a 200 with `{error: "..."}` buried inside, or a raw 500 leaking a stack trace?
- Is there a top-level error boundary / global handler so one failure doesn't white-screen the whole app?
- Do retries (if any) have backoff and a cap, not an infinite loop?

## 3. Data Flow & State
- Single source of truth: is the same piece of state duplicated in multiple places (e.g. server data copied into local state and now can drift out of sync)?
- Is server state (data fetched from an API/DB) distinguished from client/UI state (open/closed, form input)? Mixing them causes stale-data bugs.
- For forms: is validation happening in one place (schema-driven, e.g. zod) rather than scattered `if` checks, and does client-side validation have a server-side twin (never trust the client)?
- Derived values: is something being stored in state that could just be computed from existing state/props (causes sync bugs)?

## 4. Code Smells / Maintainability
- Duplicated logic that should be a shared function/hook/component.
- God components/functions doing data-fetching + business logic + rendering all in one place — should data-fetching and business logic be extracted?
- Magic numbers/strings that should be named constants or enums.
- Dead code, commented-out blocks, leftover `console.log`/debugger statements.
- Prop drilling more than 2-3 levels — is context or a state library warranted?
- Naming: do names describe what something is/does, not implementation details (`data2`, `tempList`, `handleClick2`)?

## 5. Testing
- Is new/changed business logic covered by a test, or only manually eyeballed?
- Do tests test behavior (given X input, Y output/effect) rather than implementation details (mocking so deeply the test just re-asserts the mock)?
- Are there tests for the failure paths, not just the happy path?
- For UI: is there at least a smoke test / render test for new components, and interaction tests for anything with user input?

## 6. Dependencies & Imports
- New dependency added for something a few lines of code could do? Flag it — every dependency is a maintenance and security liability.
- Are imports tree-shakeable (named imports from a library) vs pulling in the whole library?
- Version pinning: are versions unpinned in a way that could break the build (`"*"`, overly loose ranges) for a production app?

## 7. Comments & Documentation
- Comments explain *why*, not *what* (code should be readable enough that "what" is obvious).
- Public functions/API routes/exported components have a brief doc comment if their usage isn't self-evident from the signature.
- No comments that have drifted out of sync with the code they describe (worse than no comment).

## How to structure the output

```
## Blockers
- [file:line] <specific issue> — <why it breaks something> — <fix>

## High
- ...

## Medium
- ...

## Low / Nits
- ...

## What's good
- <briefly note solid patterns already in place — reviews that are 100% criticism read as less trustworthy and skip real signal>
```
