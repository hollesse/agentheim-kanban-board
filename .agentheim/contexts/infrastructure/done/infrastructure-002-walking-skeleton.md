---
id: infrastructure-002
title: "Walking skeleton: thin end-to-end slice — server starts, reads .agentheim/, returns board page"
type: spike
status: done
depends_on: [infrastructure-001]
completed: 2026-06-10
---

# Walking skeleton

## Why this spike is needed
Prove the full stack runs before any feature work begins. This is the moment code first appears in the project.

## What to build
A thin end-to-end slice — feature-thin, architecture-thick:

1. `server.js` in the plugin root: a Node.js HTTP server using `node:http` only
   - `GET /` returns a minimal HTML page with the word "Kanban Board" and a count of tasks found
   - `GET /api/tasks` returns a JSON array of task objects parsed from `.agentheim/contexts/*/`
   - Reads task files fresh on every request (no cache, no watcher)
   - Writes `.agentheim/.kanban.lock` on startup with `{ "pid", "port", "started" }`
   - Defaults to port 3131; increments if busy
2. Four skill files (minimal stubs, just enough to prove the plugin wires up):
   - `skills/kanban-start/SKILL.md`
   - `skills/kanban-stop/SKILL.md`
   - `skills/kanban-open/SKILL.md`
   - `skills/kanban-status/SKILL.md`
3. `.gitignore` entry for `.agentheim/.kanban.lock`
4. Plugin manifest wired so `/kanban-start` resolves to `skills/kanban-start/SKILL.md`

## Acceptance criteria
- `node server.js` starts without error and prints the port it is listening on
- `curl http://localhost:3131/` returns an HTML page (HTTP 200)
- `curl http://localhost:3131/api/tasks` returns a valid JSON array (empty array is fine if no `.agentheim/` exists in CWD)
- `.agentheim/.kanban.lock` is created on startup and contains `pid` and `port`
- Running `/kanban-start` from a Claude Code session in this project opens the board URL in the browser
- `.agentheim/.kanban.lock` is listed in `.gitignore`

## Notes
- Do NOT implement the full board UI here — the skeleton just needs to prove the stack runs.
- Do NOT add any npm dependencies. Built-in modules only.
- The architect noted: verify the exact Claude Code plugin manifest format (`.claude-plugin/` directory convention) before wiring up the skill files.
- CWD when the server runs should be the project root (where `.agentheim/` lives); confirm this is set correctly by the skill shell block.

## Outcome

Walking skeleton is live and verified. All acceptance criteria passed on first run.

- `server.js` — Node.js HTTP server (`node:http` only), reads `.agentheim/contexts/*/` fresh on every request, writes lock file on start, auto-increments port from 3131, cleans lock file on SIGTERM/SIGINT.
- `.claude-plugin/plugin.json` — plugin manifest following the agentheim reference format.
- `skills/kanban-start/SKILL.md` — instructs Claude to check for existing server via lock file, start if not running, open browser.
- `skills/kanban-stop/SKILL.md` — instructs Claude to read lock file, kill PID, delete lock file.
- `skills/kanban-open/SKILL.md` — instructs Claude to read lock file, verify liveness, open URL.
- `skills/kanban-status/SKILL.md` — instructs Claude to read lock file, report running/stale/absent.

Verified manually:
- `curl http://localhost:3131/` → HTTP 200, HTML page with "Kanban Board" heading
- `curl http://localhost:3131/api/tasks` → valid JSON array (5 tasks parsed from .agentheim/)
- `.agentheim/.kanban.lock` written with pid, port, started fields
- Lock file cleaned up automatically on server kill
