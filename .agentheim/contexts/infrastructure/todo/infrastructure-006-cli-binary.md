---
id: infrastructure-006
title: "CLI binary `kanban` with package.json + bin entry"
status: todo
type: feature
context: infrastructure
created: 2026-06-19
completed:
commit:
depends_on: [infrastructure-005]
blocks: [plugin-002]
tags: [cli, packaging, distribution]
related_adrs: [0005]
related_research: []
prior_art: []
---

## Why
Der Entwickler will die Kanban-Lifecycle-Operationen auch außerhalb von Claude Code aus dem Terminal aufrufen. Sobald [[infrastructure-005]] die Lifecycle-Logik in `lib/lifecycle.js` extrahiert hat, braucht es nur noch einen dünnen Binary-Wrapper, der CLI-Args parst und in das Modul ruft.

## What
- Neues `package.json` im Projekt-Root mit:
  - `name`: `agentheim-kanban-board`
  - `bin`: `{ "kanban": "./bin/kanban.js" }`
  - `dependencies`: `{}` (keine Runtime-Dependencies — ADR-0005's Kernforderung bleibt erhalten)
  - `engines.node`: erlaubte Mindestversion (z. B. `>=18`)
- Neues `bin/kanban.js` mit Shebang `#!/usr/bin/env node`:
  - Parst Subkommando aus `process.argv` (`start | stop | status | open | help | --version`)
  - Dispatcht an die entsprechende Funktion in `lib/lifecycle.js`
  - Setzt aussagekräftige Exit-Codes: `status` → 0 wenn läuft / 1 wenn nicht; alle anderen → 0 ok / 1 Fehler
  - Schreibt Nutzer-feedback auf stdout, Fehler auf stderr
- README im Projekt-Root um Installations- und Nutzungs-Abschnitt für die CLI ergänzen (`npm install -g .` oder via Git-Clone + `npm link` für jetzt; spätere Veröffentlichung auf npm ist out of scope)

## Acceptance criteria
- [ ] `package.json` existiert mit `bin: { "kanban": "./bin/kanban.js" }` und leerer `dependencies`
- [ ] `bin/kanban.js` ist ausführbar (Shebang + `chmod +x`) und reagiert auf `start | stop | status | open | --help | --version`
- [ ] `npm link` (lokal) macht `kanban` global verfügbar; `kanban status` in einem Agentheim-Projekt-Verzeichnis liefert sinnvollen Output
- [ ] `kanban start` startet identisch zum heutigen `/kanban-start` Skill: gleicher Lock, gleicher Port-Algorithmus, gleiches Browser-Open
- [ ] `kanban stop` beendet einen Server, der via Skill *oder* CLI gestartet wurde (Symmetrie verifiziert)
- [ ] `kanban status` Exit-Code: 0 = läuft, 1 = nicht läuft
- [ ] README erklärt Installation (`npm link` Workflow), die vier Subkommandos, und einen Hinweis dass CLI und Slash-Commands denselben Server teilen
- [ ] Plugin-User ohne CLI-Interesse müssen weiterhin nichts installieren — `package.json` mit leeren Deps bricht ADR-0005 nicht (siehe ADR-0008)

## Notes

### Out of scope
- Tatsächliches `npm publish` — passiert separat. Diese Task endet mit "publish-ready" (lokal via `npm link` testbar).
- Test-Framework / automatisierte Tests — kommt eventuell später.
- Brew-Tap / Curl-Installer / Windows-Installer.

### ADR-Pflicht beim Implementieren
1. **ADR-0006 — "CLI as second delivery surface alongside plugin skills"** (Scope: global) — fixiert, dass CLI und Plugin-Skills gleichwertige Surfaces sind, beide auf `lib/lifecycle.js` aufsetzen, Skill-Bodies künftig zum CLI delegieren ([[plugin-002]]).
2. **ADR-0008 — "Packaging: package.json with bin, zero runtime deps"** (Scope: global) — dokumentiert das `package.json` und **ergänzt** ADR-0005 (`amends: [0005]`, kein Supersede): zero-install bleibt für Plugin-Nutzer erhalten, weil `dependencies: {}` keinen Install-Schritt triggert. ADR-0005 erhält im Gegenzug `amended_by: [0008]` (vom Worker zu setzen).

### Naming-Entscheidung (vom Nutzer bestätigt)
- npm-Package-Name: `agentheim-kanban-board` (unscoped)
- Binary-Name: `kanban` (kurz, kein Konflikt-Risiko für den Single-User-Use-Case; falls je kollidierend, später `bin: { kanban, agentheim-kanban }` als Migration)
