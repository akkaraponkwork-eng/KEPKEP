# UX/UI Guidelines

Use for building or reviewing anything user-facing. Good UX/UI review is specific to real user paths, not abstract taste — always tie feedback to a concrete screen/flow/state.

## 1. Interaction & Feedback
- Every action that takes >~300ms has a loading state (spinner, skeleton, disabled button with a label change) — never a UI that appears frozen.
- Every destructive action (delete, remove, cancel a paid thing) has a confirmation step or an undo window — never instant, irreversible destruction on a single click.
- Every async action that can fail has a visible error state with a next step ("retry", "contact support"), not a silent failure or a console-only error.
- Success is confirmed visibly (toast, inline message, state change) — don't leave the user wondering if their action worked.
- Disabled states are visually distinct and, where non-obvious, explain *why* disabled (tooltip) rather than a silently unclickable button.

## 2. Forms
- Labels are always visible (not placeholder-only — placeholder text disappears on input and fails accessibility).
- Validation errors appear next to the specific field, in plain language ("Email must include an @" not "Invalid input"), and clear once corrected.
- Required vs optional fields clearly marked; don't ask for more than needed.
- Field-appropriate input types/keyboards on mobile (`type="email"`, `type="tel"`, `inputmode="numeric"`).
- Multi-step forms show progress and preserve entered data across steps/back-navigation.

## 3. Information Hierarchy
- One primary action per screen/section, visually dominant (color/size/position); secondary actions visually subordinate.
- F-pattern / Z-pattern scanning respected for content-heavy layouts — most important info top-left or top-center, not buried.
- Group related elements with proximity/whitespace rather than relying on borders/dividers for every grouping.
- Typography scale: no more than ~3-4 distinct font sizes per screen; consistent weight usage (don't bold everything, nothing stands out).

## 4. Consistency / Design System Thinking
- Reuse existing components/tokens rather than one-off styles — spacing, color, radius, shadow values should come from a defined scale (e.g. Tailwind's default scale or a custom token set), not arbitrary pixel values sprinkled through the code.
- Interactive elements (buttons, links, inputs) look and behave the same way everywhere they appear.
- Icon language is consistent (one icon set, consistent stroke width/style) — don't mix icon libraries.
- Empty states, loading states, and error states are designed intentionally per screen, not left as a blank div or a generic "Error" text.

## 5. Responsive & Cross-Device
- Layout tested (or at minimum reasoned through) at common breakpoints: mobile (~375px), tablet (~768px), desktop (~1280px+).
- Touch targets ≥44x44px on mobile; adequate spacing between adjacent tappable elements to avoid mis-taps.
- No horizontal scroll on mobile from a fixed-width element or unhandled overflow.
- Text remains legible (min ~14-16px body) at all breakpoints; no essential content hidden only on mobile without an equivalent path to it.

## 6. Accessibility (non-negotiable baseline, not a "nice to have")
- Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text/UI components) — check this concretely, don't eyeball it.
- All interactive elements reachable and operable via keyboard alone (tab order makes sense, focus states are visible, no keyboard traps).
- Images have meaningful `alt` text (or `alt=""` if purely decorative); icons-only buttons have an accessible label (`aria-label`).
- Semantic HTML first (`<button>` not `<div onClick>`, proper heading hierarchy `h1`→`h2`→`h3` without skipping levels) — ARIA is a supplement, not a substitute, for semantic elements.
- Forms: inputs programmatically associated with labels (`<label for>` or wrapping), error messages associated via `aria-describedby`.
- Motion: respect `prefers-reduced-motion` for any non-essential animation.

## 7. Visual Design Judgment
- Avoid the generic "AI-default" look (pure `#ffffff`/`#000000`, default system fonts, default Tailwind blue, centered everything, uniform rounded corners everywhere) unless the user specifically wants a minimal/neutral aesthetic — see your frontend-design skill for deeper guidance on distinctive visual direction when building new UI from scratch.
- Whitespace is intentional — dense enough to feel efficient for data-heavy tools (dashboards, admin panels), generous enough to feel calm for consumer-facing content.
- Color used with purpose: a small functional palette (1 primary, 1-2 accent, semantic colors for success/warning/error/info) rather than many arbitrary hex values.
- Motion/transitions purposeful and quick (~150-300ms) — signal state change, don't decorate for its own sake.

## 8. Content & Microcopy
- Button labels describe the action ("Save changes", not "Submit" or "OK") — the user shouldn't have to guess what happens.
- Error messages are actionable, not just descriptive ("Your session expired — please log in again" not "Error 401").
- Empty states explain what's missing and, where relevant, what to do about it ("No orders yet — your completed orders will show up here").

## Reviewing an existing UI

Walk actual user flows end to end (e.g. "sign up → first action → error case → success case"), not screen-by-screen in isolation — most real UX bugs live in the transitions and edge states between screens, not the happy-path static screen.
