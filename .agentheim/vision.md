# Vision: Agentheim Kanban Board

## Purpose
A Claude Code plugin that starts a local web server serving a Kanban board — a read-only visual overview of all Agentheim task files in the current project. Built for the developer who uses Agentheim but doesn't open the markdown files often enough.

## Users
The developer working on an Agentheim-managed project. They are also the operator — no other users, no authentication, no multi-tenancy.

## The problem
Agentheim manages tasks as markdown files across bounded contexts. Because the files are hidden in a folder hierarchy, the developer rarely checks them before starting work or asking Claude to execute tasks. Not reading the task files leads to worse outcomes: Claude lacks context, tasks are re-explained from memory, and refined work goes unnoticed.

The bottleneck is not motivation — it's friction. A visual board that opens with one command removes that friction.

## What success looks like
- `/kanban-start` opens a browser tab with a Kanban board in under two seconds
- All tasks across all bounded contexts are visible on one board, grouped into four columns: backlog, todo, doing, done
- The developer actually looks at the board before kicking off work, without thinking twice about it

## Non-goals
- Moving or editing tasks from the board (read-only for now)
- Multi-project support or configurable paths
- Authentication or access control
- Replacing Claude for task management — this is a viewing tool, not a management tool
- Deployment beyond localhost

## Ubiquitous language (seed)
- **Plugin** — a Claude Code plugin: a set of skill files loadable via `/plugin marketplace add`
- **Skill** — a slash command defined in a plugin, e.g. `/kanban-start`
- **Board** — the web page showing all tasks as cards in Kanban columns
- **Column** — one of the four task states: backlog, todo, doing, done
- **Task** — a single markdown file under `.agentheim/contexts/<bc>/<column>/`
- **Bounded context (BC)** — a subdirectory under `.agentheim/contexts/`, each representing a domain area

## Open questions
- Should tasks show full frontmatter (type, depends_on) or just title and description?
- Should the board auto-refresh when files change, or require a manual reload?
