---
id: plugin-003
title: Version-aware skill dispatch — use global only when versions match
status: done
type: feature
context: plugin
created: 2026-06-19
completed: 2026-06-19
commit:
depends_on: []
blocks: []
tags: [skills, dispatch, version-check, hybrid-dispatch]
related_adrs: [0006, 0009]
related_research: []
prior_art: [plugin-002]
---

## Why

The current hybrid dispatch in skill files uses the global `kanban` binary blindly
whenever it appears on PATH. If the globally installed version differs from the
bundled version shipped with the plugin, the developer silently gets mismatched
behavior — the skill was built and tested against a specific CLI version, and a
different global install may have divergent output or exit codes.

## What

The four skill files (`kanban-start`, `kanban-stop`, `kanban-status`, `kanban-open`)
apply a **version-aware dispatch**: before falling back to the global `kanban`,
compare `kanban --version` against the plugin's own version (from `package.json`).

- **Match** → use global (current behavior, no change)
- **No match** → use bundled `node $PLUGIN_ROOT/bin/kanban.js` and print a warning
  to stderr pointing the developer at both fix paths
- **Global not found** → use bundled (current behavior, no change)

The warning should read like:
```
⚠️  kanban: global v<X> ≠ plugin v<Y>. Using bundled binary.
    To fix: npm install -g agentheim-kanban-board@<Y>  OR  reinstall the plugin.
```

**Implementation note:** the version-check block is ~8 lines. Rather than repeating
it in all four skill bodies, a `bin/dispatch.sh <subcommand>` helper (alongside the
existing `bin/kanban.js`) that each skill delegates to in one line is the recommended
approach — but the worker may inline if the helper adds more complexity than it saves.

## Acceptance criteria

- [ ] All four skill files use version-aware dispatch
- [ ] When `kanban --version` equals the plugin version: global binary is invoked (no warning, no change in behavior)
- [ ] When `kanban --version` differs from the plugin version: bundled `node $PLUGIN_ROOT/bin/kanban.js` is invoked, warning printed to stderr with both fix paths (`npm install -g agentheim-kanban-board@<version>` AND reinstall the plugin)
- [ ] When no global `kanban` on PATH: bundled is invoked, no warning (no change in behavior)
- [ ] Version comparison uses exact string equality (e.g., `"1.0.2" == "1.0.2"`)
- [ ] Warning is printed to **stderr** only (not polluting stdout that callers may parse)
- [ ] Skill frontmatter (`name`, `description`) unchanged — Claude Code auto-triggering unaffected

## Outcome

Added `bin/dispatch.sh` — a version-aware dispatch helper that reads the plugin version from `package.json`, compares it to `kanban --version`, and routes to either the global binary (exact match) or the bundled `bin/kanban.js` (mismatch or not found). On mismatch a warning is printed to stderr pointing at both fix paths (`npm install -g agentheim-kanban-board@<version>` and reinstall the plugin). All four skill files now delegate to `dispatch.sh` in a single line. Six new tests in `test/dispatch.test.js` cover all dispatch branches.

Key files:
- `bin/dispatch.sh` — new version-aware dispatch helper
- `skills/kanban-start/SKILL.md`, `skills/kanban-stop/SKILL.md`, `skills/kanban-status/SKILL.md`, `skills/kanban-open/SKILL.md` — updated to delegate to `dispatch.sh`
- `test/dispatch.test.js` — 6 new tests

## Notes

### Version source

The bundled version lives in `$PLUGIN_ROOT/package.json` (`.version` field). Since
ADR-0009 keeps `package.json` and `plugin.json` in sync, either file is the canonical
source; `package.json` is preferred (always present at runtime via Node).

### Why exact match, not `^` semver

Plugin and package are a single artifact released together. A minor-version bump
could include CLI interface changes the skills rely on. Exact match is the safe
default. If a semver-compatible window becomes desirable later (e.g., to allow
hotfixes without reinstalling the plugin), that's a separate decision/ADR.

### Relation to prior work

`plugin-002` introduced the hybrid dispatch pattern. This task tightens it by adding
version-awareness. The existing dispatch prose in the Plugin BC README ("prefers a
globally installed `kanban` binary on PATH, falling back to the plugin-bundled
`bin/kanban.js`") will need a one-sentence update to reflect the version-gate.
