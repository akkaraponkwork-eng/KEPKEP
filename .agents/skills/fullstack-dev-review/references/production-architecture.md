# Production-Grade Architecture

Use this when building new features/apps, or when a review question is really "will this hold up at scale / over time."

## 1. Layering

Don't let route handlers/page components talk directly to the database or external APIs. A production-grade layering, even in a small app:

```
Route/Controller (HTTP in, HTTP out — thin)
      ↓
Service (business logic, orchestration, validation)
      ↓
Repository / Data-access (talks to DB or external API, returns domain objects)
      ↓
DB / External API
```

- **Route handlers** parse/validate the request, call one service method, map the result to a response. No business logic here.
- **Services** hold the actual business rules ("a leave request over 3 days needs manager approval"). Testable without HTTP or a real DB (repository can be mocked).
- **Repositories** isolate the storage detail. If storage ever changes (Google Sheets → Postgres, REST → GraphQL), only this layer changes.
- For small apps this can be lighter-weight (a `lib/` folder with clear function boundaries is fine) — the point is *separation of concerns*, not necessarily enterprise ceremony. Judge the weight of the pattern by the size of the app.

## 2. API Design

- RESTful resource naming (`/api/users/:id/orders`, not `/api/getUserOrders`) unless the codebase already has an established convention — consistency beats "correctness."
- Idempotency: `PUT`/`DELETE` should be safe to retry. `POST` for creation should either be naturally safe to retry or use an idempotency key for anything money/inventory-related.
- Versioning strategy for any public API (`/api/v1/...`) if breaking changes are plausible.
- Pagination for any endpoint that could return an unbounded list — cursor-based over offset-based for anything that changes frequently.
- Consistent response envelope (`{data, error, meta}` or similar) across all endpoints.

## 3. State Management (Frontend)

- Server data → use a data-fetching library with caching (React Query/SWR/Next.js `fetch` cache) rather than manually managing loading/error/data state per-component.
- Global client UI state → context or a small state library (Zustand/Jotai), sized to actual need. Redux-level ceremony for a handful of UI flags is over-engineering.
- Form state → a form library (React Hook Form + zod, or equivalent) over hand-rolled `useState` per field once a form has more than ~3 fields or any cross-field validation.
- URL as state for anything that should be shareable/bookmarkable/back-button-able (filters, tabs, pagination page).

## 4. Database / Data Layer

- Schema: appropriate normalization, indexes on anything filtered/sorted/joined on at query time, foreign keys enforced (not just assumed in app code).
- Migrations: schema changes go through versioned migration files, never manual production edits.
- N+1 queries: check any loop that fetches related data per-item — batch it.
- Transactions for any multi-step write that must be atomic (e.g. transferring a balance, creating an order + decrementing stock).
- For non-SQL/lightweight backends (like Google Sheets used as a datastore): document the sheet-as-schema explicitly, add a repository layer so the rest of the app never touches raw row/column indices, and treat rate limits and eventual consistency as first-class constraints, not edge cases.

## 5. Performance

- Server: avoid blocking the event loop with heavy sync work; stream large responses instead of buffering fully in memory; cache expensive/external calls (with sane TTL + invalidation).
- Client: code-split by route; lazy-load below-the-fold or rarely-used components; avoid re-renders from unstable references (inline objects/functions as props, missing `useMemo`/`useCallback` where profiling shows it matters — don't over-apply memoization pre-emptively without evidence it's needed).
- Images: proper sizing/formats (Next.js `<Image>` or equivalent), lazy loading below the fold.
- Bundle size: check for accidental large dependencies; prefer dynamic imports for heavy, rarely-used features (charting libs, rich text editors).

## 6. Observability & Ops

- Structured logging (not scattered `console.log`), with enough context to trace a request end-to-end.
- Error tracking (Sentry or equivalent) wired up before launch, not after the first incident.
- Health-check endpoint for anything deployed behind a load balancer/orchestrator.
- Environment config via env vars, validated at startup (fail fast if a required var is missing) — never hardcoded fallback secrets or silently-`undefined` config.
- Feature flags for risky changes if the team ships frequently — decouples deploy from release.

## 7. Deployment

- CI runs lint + typecheck + tests on every PR, not just on merge.
- No direct pushes to the branch that auto-deploys to production without review.
- Rollback plan: can the previous version be redeployed quickly if something breaks?
- Database migrations are backward-compatible with the previous app version during a rolling deploy (don't drop a column the still-running old version reads).

## Judging "is this production-ready"

Ask, concretely:
1. What happens when this fails halfway through? (partial write, network drop mid-request)
2. What happens under 100x the expected load?
3. What happens if a malicious or just-confused user sends unexpected input?
4. If this breaks at 3am, does anyone find out, and can they figure out why?

If the code doesn't have a good answer to one of these, that's a finding — tie it back to the specific gap, not a generic "add monitoring."
