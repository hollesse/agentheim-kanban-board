---
id: plugin-001
title: "Project README — what it is, how to install and update"
status: done
type: chore
context: plugin
created: 2026-06-10
completed: 2026-06-10
commit:
depends_on: [infrastructure-003]
blocks: []
tags: [documentation, readme, install]
related_adrs: []
related_research: []
prior_art: []
---

## Why
Nutzer, die das Plugin per `claude plugin add` installieren wollen, brauchen eine verständliche Anleitung. Ohne README ist der Zweck des Repos nicht sofort erkennbar.

## What
Eine `README.md` im Projekt-Root, die das Plugin erklärt und die wichtigsten Nutzungsszenarien abdeckt.

## Acceptance criteria
- [ ] `README.md` existiert im Projekt-Root
- [ ] Erklärt in 2-3 Sätzen was das Plugin ist und welches Problem es löst
- [ ] Listet Voraussetzungen auf (Claude Code, Agentheim)
- [ ] Erklärt Installation: `claude plugin add <repo-url>`
- [ ] Erklärt die vier Skills: `/kanban-start`, `/kanban-stop`, `/kanban-open`, `/kanban-status` mit je einem Satz
- [ ] Erklärt Update: `claude plugin update agentheim-kanban-board`
- [ ] Erwähnt dass der Server `.agentheim/` im aktuellen Projektverzeichnis liest (kein globaler State)
- [ ] Sprache: Englisch

## Outcome

`README.md` created at project root. Covers what the plugin does, prerequisites, installation with `claude plugin add`, all four skills, the update command, and a note that the server reads from the current project's `.agentheim/` directory. No emojis, no badges, GitHub-flavored markdown.

## Notes
- Kein langer Text — prägnant und scanbar
- Kein Code-Tutorial — es gibt nichts zu konfigurieren
- Die README hängt von infrastructure-003 ab, damit die Versionsnummer 1.0.0 bereits im Dokument korrekt genannt werden kann
