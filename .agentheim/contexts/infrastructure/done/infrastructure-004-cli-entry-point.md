---
id: infrastructure-004
title: "CLI entry point: invoke kanban skills from the command line"
status: done
type: feature
context: infrastructure
created: 2026-06-19
completed: 2026-06-19
commit: 7387288
depends_on: [infrastructure-005, infrastructure-006, plugin-002]
blocks: []
tags: [cli, packaging, distribution, lifecycle, tracker]
related_adrs: [0003, 0005]
related_research: []
prior_art: []
---

## Why
Die vier Skills (`/kanban-start`, `/kanban-stop`, `/kanban-status`, `/kanban-open`) sind heute nur aus Claude Code heraus erreichbar. Der Entwickler will dieselben Lifecycle-Operationen auch aus dem normalen Terminal aufrufen können — scriptbar, kombinierbar, ohne Claude-Session.

## Status: refined & decomposed

Diese Task wurde am 2026-06-19 in drei konkrete Sub-Tasks zerlegt:

| Task | Status | Rolle |
|---|---|---|
| [[infrastructure-005]] — Extract lifecycle module (`lib/lifecycle.js`) | todo | Lifecycle-Logik aus den SKILL.md-Bash-Snippets in ein Node-Modul ziehen; Cross-Platform-Browser-Open einbauen |
| [[infrastructure-006]] — CLI binary `kanban` with package.json + bin entry | backlog (depends on -005) | Dünner Wrapper, der das Modul als `kanban`-Binary verfügbar macht; `package.json` mit leeren Deps, ADR-0005 wird durch ADR-0008 ergänzt |
| [[plugin-002]] — Migrate skills to call CLI dispatcher | backlog (depends on -005 + -006) | Skill-Bodies auf eine Zeile `node $PLUGIN_ROOT/bin/kanban.js <cmd>` reduzieren — eine Quelle der Wahrheit für Lifecycle |

## Decisions made (during refinement)

- **Packaging:** `package.json` einführen mit `dependencies: {}`. Ergänzt ADR-0005 (kein Supersede): zero-install für Plugin-Nutzer bleibt erhalten, weil leere Deps keinen Install-Schritt triggern. CLI-Surface ist opt-in.
- **Code-Sharing:** Skills delegieren an die CLI-Binary, statt eigenständig Bash zu shellen. Eine Quelle der Wahrheit, garantiert symmetrisches Verhalten.
- **Binary-Name:** `kanban` (kurz, kein Konflikt-Risiko für einen Single-User-Use-Case).
- **npm-Package-Name:** `agentheim-kanban-board` (unscoped, vom Nutzer bestätigt).
- **Cross-Platform-Open:** im Lifecycle-Modul über `process.platform` (`open` / `xdg-open` / `start`).
- **Publish-Scope:** vorerst nur `npm link`-ready; tatsächliches `npm publish` separate Entscheidung.

## ADRs to write while implementing
- **ADR-0006** (mit [[infrastructure-006]]): CLI as second delivery surface alongside plugin skills — Scope: global
- **ADR-0007** (mit [[infrastructure-005]]): Lifecycle module location and contract — Scope: global
- **ADR-0008** (mit [[infrastructure-006]]): Packaging — package.json with bin, zero runtime deps — Scope: global; `amends: [0005]`

## Tracking
Diese Task wird geschlossen, wenn alle drei Sub-Tasks done sind und alle drei ADRs geschrieben sind. Sie hält nicht selbst Akzeptanzkriterien — diese leben in den Sub-Tasks.
