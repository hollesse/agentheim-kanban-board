---
id: board-001
title: Task detail page
status: done
type: feature
context: board
created: 2026-06-10
completed: 2026-06-10
commit: 85ebac1
commit:
depends_on: [design-system-001]
blocks: [board-002]
tags: [ui, routing, detail]
related_adrs: ["0001", "0002", "0005"]
related_research: []
prior_art: []
---

## Why
Der Nutzer möchte den vollen Inhalt eines Tasks lesen, ohne die Markdown-Datei manuell zu öffnen. Ein Klick auf eine Karte soll zur Detailansicht führen.

## What
Jede Task-Karte auf dem Board wird klickbar. Ein Klick navigiert zu einer neuen Route `/task/<task-id>`, die den Inhalt der zugehörigen Markdown-Datei als lesbare HTML-Seite rendert. Eine Zurück-Navigation führt zum Board.

## Acceptance criteria
- [ ] Jede Task-Karte auf dem Board (`GET /`) ist als Link zu `/task/<task-id>` gerendert
- [ ] `GET /task/<task-id>` liefert HTTP 200 mit einer HTML-Seite
- [ ] Die Seite zeigt den Markdown-Body des Tasks (ohne Frontmatter) lesbar gerendert
- [ ] Mindestens Headings (`#`, `##`, `###`), Listen (`-`, `*`) und Fettschrift (`**`) werden korrekt dargestellt
- [ ] Es gibt eine "← Zurück zum Board"-Navigation
- [ ] Die Seite nutzt die Design-System-Tokens (Farben, Typografie, Spacing)
- [ ] Bei unbekannter `task-id` wird HTTP 404 zurückgegeben

## Notes
- Kein Markdown-Parser als npm-Dependency (ADR-0005). Eine regex-basierte Minimalkonvertierung für Headings, Listen und Bold reicht für v1.
- Server-Route wird in `server.js` ergänzt — kein separates Framework nötig (ADR-0001).
- Die Task-ID in der URL entspricht dem `id`-Feld im Frontmatter (z. B. `board-001`). Der Server muss alle Contexts durchsuchen, um die passende Datei zu finden.
- Die HTML-Seite ist weiterhin server-seitig gerendert — kein clientseitiges JS für das Routing (ADR-0002).

## Outcome

Added `findTaskById(id)`, `mdToHtml(text)`, `applyInline(text)`, and `buildDetailPage(task)` to `server.js`. Task cards on the board (`GET /`) are now `<a class="card" href="/task/<id>">` links. `GET /task/:id` scans all context/lane directories, renders the Markdown body with heading/list/bold/checkbox support, and returns a styled detail page using the design system tokens. Unknown IDs return HTTP 404. Key file: `/Users/joshuatopfer/Documents/Projekte/Privat/agentheim-kanban-board/server.js`.
