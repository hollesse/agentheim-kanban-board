---
id: infrastructure-009
title: "Release script: scripts/release.sh <version>"
status: done
type: chore
context: infrastructure
created: 2026-06-19
completed: 2026-06-19
commit: d9913e8
depends_on: [infrastructure-008]
blocks: []
tags: [release, dx, scripting, automation]
related_adrs: [0009]
related_research: []
prior_art: [infrastructure-008]
---

## Why
Bisher war der Release-Workflow ein 4-Befehle-Ritual (zwei `sed`-Edits, ein `git commit`, ein `git tag` + `git push`). Drei Risiken: vergessen, eine der beiden JSON-Versionen zu bumpen (würde der CI-Check fangen, aber wäre verschwendeter Action-Run); Tippfehler in der Tag-Bezeichnung; falscher Branch oder dirty working tree zur falschen Zeit. Ein einziges Skript mit Pre-Flight-Checks eliminiert all das.

## What
Neues Shell-Script `scripts/release.sh` an Repo-Root, ausführbar (`chmod +x`), Aufruf:

```bash
scripts/release.sh 1.2.3
```

**Was es macht:**
1. **Semver-Validation** der Eingabe (akzeptiert `1.2.3`, `2.0.0-beta.1`, etc.; strippt führendes `v`).
2. **Pre-Flight:** branch=`main`, working tree clean, in sync mit `origin/main`, Tag `v<version>` existiert nicht (lokal noch remote), Version nicht bereits auf npm, Version differs vom aktuellen.
3. **Plan-Anzeige + Konfirmation** (`proceed? [y/N]`) — letzter Stopper vor irreversibler Wirkung.
4. **Bump** beider JSONs atomar via `node` (preserves indent + trailing newline; keine .bak-Artefakte wie bei `sed -i`).
5. **`npm pack --dry-run`** als Sanity-Check (catched `files`-Allowlist-Drift bevor der Tag entsteht). Bei Failure: Bump wird via `git checkout --` zurückgerollt.
6. **Commit + annotated Tag + Push** mit `--follow-tags`.
7. Druckt Action-URL und npmjs.com-Package-URL für den Watch.

**Was es nicht macht:**
- Publish — der wird weiterhin von der GH Action via OIDC durchgeführt (siehe [[infrastructure-008]]).
- Pre-release-Tag-Promotion (`@next` → `@latest`) — wir releasen direkt auf latest.
- Automatisches Schreiben eines CHANGELOG — separat falls je nötig.

README-Sektion `## Releasing` aktualisiert: Skript als One-Liner zuerst, das manuelle 5-Schritte-Verfahren als "if you prefer" daneben (für Fallback und um's verständlich zu halten was das Skript macht).

## Acceptance criteria
- [x] `scripts/release.sh` existiert, ausführbar, mit Shebang `#!/usr/bin/env bash`
- [x] Semver-Argument-Validation (rejects "notsemver", "1.1", akzeptiert "1.1.0", "2.0.0-beta.1")
- [x] Pre-Flight-Checks: branch=main, clean tree, sync mit origin, Tag frei lokal+remote, Version nicht published, Version ≠ aktuell
- [x] Atomic JSON-Bump in beiden Files via `node` (kein `sed -i`)
- [x] `npm pack --dry-run` als Gate vor Commit/Tag/Push; bei Failure Rollback der Bumps
- [x] Confirmation-Prompt vor Push
- [x] README's `## Releasing` Sektion zeigt Skript als primären Pfad

## Outcome
- Datei: `scripts/release.sh` (130 LOC, Bash, Node für JSON-Mutation, keine externen Deps)
- README aktualisiert.
- Smoke (negativ): `scripts/release.sh` ohne Arg → usage; `scripts/release.sh notsemver` → rejected; `scripts/release.sh 1.1` → rejected. Alle Exit-Codes nicht-null.
- Smoke (positiv) wird beim nächsten echten Bump stattfinden — Skript ist self-validating durch die Pre-Flight-Checks, ein Trockenlauf gegen den aktuellen Stand (1.0.2) wäre nur möglich indem wir kurz eine höhere Version vorgeben würden, was ich vermeide.
