---
id: "0006"
title: "CLI as second delivery surface alongside plugin skills"
scope: global
status: accepted
date: 2026-06-19
supersedes: []
superseded_by: []
related_tasks: [infrastructure-006]
---

# ADR-0006 — CLI as second delivery surface alongside plugin skills

## Decision

The kanban board offers two equal delivery surfaces:

1. **Plugin skills** (`/kanban-start`, `/kanban-stop`, `/kanban-open`, `/kanban-status`) — invoked inside Claude Code.
2. **CLI binary** `kanban` (`kanban start | stop | status | open`) — invoked from any terminal.

Both surfaces consume the same `lib/lifecycle.js` module ([ADR-0007](0007-lifecycle-module.md)). Neither is the "primary"; they are two presentations of the same lifecycle contract.

The CLI is the *dispatcher of record*. A future task ([[plugin-002]]) will migrate the skill bodies to delegate to the CLI binary (when present), so there is exactly one code path through which the server is started, stopped, opened, and queried.

## Context

[[infrastructure-005]] extracted the lifecycle logic into `lib/lifecycle.js`. With the contract isolated, a CLI wrapper becomes a thin file (argv parsing, stdout/stderr formatting, exit codes) and the skill files become equally thin shells. Without an explicit ADR fixing CLI and skills as peers, future work could drift toward duplicating the lifecycle calls in both places again — exactly what we extracted to avoid.

The CLI also unlocks use cases the plugin can't reach: terminal-only sessions, shell scripts, CI smoke checks, and developers who don't currently have Claude Code open but want to glance at the board.

## Consequences

- (+) Single source of truth (`lib/lifecycle.js`) feeds two surfaces; no logic duplication.
- (+) Terminal users get a first-class entrypoint without leaving the shell.
- (+) Skill migration ([[plugin-002]]) becomes a mechanical delegation — the lifecycle calls move from skill bodies to `kanban <subcommand>` invocations.
- (+) Lock-file symmetry: starting via one surface and stopping via the other works because both surfaces hit the same lock at `.agentheim/.kanban.lock`.
- (−) Two surface contracts must stay in sync (subcommand names, exit codes, output strings). Acceptable — both are thin and reviewed together.
- (−) CLI install (`npm link` / `npm i -g`) is opt-in; plugin-only users won't get `kanban` on their PATH. That is by design — the plugin must stay zero-install ([ADR-0005](0005-plugin-packaging-dependencies.md), [ADR-0008](0008-packaging-bin-zero-deps.md)).
