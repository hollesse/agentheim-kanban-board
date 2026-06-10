---
id: "0003"
title: "Process lifecycle and lock file strategy"
scope: global
status: accepted
date: 2026-06-10
supersedes: []
superseded_by: []
related_tasks: [infrastructure-001]
---

# ADR-0003 — Process lifecycle and lock file strategy

## Decision

Write a JSON lock file at `.agentheim/.kanban.lock` on server start: `{ "pid": <pid>, "port": <port>, "started": "<iso-timestamp>" }`. Every skill does a `kill -0 <pid>` liveness check first; stale lock files are deleted automatically. Default port: 3131, incrementing if busy.

## Context

Skill files cannot maintain in-memory state across invocations. The port must be discoverable by stop/open/status skills without hardcoding. A plain PID file is fragile when the process dies without cleanup.

## Consequences

- (+) Self-healing: stale locks detected and cleaned automatically.
- (+) Port always discoverable; no hardcoded assumptions.
- (+) Project-scoped — two different projects can each run their own board.
- (−) Lock file must be in `.gitignore` (added as part of this decision task).
- (−) Race condition if two `/kanban-start` invocations run simultaneously (acceptable for single-user tool).
