# Design System

## Purpose
Defines the visual language for the board UI: colour tokens, typography, spacing scale, and the small set of components the board needs (card, column, badge). All frontend work in other BCs must be gated on the styleguide task in this context being completed and signed off by the developer.

## Classification
Supporting — frontend infrastructure.

## Actors
- **Developer** — reviews and approves the design system before any UI is built

## Ubiquitous language
- **Token** — a named design value (colour, spacing, radius, font size) that components reference
- **Component** — a reusable visual building block (e.g., TaskCard, Column, StatusBadge)
- **Styleguide** — the human-reviewable document or page showing all tokens and components in context

## Aggregates
None at this stage.

## Key events
- `StyleguideApproved` — developer has reviewed and signed off; frontend work in other BCs may begin

## Key commands
None at this stage.

## Relationships with other contexts
- **Upstream of:** board — board's frontend conforms to design-system tokens and components

## Open questions
- Minimal hand-crafted CSS, or a small utility-first framework (e.g., Tailwind)?
