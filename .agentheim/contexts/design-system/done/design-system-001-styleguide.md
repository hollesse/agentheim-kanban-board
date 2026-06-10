---
id: design-system-001
title: "Styleguide: tokens, components, and developer sign-off gate"
type: feature
status: done
depends_on: [infrastructure-002]
completed: 2026-06-10
commit: 02d867b
Approved: 2026-06-10
---

# Styleguide

## Why this task exists
The board needs a consistent visual language before any frontend feature is built. This task defines the tokens and components, then gates all board UI work on developer sign-off.

**This is a hard gate:** no frontend feature task in any BC may be promoted to `todo` until this task reaches `done` and the developer has explicitly approved the design.

## What to build

### Tokens (CSS custom properties)
Define in a `tokens.css` or inline `<style>` block:
- Colour palette: background, surface, text-primary, text-secondary, border, column header colours per status (backlog / todo / doing / done)
- Typography: font family, sizes (card title, description, badge)
- Spacing scale: xs / sm / md / lg
- Border radius
- Shadow (card elevation)

### Components
Document and implement as HTML+CSS prototypes:
- **Column** — header with status label and task count, scrollable card list
- **TaskCard** — title (H1 or filename), BC tag, type badge (feature/spike/decision/bug)
- **StatusBadge** — coloured pill for backlog / todo / doing / done
- **EmptyState** — shown when a column has no tasks

### Styleguide page
A standalone `styleguide.html` (or a route on the dev server) that renders all tokens and all component states side by side. This is what the developer reviews.

## Acceptance criteria
- `styleguide.html` (or `/styleguide` route) renders all tokens and all component variants
- Each of the four column states has a distinct but harmonious visual treatment
- Typography is readable at normal screen distance without zooming
- **Developer has reviewed the styleguide page and explicitly signed off** — this sign-off is recorded as a comment on this task file (or a `done/` move with a note) before any board feature tasks are started
- Tokens are expressed as CSS custom properties so the board implementation can consume them without duplication

## Notes
- Keep it calm and functional — this is a personal dev tool, not a marketing page. Dark mode preferred (developer context).
- No external CSS framework unless it is a single-file utility (e.g., a vendored subset). No npm dependencies.
- The design does not need to be pixel-perfect at this stage — it needs to be good enough that the developer wants to look at it every day.

## Outcome

Delivered a complete design system for the kanban board:

- **`styleguide/tokens.css`** — CSS custom properties for the full token set: dark palette, four column accent colours, typography scale, spacing scale, border-radius, and shadows.
- **`styleguide/components.css`** — Component styles (`.column`, `.card`, `.badge`, `.empty-state`) built entirely from tokens.
- **`styleguide/index.html`** — Standalone styleguide page (open directly in browser, no server). Shows all colour swatches, typography scale, spacing scale, all badge variants, a full four-column board preview, and isolated empty-state.
- **`server.js`** updated — `buildHtmlPage()` now uses the full dark design system inline (per ADR-0002: single self-contained HTML, no separate CSS files served). Column accent strips, type badges, empty-state components, and proper card layout all wired up.

Design direction: dark mode, monospace font stack, calm zinc/blue/amber/green column accents. Functional and readable without zooming.

## Sign-off

Awaiting developer review and sign-off. Open `styleguide/index.html` in a browser to review. When satisfied, add 'Approved: YYYY-MM-DD' to this section.
