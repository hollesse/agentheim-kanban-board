---
id: infrastructure-008
title: "Tag-triggered npm publish via GitHub Actions (OIDC trusted publishing)"
status: doing
type: feature
context: infrastructure
created: 2026-06-19
completed:
commit:
depends_on: [infrastructure-007]
blocks: []
tags: [ci, github-actions, npm, publish, oidc, release-pipeline]
related_adrs: [0008]
related_research: []
prior_art: [infrastructure-007]
---

## Why
Sobald [[infrastructure-007]] den ersten manuellen Publish durchgezogen hat, soll jeder weitere Release **nicht** mehr von Hand laufen. Die Doku-only Versions-Sync-Konvention aus ADR-0009 ist fehleranfällig, manuelles `npm publish` mit 2FA-OTP ist Friction bei jedem Bump, und ohne CI bekommen wir auch keine Provenance-Attestation auf die Tarball.

Ziel: `git push v1.2.3` → GitHub Action verifiziert + publiziert → Package live, npm-Provenance dran, kein lokales Token nötig.

## What
Ein GitHub-Actions-Workflow, der bei Push eines Tags `v*` automatisch:
1. Repo auscheckt
2. Node 18+ setup mit npm-Registry-URL
3. Verifiziert: `package.json#version` matched den Tag (ohne `v`-Prefix) und matched `.claude-plugin/plugin.json#version`
4. `npm pack --dry-run` als Gate gegen ungeplante Pfade
5. `npm publish` mit `--provenance` über npm Trusted Publishing (OIDC) — kein Token-Secret nötig

Pre-condition: Trusted Publisher auf npmjs.com einmalig konfiguriert (`https://www.npmjs.com/package/agentheim-kanban-board/access` → Manage trusted publishers → GitHub Actions: owner `hollesse`, repo `agentheim-kanban-board`, workflow filename, environment leer).

## Acceptance criteria
- [ ] `.github/workflows/publish.yml` existiert, triggert auf `push` mit `tags: ['v*']`
- [ ] Workflow hat `permissions: { id-token: write, contents: read }` (OIDC für npm + read für checkout)
- [ ] Workflow-Schritte in dieser Reihenfolge: checkout → setup-node (mit `registry-url: https://registry.npmjs.org`) → version-match-check (tag vs `package.json` vs `.claude-plugin/plugin.json`) → `npm pack --dry-run` → `npm publish --provenance --access public`
- [ ] Trusted Publisher auf npmjs.com ist konfiguriert (manueller Setup-Schritt — Worker dokumentiert die Klicks im Task-Outcome)
- [ ] **Smoke**: Test-Tag `v1.0.1-test` (oder ein bewusster Patch-Bump) gepusht → Action grün → Package-Version live auf npm → Provenance-Badge auf der npmjs.com-Package-Seite sichtbar
- [ ] README erwähnt den Release-Prozess in einem `## Releasing` Abschnitt: "Bump version in beiden Dateien, commit, `git tag -a v… && git push --tags` — Action erledigt den Rest"
- [ ] ADR-0009 (vom Worker -007 geschrieben) bekommt eine Erweiterung: "Versions-Sync wird ab jetzt im CI-Schritt verifiziert (siehe infrastructure-008)" — oder ein eigener ADR-0010, je nachdem wie der Worker das einschätzt

## Notes

### Pre-flight / Pre-conditions vor Worker-Start
1. **[[infrastructure-007]] ist done und Package ist live auf npm.** Trusted Publishing kann auf npmjs.com nur konfiguriert werden, wenn das Package existiert.
2. **Repo-Visibility:** GitHub-Repo ist public (oder hat einen entsprechenden Plan), sonst funktioniert OIDC nicht.
3. **Branch-Protection:** falls `main` geschützt ist — kein Blocker, weil der Workflow auf Tag triggert, nicht auf Branch-Push. Aber dokumentieren, dass Tag-Push selbst gerne aus einem PR-Merge-Commit erfolgen darf.

### Worker execution outline

1. Workflow-Datei `.github/workflows/publish.yml` schreiben.
2. Lokale Sanity: `act` (falls installiert) oder visuell — der Worker führt den Workflow nicht selbst aus.
3. Auf npmjs.com Trusted-Publisher-Eintrag erstellen (Worker beschreibt die genauen Klicks im Task-Outcome; falls der Worker keinen Browser-Zugang hat → eskaliert an User mit klarer Anleitung).
4. README ergänzen.
5. ADR-Update / -Neuschrift nach Bedarf.
6. Commit + PR oder direkter Push auf main.
7. **Smoke-Release:** Patch-Version (`1.0.0` → `1.0.1`) in beiden JSONs bumpen, commit, `git tag -a v1.0.1`, push. Action sollte grün laufen.
8. npmjs.com-Package-Seite prüfen — Version `1.0.1` ist live, Provenance-Badge angezeigt.

### Warum OIDC und nicht NPM_TOKEN
- **Kein Secret-Rotation-Aufwand** — OIDC-Token sind kurzlebig und werden pro Run frisch ausgestellt
- **Provenance-Attestation gratis** — `npm publish --provenance` signiert die Tarball mit dem GitHub-Build-Kontext (Commit-SHA, Workflow-File, Runner). Konsumenten können das verifizieren.
- **Kein Account-Recovery-Risiko** — kein Token, das geklaut werden kann
- **2FA bleibt für interaktive Publishes erforderlich** — d. h. falls jemand jemals `npm publish` von Hand macht, muss er trotzdem OTP-bestätigen. OIDC-Pfad ist der CI-Pfad.

### Out of scope
- **Release-Notes / Changelog-Auto-Generierung** — separat
- **Pre-Release-Channels** (`@beta`, `@next` Tags) — separat
- **Rollback-Mechanismus** — npm-Unpublish-Window ist eh nur 72h; manuell ausreichend
- **Multi-Package-Monorepo-Publish** — wir haben ein Package
- **Andere Trigger** (z. B. `release: published`) — wir bleiben bei Tag-Push als kanonischem Signal

### Relationen
- **[[infrastructure-007]]** — strict prerequisite (Package muss existieren für OIDC-Config)
- **ADR-0008** (`package.json` mit bin) — bleibt; -008 ändert nichts daran
- **ADR-0009** (Versions-Sync-Konvention) — der Action-Workflow *verifiziert* die Konvention im CI; die Konvention selbst bleibt manuell beim Editor. Ggf. ADR-0009-Erweiterung statt neuem ADR.
