---
id: infrastructure-007
title: "First npm publish: ship agentheim-kanban-board to the registry"
status: todo
type: feature
context: infrastructure
created: 2026-06-19
completed:
commit:
depends_on: []
blocks: []
tags: [npm, publish, distribution, packaging, release]
related_adrs: [0005, 0008]
related_research: []
prior_art: [infrastructure-006, infrastructure-003]
---

## Why
[[infrastructure-006]] hat die Voraussetzungen gelegt: `package.json` mit `bin: { kanban }` und leeren Runtime-Dependencies. Heute ist die einzige Install-Option für CLI-User aber `git clone && npm link` — das ist okay für den Entwickler selbst, aber jeder andere Terminal-User muss das Repo klonen.

Mit `npm publish` wird `npm install -g agentheim-kanban-board` der offizielle Install-Pfad. Das macht die CLI als Terminal-Convenience für Außenstehende benutzbar und gibt den Skills (über den Hybrid-Dispatch aus [[plugin-002]]) automatisch die PATH-Variante zum Auswählen.

## What
Erstmaliges Veröffentlichen des Packages `agentheim-kanban-board` auf der npm-Registry, Version `1.0.0`.

**Refinement-Entscheidungen** (vom architect bestätigt, 2026-06-19):

1. **Tarball-Scope:** `files`-Allowlist in `package.json` — sicherer als `.npmignore`-Denylist; verhindert ungewollt veröffentlichtes `.agentheim/`-Innenleben.
2. **Versions-Koordination:** Manuelle Konvention via ADR (Variante C). `package.json#version` und `.claude-plugin/plugin.json#version` werden zusammen gebumpt. Kein npm-version-Hook — bei dieser Release-Cadence Overkill.
3. **Auth:** Interaktives 2FA-OTP beim `npm publish`. Pre-flight `npm whoami` + `npm view agentheim-kanban-board`. Falls Name belegt: Fallback auf `@hollesse/agentheim-kanban-board` mit `--access public`.
4. **Channel:** Direkt nach `latest`, kein `next`/`beta`-Kanal. Mitigation gegen Bad-Publish: `npm pack --dry-run`-Gate + Smoke-Install auf einer sauberen Shell vor dem eigentlichen Publish.
5. **README:** Bestehende CLI-Sektion umstrukturieren — `npm install -g` als primärer Pfad, `git clone && npm link` als "from source"-Variante daneben.

**Zusätzlich:**
- `prepublishOnly`-Script in `package.json`: `node bin/kanban.js --version` als Last-Mile-Sanity-Check.
- `repository` / `bugs` / `homepage`-Felder mit ergänzen (zeigen auf `https://github.com/hollesse/agentheim-kanban-board`).

## Acceptance criteria
- [ ] `package.json` hat `"files": ["server.js", "lib/", "bin/", "LICENSE", "README.md"]`, `repository` / `bugs` / `homepage` auf `https://github.com/hollesse/agentheim-kanban-board`, und `"scripts": { "prepublishOnly": "node bin/kanban.js --version" }`
- [ ] `npm pack --dry-run` enthält exakt: `package.json`, `README.md`, `LICENSE`, `server.js`, `lib/lifecycle.js`, `bin/kanban.js` — und **nichts** aus `.agentheim/`, `skills/`, `.claude-plugin/`, `styleguide/`, `marketplace.json`, `.gitignore`
- [ ] `npm view agentheim-kanban-board` ist vor dem Publish ausgeführt; das Ergebnis (Name frei → unscoped; Name belegt → scoped `@hollesse/agentheim-kanban-board` mit `--access public`) ist in der Commit-Message dokumentiert
- [ ] Package ist live auf npmjs.com, Version `1.0.0` (matched `package.json` und `.claude-plugin/plugin.json`)
- [ ] `npx -p agentheim-kanban-board kanban --version` auf einer sauberen Shell liefert `1.0.0`
- [ ] `kanban status` aus einem Test-Agentheim-Projekt verhält sich identisch zum `npm link`-Setup
- [ ] Root-README "CLI"-Sektion: führt `npm install -g agentheim-kanban-board` als primären Pfad auf; `git clone && npm link` bleibt als "Install from source" daneben erhalten
- [ ] ADR-0009 ("Version synchronisation between package.json and plugin.json") geschrieben, dokumentiert die manuelle Sync-Konvention, ~15 Zeilen
- [ ] Git-Tag `v1.0.0` lokal angelegt und nach Erfolg gepusht (`git push --tags`)

## Notes

### Worker execution outline (in dieser Reihenfolge)

1. **Pre-flight:** `npm whoami` (Auth-Check — bei Fehler stoppt der Worker und eskaliert), `npm view agentheim-kanban-board` (Name-Verfügbarkeit; 404 = frei).
2. **`package.json` editieren:** `files`, `repository`, `bugs`, `homepage`, `scripts.prepublishOnly` ergänzen. `version`-Match mit `.claude-plugin/plugin.json` verifizieren (beide `1.0.0`).
3. **Trockenlauf:** `npm pack --dry-run` — Output gegen erwartete Datei-Liste diffen. **Abort** falls etwas Unerwartetes drin ist.
4. **README update:** Bestehende `## CLI (alternative to slash commands)` Sektion umstrukturieren. `### Install (npm, recommended)` mit `npm install -g agentheim-kanban-board` vorne, dann `### Install from source` mit dem heutigen `git clone && npm link` Block.
5. **ADR-0009 schreiben:** `.agentheim/knowledge/decisions/0009-version-sync.md`, scope: global, related_tasks: [infrastructure-007]. Entscheidung: manuelle Konvention, beide Files zusammen bumpen, ggf. später automatisieren wenn Fehler auftreten.
6. **Commit:** `feat(infrastructure): prepare npm publish — files allowlist, metadata, README, ADR-0009 [infrastructure-007]`.
7. **Publish:** `npm publish` (interactive OTP). Falls Name belegt: `package.json` auf `@hollesse/agentheim-kanban-board` umbenennen, Schritt 3 wiederholen, `npm publish --access public`. ADR-0008 dann um `amended_by` für die Name-Korrektur erweitern (eine Zeile).
8. **Post-publish-Smoke:** in einer sauberen Shell (z. B. `cd /tmp && mkdir test && cd test`) — `npm install -g agentheim-kanban-board` (oder den scoped Namen), `kanban --version`, dann `mkdir -p .agentheim/contexts/test/todo && touch .agentheim/contexts/test/todo/test-001.md && kanban status` — sollte sinnvoll antworten.
9. **Tag:** `git tag -a v1.0.0 -m "Release v1.0.0 — first npm publish" && git push --tags`.
10. **Task schließen:** Commit-Message ergänzt um Publish-URL und Tarball-SHA aus `npm publish`-Output.

### Eskalations-Bedingungen (Worker stoppt und bounced/escalated)

- `npm whoami` schlägt fehl → User muss `npm login` machen
- `npm pack --dry-run` enthält Pfade, die nicht in der Allowlist sind → Worker bricht ab, meldet die Drift
- `npm publish` schlägt aus anderem Grund als "name taken" fehl → Worker eskaliert
- Post-publish-Smoke (Schritt 8) liefert nicht `1.0.0` → Worker rollt nicht zurück (das wäre `npm unpublish`, was npm in den ersten 72h nur eingeschränkt erlaubt), sondern dokumentiert das Problem und eskaliert

### Out of scope
- **GitHub Actions / Automated Releases** — manueller Publish reicht
- **Pre-Release-Channels** (`@next`, `@beta`)
- **Code-Signing / Provenance-Statements** — npm-Provenance über GitHub OIDC wäre nice, aber nicht jetzt
- **Automatisierter Versions-Sync** — Variante B (npm-version-Hook) bleibt für später, falls die manuelle Konvention schiefläuft
- **CHANGELOG.md** — existiert noch nicht; aufnehmen sobald's das Dokument gibt

### Relationen
- **ADR-0005** (Zero-Install-Posture) bleibt intakt — der npm-Publish verändert nur die Terminal-Install-Erfahrung; Plugin-User sehen keinen Unterschied
- **ADR-0008** (package.json mit bin) wird ggf. um eine `amended_by`-Notiz erweitert, falls der scoped-Name-Fallback greift
- **ADR-0009 neu** dokumentiert die `package.json`↔`plugin.json`-Versions-Konvention
- **plugin-002 Hybrid-Dispatch** ist transparent vorbereitet — sobald ein User `npm install -g` macht, übernimmt automatisch die globale Variante
