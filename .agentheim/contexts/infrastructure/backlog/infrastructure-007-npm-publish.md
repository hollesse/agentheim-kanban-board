---
id: infrastructure-007
title: "First npm publish: ship agentheim-kanban-board to the registry"
status: backlog
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
prior_art: [infrastructure-006]
---

## Why
[[infrastructure-006]] hat die Voraussetzungen gelegt: `package.json` mit `bin: { kanban }` und leeren Runtime-Dependencies. Heute ist die einzige Install-Option für CLI-User aber `git clone && npm link` — das ist okay für den Entwickler selbst, aber jeder andere Terminal-User muss das Repo klonen.

Mit `npm publish` wird `npm install -g agentheim-kanban-board` der offizielle Install-Pfad. Das macht die CLI als Terminal-Convenience für Außenstehende benutzbar und gibt den Skills (über den Hybrid-Dispatch aus [[plugin-002]]) automatisch die PATH-Variante zum Auswählen.

## What
Erstmaliges Veröffentlichen des Packages `agentheim-kanban-board` auf der npm-Registry. Sobald draußen, ist `npm install -g agentheim-kanban-board` der dokumentierte Pfad.

Mit dabei: der minimale Tarball-Scope (nur was die CLI tatsächlich braucht, kein Plugin-Innenleben), eine README-Aktualisierung, und eine kurze Notiz/ADR zur Versions-Koordination zwischen `package.json` und `.claude-plugin/plugin.json`.

## Acceptance criteria
- [ ] Package `agentheim-kanban-board` ist live auf npmjs.com, Version-Match mit dem aktuellen `package.json`
- [ ] `npm install -g agentheim-kanban-board` auf einer sauberen Maschine (oder via `npx -p agentheim-kanban-board kanban --version`) installiert die CLI und macht `kanban --version` aufrufbar
- [ ] **Tarball-Scope sauber:** ausschließlich `server.js`, `lib/`, `bin/`, `package.json`, `README.md`, `LICENSE` werden veröffentlicht. **Nicht** in der Tarball: `.agentheim/`, `skills/`, `.claude-plugin/`, `styleguide/`, `.gitignore`, andere Repo-internals
- [ ] Project-root README erklärt beide Install-Pfade nebeneinander: (a) als Claude-Code-Plugin via `claude plugins install` und (b) als Standalone-CLI via `npm install -g agentheim-kanban-board`
- [ ] Versions-Koordination dokumentiert: `package.json` und `.claude-plugin/plugin.json` halten denselben Versions-String; eine kurze Doku (README-Abschnitt oder ADR) sagt, dass Version-Bumps beide Dateien zusammen ändern
- [ ] Post-publish-Smoke: `kanban status` aus einem Agentheim-Test-Projekt — funktioniert identisch zum lokalen `npm link`-Setup

## Notes

### Refinement-bedürftig (Entscheidungen vor Implementierung)

1. **Tarball-Inhalt: `files` vs. `.npmignore`.** Sauberer Weg ist ein `files: [...]`-Array in `package.json` (allow-list, weniger fehleranfällig als deny-list). Welche Pfade exakt: `server.js`, `lib/**`, `bin/**`, `LICENSE`, `README.md` — `package.json` selbst landet automatisch in der Tarball, muss nicht aufgelistet werden. Vor dem Publish `npm pack --dry-run` laufen lassen und das Manifest verifizieren.

2. **Versions-Koordination.** `package.json` und `.claude-plugin/plugin.json` haben heute beide `1.0.0`. Variants:
   - **A: Hand-koordiniert** — Doku im README/CONTRIBUTING-Stil, "wenn du eine bumpst, bump die andere". Einfach, fehleranfällig.
   - **B: Skript** — `npm version` läuft normalerweise nur über `package.json`; ein `version`-Lifecycle-Hook könnte `plugin.json` ebenfalls patchen. Weniger fehleranfällig, aber neue Bauteil.
   - **C: ADR statt Code** — als Konvention dokumentieren, kein Mechanismus. Defer Automatisierung bis zur ersten echten Diskrepanz.
   - Vermutlich C zunächst, dann B falls's mal schief geht.

3. **npm-Account / Auth-Setup.** Vor dem Publish:
   - npm-Account muss existieren (joshuatopfer's npmjs-Login)
   - 2FA wahrscheinlich aktiv → Auth-Strategie für `npm publish`: interaktiv (OTP-Prompt) reicht für ein One-Shot, ein CI-Token wäre Overkill bei diesem Volumen
   - Package-Name-Verfügbarkeit auf npmjs.com prüfen: `npm view agentheim-kanban-board` — wenn 404, ist der Name frei
   - Falls nicht frei: Fallback auf Scope `@joshuatopfer/agentheim-kanban-board` (vom ursprünglichen Refinement diskutiert, vom User aber bewusst gegen "unscoped" eingetauscht — würde dann nochmal in `package.json` rein)

4. **Veröffentlichungs-Strategie.** Initial-Release ist `1.0.0` (bereits in `package.json`). Sollten zukünftige Releases vorab via `npm publish --tag next` getestet werden, oder direkt auf `latest`? Für ein Single-User-Hobby-Tool ist das vermutlich Overkill — direkt `latest`, semver bei Breaking Changes ernst nehmen, fertig.

5. **README-Update Umfang.** Aktuell beschreibt der Root-README die Plugin-Install-Variante (`claude plugins install`) und die CLI nur via `npm link`. Nach Publish: zweiter Install-Pfad gleichberechtigt erwähnen, alten `npm link`-Block für "from source" behalten (für Entwickler des Plugins selbst).

### Out of scope
- **Automated releases / GitHub Actions** — manueller `npm publish` aus dem lokalen Setup reicht für jetzt
- **Pre-Release-Channels** (`@next`, `@beta`) — keine Notwendigkeit
- **Code-Signing / Provenance Statements** — nice-to-have, nicht jetzt
- **Wechsel auf scoped Package** — nur falls Name nicht frei ist (Fallback)

### Relationen
- **Tangiert:** ADR-0005 (Zero-Install-Posture) bleibt für Plugin-User intakt; npm publish ändert nur die Terminal-Install-Erfahrung. ADR-0008 bleibt aktuell.
- **Querbezug zu plugin-002:** der Hybrid-Dispatch in den Skills greift automatisch auf die globale Variante, sobald jemand `npm i -g` macht. Keine Skill-Änderung nötig.
- **Potenzieller Folge-Task:** falls die Versions-Sync-Konvention manuell schiefläuft, eigene Task für ein `version`-Hook-Skript.
