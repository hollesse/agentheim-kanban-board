# Infrastructure

## Purpose
Owns globally-true technical concerns: runtime, build tooling, dependency management, and process lifecycle. BC-local infra (e.g., the board's file-reading adapter) stays inside the originating BC.

## Classification
Supporting — foundation for all other BCs.

## Actors
None. This BC contains decisions and spike work, not running code with user-facing actors.

## Ubiquitous language
- **Runtime** — the execution environment for the server (e.g., Node.js, Deno)
- **Build** — the process that produces deployable/runnable artefacts from source
- **Process** — a running OS process; the board server is one such process
- **Dependency** — an external package or library the project depends on
- **Lifecycle module** — `lib/lifecycle.js`, the single source of truth for starting, stopping, opening, and inspecting the board server process
- **Lock file** — `.agentheim/.kanban.lock`, the JSON file the running server writes (pid/port/started) and that consumers read to discover the live instance

## Aggregates
None at this stage.

## Key events
None at this stage.

## Key commands
Exported by `lib/lifecycle.js` (see [ADR-0007](../../knowledge/decisions/0007-lifecycle-module.md)):
- `start({ root, serverPath })` — idempotent start; spawns the server detached, polls the lock, opens the browser
- `stop({ root })` — SIGTERM the running server, clean up the lock
- `status({ root })` — pure read: `{ running, pid, port, lockPath, stale }`
- `open({ root })` — open the board URL in the user's default browser (cross-platform)
- Helpers: `lockPath`, `readLock`, `writeLock`, `deleteLock`, `isAlive`, `openBrowser`

## Relationships with other contexts
- **Shared kernel with:** plugin, board — provides the runtime and build environment both depend on

## Open questions
See decision tasks in `todo/`.
