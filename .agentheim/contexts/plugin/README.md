# Plugin

## Purpose
Defines the Claude Code skill files that expose `/kanban-start`, `/kanban-stop`, `/kanban-open`, and `/kanban-status` as slash commands. This context owns the integration seam between the developer's Claude Code session and the board server process.

## Classification
Supporting — enables the core (board) to be reached conveniently, but contains no domain logic itself.

## Actors
- **Developer** — invokes slash commands from the Claude Code prompt
- **Claude Code** — executes the skill instructions and runs shell commands

## Ubiquitous language
- **Skill** — a markdown file under `skills/` that defines a slash command's instructions
- **Plugin manifest** — the `.claude-plugin/` directory declaring skills and their metadata
- **Server process** — the running board HTTP server, started and stopped by skills
- **PID file** — file tracking the server process ID so stop/status skills can find it

## Aggregates
- **Server lifecycle** — protects the invariant that at most one board server runs per project at a time

## Key events
- `ServerStarted` — server is up and listening
- `ServerStopped` — server process terminated

## Key commands
- `StartServer` — launch the board server and open the browser
- `StopServer` — terminate the running server process
- `OpenBoard` — open the board URL in the browser (server must already be running)
- `CheckStatus` — report whether a server is running and on which port

These commands are delegated by the skill files to `bin/dispatch.sh` (see ADR-0006, ADR-0009): the dispatch helper uses the global `kanban` binary only when its version exactly matches the plugin's own version (from `package.json`). On a version mismatch it falls back to the bundled `bin/kanban.js` and prints a stderr warning with both fix paths. When no global `kanban` is found the bundled binary is used silently. Lifecycle logic lives in `lib/lifecycle.js`; the skills carry no Bash lock-file logic of their own.

## Relationships with other contexts
- **Upstream of:** board — manages its process lifecycle

## Open questions
- Where is the PID file stored? `.agentheim/.kanban.pid` or system temp?
