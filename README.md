# agentheim-kanban-board

A Claude Code plugin that serves a local Kanban board for Agentheim-managed projects.

## What it does

Agentheim stores tasks as markdown files scattered across bounded-context directories. This plugin starts a local web server that reads those files and renders them as a visual board — four columns, all tasks, one browser tab. It is read-only: the board shows what is there, nothing more.

The bottleneck is friction, not motivation. One command removes it.

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and running in your project
- [Agentheim](https://github.com/agentheim/agentheim) plugin installed in the same project (the board reads `.agentheim/` task files)

## Installation

```bash
claude plugin add https://github.com/<your-github-username>/agentheim-kanban-board
```

## Skills

| Skill | What it does |
|---|---|
| `/kanban-start` | Starts the board server for the current project and opens it in the browser. |
| `/kanban-stop` | Stops the running board server. |
| `/kanban-open` | Opens the board in the browser without restarting the server (server must already be running). |
| `/kanban-status` | Reports whether the server is running and on which port. |

## Updating

```bash
claude plugin update agentheim-kanban-board
```

## How it works

The server reads `.agentheim/contexts/` from the project root where Claude Code is running. There is no global state and no configuration file — the board reflects exactly the project you are currently working in.
