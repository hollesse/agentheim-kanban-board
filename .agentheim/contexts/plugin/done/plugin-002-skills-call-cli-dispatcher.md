---
id: plugin-002
title: "Migrate skills to call CLI dispatcher (hybrid local/global)"
status: done
type: refactor
context: plugin
created: 2026-06-19
completed: 2026-06-19
commit:
depends_on: [infrastructure-005, infrastructure-006]
blocks: []
tags: [skills, refactor, lifecycle, deduplication, hybrid-dispatch]
related_adrs: [0003, 0006]
related_research: []
prior_art: [plugin-001]
---

## Why
Heute steht die Lifecycle-Bash-Logik (Lock prüfen, PID-Liveness, Browser-Open) repetitiv in den vier `SKILL.md`-Dateien. Mit [[infrastructure-005]] (`lib/lifecycle.js`) und [[infrastructure-006]] (CLI-Binary `bin/kanban.js`) ist die Duplikation unnötig — die Skills sollen das CLI aufrufen statt eigene Bash zu shellen.

Ziele: eine einzige Quelle der Wahrheit, kürzere Skill-Dateien, symmetrisches Verhalten zwischen CLI- und Skill-Surface automatisch garantiert.

## What

Jeder der vier Skill-Bodies wird auf einen **Hybrid-Dispatch** reduziert: bevorzugt das global installierte `kanban` (falls vorhanden), fällt sonst auf die im Plugin mitgelieferte Binary zurück.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if command -v kanban >/dev/null 2>&1; then
  kanban <subcommand>
else
  node "$PLUGIN_ROOT/bin/kanban.js" <subcommand>
fi
```

wobei `<subcommand>` jeweils `start | stop | status | open` ist.

**Begründung für den Hybrid-Pfad** (statt reinem Pfad- oder reinem PATH-Aufruf):

- **Out of the box** — funktioniert sofort nach Plugin-Install, kein npm-Install nötig, ADR-0005's Zero-Install-Versprechen für Plugin-User bleibt erhalten.
- **Power-User-freundlich** — wer `kanban` global installiert hat (`npm link` oder ein späteres `npm install -g`), kriegt automatisch den globalen Aufruf — saubere Output-Erfahrung, kürzere Process-Chain.
- **Kein silent auto-install** — Skills installieren *nichts* im Hintergrund. AV/EDR-unbedenklich.
- **Kein sudo-Risiko** — `npm install -g` wird nirgendwo aus dem Skill heraus getriggert.

YAML-Frontmatter (`name`, `description`) jedes Skills bleibt unverändert — diese steuern das Auto-Triggering durch Claude Code.

## Acceptance criteria
- [ ] Alle vier Skill-Dateien (`kanban-start`, `kanban-stop`, `kanban-status`, `kanban-open`) verwenden den Hybrid-Dispatch-Block (PATH-check + Fallback auf `node $PLUGIN_ROOT/bin/kanban.js`)
- [ ] Keine Bash-Lock-Datei-Logik (`kill -0`, JSON-parse via `node -e`, Lock-Datei-Cleanup) mehr in den SKILL.md-Bodies
- [ ] Skill-Frontmatter (name, description, trigger phrases) unverändert — Claude Code Auto-Triggering bleibt erhalten
- [ ] Skill-Bodies bleiben lesbar: kurzer Why-Satz oben, dann der ~6-Zeilen-Hybrid-Block
- [ ] **Smoke-Test (Plugin-only Pfad):** in einem Terminal *ohne* globalen `kanban` (z. B. `PATH=` nullen oder einen sauberen Shell-Subprozess) muss `node "$PLUGIN_ROOT/bin/kanban.js" status` durch den Skill-Body laufen — Fallback greift
- [ ] **Smoke-Test (PATH-Pfad):** mit `npm link` lokal aktiv muss `kanban status` durch den Skill-Body laufen — Preference auf global greift
- [ ] **Symmetrie verifiziert:** ein über `/kanban-start` (Skill, Plugin-Pfad) gestarteter Server lässt sich via `kanban stop` (CLI, PATH-Pfad) beenden — und umgekehrt

## Notes

### Reihenfolge
Diese Task kommt erst nach [[infrastructure-005]] *und* [[infrastructure-006]] — `depends_on` ist erfüllt (beide done, 2026-06-19).

### Out of scope
- **Verhaltens-Änderungen** — reine Konsolidierung. Nutzer-sichtbare Outputs bleiben identisch zur heutigen Skill-Erfahrung.
- **Auto-Install im Skill** — bewusst nicht. Ein Skill, der heimlich `npm install -g` ausführt, ist AV-/EDR-bedenklich, kann `sudo` brauchen, hinterlässt Orphans beim Plugin-Uninstall und untergräbt ADR-0005. Falls Terminal-User die saubere `kanban`-Erfahrung wollen, wird das über eine eigene Publish-Task (`infrastructure-007`, noch nicht erfasst) und eine README-Anweisung gelöst, nicht über Magic im Skill.
- **Neue Skills** — diese Task migriert nur die bestehenden vier.

### Schnittpunkt mit ADR-0006
Diese Task realisiert konkret die in ADR-0006 ("CLI as second delivery surface") festgehaltene Delegations-Richtung (Skills → CLI). Kein eigener ADR nötig.

### Beispiel-Skill (kanban-start) nach Migration

```markdown
---
name: kanban-start
description: Start the Agentheim Kanban board server for the current project and open it in the browser. Use when the user wants to view the task board, open the kanban board, or start the board server.
---

# kanban-start

Start the Kanban board server and open the browser. Delegates to the
`kanban` CLI (or the in-plugin binary as fallback) — see ADR-0006.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if command -v kanban >/dev/null 2>&1; then
  kanban start
else
  node "$PLUGIN_ROOT/bin/kanban.js" start
fi
```
```

(Analog für `stop`, `status`, `open` — nur das Subkommando wechselt.)

### Frontmatter-Diff zum heutigen Stand
Keine Änderung am Frontmatter. Die heutigen `description`-Strings bleiben, damit Claude Code Auto-Triggering identisch funktioniert.

## Outcome

All four skill files (`skills/kanban-start`, `kanban-stop`, `kanban-status`, `kanban-open`) now contain the hybrid-dispatch block: prefer global `kanban` on PATH, fall back to `node $PLUGIN_ROOT/bin/kanban.js`. Skill bodies shrank from 30–70 lines of bash (lock-file parsing, `kill -0` checks, browser-open) to ~10 lines that delegate to the CLI. Frontmatter (`name`, `description`) was preserved verbatim per file — Claude Code auto-triggering is unchanged.

Smoke-tested both branches: with no global `kanban` on PATH, the in-plugin fallback executes `node bin/kanban.js <sub>` and produces the CLI's formatted output ("Kanban board is not running", correct exit code). Dispatch block was also executed simulating Claude Code's `$0 = skill path` — `$PLUGIN_ROOT` resolves correctly via `dirname "$0"/../..`.

The plugin BC README's `## Key commands` section now carries a one-paragraph delegation note pointing at ADR-0006 and `lib/lifecycle.js`. No new ADR was needed (ADR-0006 already documents the delegation direction). No new backlog items surfaced.

Key files:
- `skills/kanban-start/SKILL.md`, `skills/kanban-stop/SKILL.md`, `skills/kanban-status/SKILL.md`, `skills/kanban-open/SKILL.md` — rewritten bodies, frontmatter preserved
- `.agentheim/contexts/plugin/README.md` — delegation note added under `## Key commands`
