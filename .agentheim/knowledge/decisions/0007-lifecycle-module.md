---
id: "0007"
title: "Lifecycle module location and contract"
scope: global
status: accepted
date: 2026-06-19
supersedes: []
superseded_by: []
related_tasks: [infrastructure-005]
---

# ADR-0007 — Lifecycle module location and contract

## Decision

Process lifecycle logic lives in `lib/lifecycle.js` at the project root. Node built-ins only (`node:fs`, `node:path`, `node:child_process`) — no `package.json`, no dependencies. Preserves ADR-0005's zero-install posture.

**Exported API (the contract both the CLI binary and the skills consume):**

- `start({ root, serverPath, timeoutMs?, openInBrowser? })` — idempotent. If a live server is found via the lock, returns `{ alreadyRunning: true, pid, port, opened }`; otherwise spawns `node serverPath` detached, polls `.agentheim/.kanban.lock` until a live lock appears (default 3s timeout), and returns `{ alreadyRunning: false, pid, port, opened }`.
- `stop({ root, waitMs? })` — reads the lock, sends `SIGTERM`, waits briefly for the server's own cleanup, force-deletes any stranded lock. Returns `{ stopped: true, pid }` or `{ stopped: false, reason }` where reason ∈ `not-running | stale-lock | kill-failed`.
- `status({ root })` — pure data, no side effects. Returns `{ running, pid, port, lockPath, stale }`.
- `open({ root })` — validates liveness, opens the browser. Returns `{ opened: true, port }` or `{ opened: false, reason }`.

**Helpers (also exported, for `server.js` and testing):** `lockPath(root)`, `readLock(root)`, `writeLock(root, { pid, port, started? })`, `deleteLock(root)`, `isAlive(pid)`, `openBrowser(url)`.

**Cross-platform browser dispatch** (selected via `process.platform`):

| Platform | Command |
| --- | --- |
| `darwin` | `open <url>` |
| `linux` (and other unixen) | `xdg-open <url>` |
| `win32` | `cmd /c start "" <url>` |

The child is `spawn`ed with `detached: true, stdio: 'ignore'` and `.unref()`'d so the caller can exit immediately.

**Liveness check uses `process.kill(pid, 0)`**, not a shell-out to `kill -0`. Portable across macOS / Linux / Windows. `EPERM` is treated as "alive but unsignalable".

## Context

[[infrastructure-002]] inlined lock-file logic into `server.js` and Bash snippets into the four skill files. [[infrastructure-006]] needs a CLI binary that mirrors what the skills do today, and [[plugin-002]] will then point the skills at that CLI. Duplicating the logic in JS-for-CLI plus Bash-for-skills produces two implementations of the same contract — exactly what we extracted in this task to avoid.

`server.js` still owns the actual lock **write** at listen time. That write is atomic with the port binding (the `server.listen` callback knows the bound port and the live pid); moving it to the spawner would introduce a race where the lock could exist before the server is actually accepting connections. `lifecycle.start()` therefore spawns and polls, rather than writing the lock on the server's behalf. The lock-file *shape* (path, fields) lives in `lib/lifecycle.js` and `server.js` calls `lifecycle.writeLock` so there is exactly one definition.

## Consequences

- (+) Single source of truth for lock-file shape, liveness semantics, and browser dispatch.
- (+) CLI ([[infrastructure-006]]) and skills ([[plugin-002]]) can both build on the same module without re-implementing the contract.
- (+) Cross-platform browser-open ships now, replacing the macOS-only `open` calls in the current skill bodies.
- (+) Module is pure data in / pure data out: no `console.log`, no `process.exit`. Caller-specific formatting (CLI output, skill rendering) is the caller's job.
- (−) Two files now have to agree on the lock-file shape (`server.js` calls `lifecycle.writeLock`; `lib/lifecycle.js` defines it). Acceptable — `server.js` no longer constructs the JSON itself.
- (−) The 3-second start polling timeout is a hard-coded heuristic. If a slow filesystem or anti-virus delays the write, callers can override via `timeoutMs`.
