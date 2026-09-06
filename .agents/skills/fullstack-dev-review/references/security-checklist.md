# Security Checklist

Treat this as mandatory for any code touching auth, user input, file uploads, payments, or admin functionality — don't wait for the user to ask "is this secure."

## 1. Authentication
- Passwords (if stored at all — prefer OAuth/managed auth where possible) are hashed with bcrypt/argon2, never plaintext or reversibly encrypted, never MD5/SHA1.
- No hardcoded credentials or "fallback" default passwords/API keys anywhere in the codebase, including test/dev fixtures that could leak into prod config.
- Session tokens/JWTs: reasonable expiry, stored in `httpOnly` + `secure` cookies (not `localStorage`, which is readable by any injected script).
- Password reset / magic-link tokens are single-use, expiring, and cryptographically random (not predictable).

## 2. Authorization (this is where most real-world bugs live)
- **Every** API route/server action that reads or writes data checks: is this user allowed to do this, to *this specific resource*? Checking "is logged in" is not the same as checking "is allowed."
- IDOR check: if a route takes an ID (`/api/orders/:id`, `?userId=123`), does it verify the resource belongs to (or is visible to) the requesting user/role, or can any authenticated user access any ID by guessing/incrementing it?
- Role checks happen server-side. A role check that only exists in the frontend (hiding a button) is not a security control — the API route is still callable directly.
- Admin/privileged routes are checked on every request, not just at login (a demoted user's existing session shouldn't retain admin rights until it happens to expire, if avoidable).

## 3. Input Validation
- All user input (body, query params, headers, uploaded file names/content) validated against a schema (zod/yup/etc.) server-side — client-side validation is UX only, never a security boundary.
- File uploads: validate actual file type (magic bytes, not just extension or client-provided MIME type), enforce size limits, store outside the web root or in object storage with no execute permission, generate new filenames rather than trusting user-supplied ones (path traversal).
- Reject unexpected extra fields rather than silently ignoring them (mass-assignment risk — e.g. a `role` field slipped into a profile-update payload).

## 4. Injection
- SQL: parameterized queries / ORM only, never string-concatenated SQL.
- NoSQL: watch for operator injection (`{"$ne": null}` style payloads landing in a Mongo query built from raw user input).
- Command injection: never pass user input to a shell command (`exec`, `child_process`) without strict allow-listing; prefer APIs/libraries over shelling out.
- Template/SSTI: never render user input as a template string that gets evaluated.

## 5. XSS
- User-generated content rendered as HTML (rich text, markdown-to-HTML) goes through a sanitizer (DOMPurify or equivalent) — React's default JSX escaping protects text content but not `dangerouslySetInnerHTML`.
- Any use of `dangerouslySetInnerHTML` (or framework equivalent) is a flag to check specifically — confirm sanitization happens right before render, not just "somewhere upstream."
- URLs from user input (e.g. profile links) are validated against a safe scheme allow-list (`http(s)`) before being used in `href`/`src` — block `javascript:` URIs.

## 6. CSRF / Request Forgery
- State-changing requests (POST/PUT/DELETE) protected by CSRF tokens or `SameSite` cookie policy, especially if auth relies on cookies.
- Webhooks (LINE, Stripe, GitHub, etc.) verify the provider's signature on every incoming payload — never trust an unsigned webhook body.

## 7. SSRF
- Any server-side code that fetches a URL supplied (even indirectly) by a user validates it against an allow-list or blocks internal/private IP ranges (`127.0.0.1`, `169.254.169.254` cloud metadata endpoint, `10.x`/`192.168.x`).

## 8. Secrets Management
- No secrets committed to the repo (check `.env` is gitignored, check git history if a leak is suspected).
- Secrets loaded from environment/secret manager, validated present at startup.
- Different secrets per environment (dev/staging/prod) — a leaked dev key shouldn't grant prod access.
- Third-party API keys scoped to minimum necessary permission, rotated if there's any chance of exposure.

## 9. Rate Limiting & Abuse
- Login, password reset, and any expensive/free-tier-costly endpoint has rate limiting (per-IP and/or per-account).
- No unbounded loops driven by user input that could be used for a DoS (e.g. a "generate report" endpoint with no size cap).

## 10. Dependencies
- Flag any dependency with known CVEs at review time (or recommend running `npm audit`/equivalent as part of CI).
- Flag unmaintained/abandoned packages handling anything sensitive (auth, crypto, parsing).

## Severity for security findings specifically
- **Blocker**: auth bypass, IDOR on sensitive data, injection, hardcoded/leaked secret, plaintext password storage.
- **High**: missing rate limiting on sensitive endpoints, weak session handling, missing CSRF protection on state-changing routes.
- **Medium**: verbose error messages leaking stack traces/internals, missing security headers (CSP, HSTS, X-Frame-Options).
- **Low**: hardening opportunities (defense in depth) that aren't currently exploitable given other controls.

Don't invent hypothetical attack scenarios not actually reachable from the code you're looking at — but don't downgrade a real IDOR or injection just because "no one would think to try it."
