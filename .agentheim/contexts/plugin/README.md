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

These commands are delegated by the skill files to the `kanban` CLI (see ADR-0006): each skill body uses a hybrid local/global dispatch — preferring a globally installed `kanban` binary on PATH, falling back to the plugin-bundled `bin/kanban.js`. Lifecycle logic lives in `lib/lifecycle.js`; the skills carry no Bash lock-file logic of their own.

## Relationships with other contexts
- **Upstream of:** board — manages its process lifecycle

## Open questions
- Where is the PID file stored? `.agentheim/.kanban.pid` or system temp?
