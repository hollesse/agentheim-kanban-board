---
id: infrastructure-003
title: "First release: version bump to 1.0.0 and git tag"
status: done
type: chore
context: infrastructure
created: 2026-06-10
completed: 2026-06-10
commit: 6972e22
depends_on: []
blocks: []
tags: [release, versioning]
related_adrs: []
related_research: []
prior_art: []
---

## Why
Das Plugin hat einen funktionsfähigen Stand mit Board, Detailseite und Design System. Es ist bereit für eine erste öffentliche Version.

## What
Version in `.claude-plugin/plugin.json` auf `1.0.0` heben und einen Git-Tag im Claude Code Plugin-Format `agentheim-kanban-board--v1.0.0` setzen.

## Acceptance criteria
- [ ] `version` in `.claude-plugin/plugin.json` ist `1.0.0`
- [ ] Git-Tag `agentheim-kanban-board--v1.0.0` existiert (annotated tag)
- [ ] Tag zeigt auf den aktuellen HEAD-Commit

## Notes
- Claude Code Plugin-Tages-Convention: `<plugin-name>--v<version>` (Doppelstrich)
- Annotated Tag verwenden (`git tag -a`) mit sinnvoller Nachricht
- Kein Push zum Remote — das entscheidet der Nutzer separat

## Outcome
Version in `.claude-plugin/plugin.json` wurde auf `1.0.0` angehoben. Annotated tag `agentheim-kanban-board--v1.0.0` zeigt auf HEAD-Commit `5983dd6`.
