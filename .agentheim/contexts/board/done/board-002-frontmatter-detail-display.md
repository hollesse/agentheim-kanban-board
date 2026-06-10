---
id: board-002
title: Structured frontmatter display on detail page
status: done
type: feature
context: board
created: 2026-06-10
completed: 2026-06-10
commit: 663a439
commit:
depends_on: [board-001]
blocks: []
tags: [ui, detail, frontmatter]
related_adrs: ["0002"]
related_research: []
prior_art: []
---

## Why
Die Detailseite zeigt nach board-001 nur den Markdown-Body. Frontmatter-Felder wie Typ, Status, BC, depends_on und Datum sind für den Nutzer aber genau so wichtig — sie geben sofortigen Kontext über den Task.

## What
Auf der Task-Detailseite wird oberhalb des Markdown-Bodys ein strukturierter Metadaten-Bereich ergänzt, der die wichtigsten Frontmatter-Felder visuell aufbereitet darstellt.

## Acceptance criteria
- [ ] Die Detailseite zeigt folgende Felder strukturiert an: `type`, `status`, `context` (BC), `depends_on` (als Liste), `created`, `completed` (falls vorhanden)
- [ ] `status` wird als farbiges Badge dargestellt (nutzt die Status-Badge-Komponente aus dem Design System)
- [ ] `type` wird als Badge dargestellt (feature / bug / spike / decision / chore / refactor)
- [ ] `depends_on`-Einträge sind als klickbare Links zu den jeweiligen Detail-Seiten gerendert
- [ ] Leere / nicht gesetzte Felder werden nicht angezeigt
- [ ] Der Metadaten-Bereich nutzt die Design-System-Tokens und ist visuell klar vom Body-Text getrennt

## Outcome
`buildDetailPage` in `server.js` now renders a `.detail-meta` section between the title header and the markdown body. The section shows type (`.badge`), status (`.status-badge--<lane>`), context, depends_on as clickable `/task/<id>` links, created, and completed. Empty/absent fields are suppressed. New helpers `parseDependsOn` and `buildMetaSection` were added. CSS for `.status-badge`, `.badge--chore`, `.badge--refactor`, and `.detail-meta*` was added inline.

## Notes
- Baut direkt auf board-001 auf — die Route und das grundlegende Seiten-Layout existieren bereits.
- Die Frontmatter-Felder werden bereits durch den bestehenden `parseFrontmatter()`-Parser in `server.js` gelesen — kein neuer Parser nötig.
- `depends_on` enthält Task-IDs (z. B. `design-system-001`). Die Links führen zu `/task/<id>`.
