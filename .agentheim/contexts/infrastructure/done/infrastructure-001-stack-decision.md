---
id: infrastructure-001
title: "Stack decision: runtime, server framework, frontend delivery, process lifecycle, plugin packaging"
type: decision
status: done
completed: 2026-06-10
depends_on: []
---

# Stack decision: runtime, server, frontend, process, packaging

## Why this decision is needed
Before any code is written the project needs to commit to how the server runs, how it is started and stopped, what the frontend looks like, and how the plugin is packaged. All five areas are globally true — they apply to every BC.

## Acceptance criteria
- ADR committed covering runtime, frontend strategy, process lifecycle, file-watch stance, and packaging
- `.agentheim/.kanban.lock` added to `.gitignore`
- No code change required — this is a record only

## Outcome

Five ADRs written to `.agentheim/knowledge/decisions/`:

- `0001-http-server-runtime.md` — Node.js `node:http` only, no framework
- `0002-frontend-delivery-strategy.md` — Single inline HTML file, no build step
- `0003-process-lifecycle-lock-file.md` — JSON lock file at `.agentheim/.kanban.lock`, PID-based liveness check
- `0004-file-watching-live-reload.md` — Read-on-demand in v1, no watcher
- `0005-plugin-packaging-dependencies.md` — Single `server.js`, no `package.json`, zero-install

`.gitignore` created at project root with `.agentheim/.kanban.lock` excluded.

## Notes (architect's draft)

### ADR-001 — HTTP server runtime

**Decision:** Use Node.js with the built-in `node:http` module only. No framework, no additional runtime.

**Context:** Claude Code runs on Node.js — guaranteed present, zero installation cost. Server surface is two routes: one HTML endpoint, one JSON endpoint. Express/Fastify/Hono add nothing for two routes. Deno and Bun require a separate install, breaking the zero-friction constraint.

**Consequences:**
- (+) Zero installation requirement.
- (+) No transitive dependencies; entire server is auditable in one file.
- (+) Cold start is effectively instantaneous.
- (−) Routing helpers must be written by hand (trivial at two routes).
- Revisit if routes grow past ~6 or WebSocket support is needed.

---

### ADR-002 — Frontend delivery strategy

**Decision:** Serve a single self-contained HTML file with inline CSS and inline JavaScript. No build step, no framework, no bundler.

**Context:** The UI is four columns of read-only task cards. No state management needed. A build step adds a bundler dependency and a dev loop that is unnecessary for a layout this size. Design-system tokens are CSS custom properties, handled natively by inline CSS.

**Consequences:**
- (+) No build step, no devDependencies for the frontend.
- (+) Entire frontend readable in one file, no toolchain.
- (−) No component hot reload; changes require server restart + browser reload.
- (−) Does not scale past ~500 lines without discipline.
- Revisit if any interactive feature (drag-and-drop, filtering) is added, or UI exceeds ~300 lines of template code.

---

### ADR-003 — Process lifecycle and lock file strategy

**Decision:** Write a JSON lock file at `.agentheim/.kanban.lock` on server start: `{ "pid": <pid>, "port": <port>, "started": "<iso-timestamp>" }`. Every skill does a `kill -0 <pid>` liveness check first; stale lock files are deleted automatically. Default port: 3131, incrementing if busy.

**Context:** Skill files cannot maintain in-memory state across invocations. The port must be discoverable by stop/open/status skills without hardcoding. A plain PID file is fragile when the process dies without cleanup.

**Consequences:**
- (+) Self-healing: stale locks detected and cleaned automatically.
- (+) Port always discoverable; no hardcoded assumptions.
- (+) Project-scoped — two different projects can each run their own board.
- (−) Lock file must be in `.gitignore` (add on first implementation task).
- (−) Race condition if two `/kanban-start` invocations run simultaneously (acceptable for single-user tool).

---

### ADR-004 — File watching and live-reload strategy

**Decision:** v1: read `.agentheim/contexts/` fresh on every GET request. No file watcher, no push mechanism. Developer reloads the browser tab to see updated state.

**Context:** Filesystem reads of a small markdown directory are effectively free on localhost. File watcher complexity (debounce, macOS FSEvents, cleanup on stop) is not justified for a personal tool at this scope. Noted as open question in vision.md — not a confirmed requirement.

**Consequences:**
- (+) Zero watcher infrastructure; no cleanup required on server stop.
- (+) Board is always current at the moment of the request.
- (−) Developer must manually reload to see changes.
- Revisit as v2 increment: Server-Sent Events + `fs.watch` if manual reload becomes annoying.

---

### ADR-005 — Plugin packaging and dependency strategy

**Decision:** Single `server.js` using only Node.js built-in modules (`node:http`, `node:fs`, `node:path`). No `package.json`, no `node_modules`, no build step. Plugin is installed by copying the directory.

**Context:** A Claude Code plugin is a directory. If it contains `package.json`, the developer must run `npm install` before the plugin works — exactly the friction the vision eliminates. Markdown title extraction is a one-line regex; YAML frontmatter (`type`, `depends_on`) is parseable with a small hand-rolled key-value loop.

**Consequences:**
- (+) True zero-install; no `npm install` after plugin setup.
- (+) Plugin directory is portable: copy, zip, or git-clone and it works.
- (−) Markdown parsing limited to regex-extractable fields.
- Revisit if YAML frontmatter parsing becomes error-prone: introduce `package.json` + `gray-matter` as single dependency, then consider pre-bundling with esbuild to eliminate the install step again.
