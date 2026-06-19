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
claude plugins marketplace add https://github.com/hollesse/agentheim-kanban-board
claude plugins install agentheim-kanban-board
```

## Skills

| Skill | What it does |
|---|---|
| `/kanban-start` | Starts the board server for the current project and opens it in the browser. |
| `/kanban-stop` | Stops the running board server. |
| `/kanban-open` | Opens the board in the browser without restarting the server (server must already be running). |
| `/kanban-status` | Reports whether the server is running and on which port. |

## CLI (alternative to slash commands)

The plugin also ships a terminal CLI, `kanban`, that exposes the same four lifecycle operations as the slash-command skills. Use it when you want to start, stop, or check the board without Claude Code running.

The CLI is opt-in — plugin users who only use the slash commands need to install nothing. Both install paths below require Node.js 18+ and pull in zero runtime dependencies.

### Install (npm, recommended)

```bash
npm install -g agentheim-kanban-board
```

This puts the `kanban` binary on your PATH globally. Use this if you just want the CLI.

### Install from source

For plugin developers (or to work against an unreleased version), clone the repo and run `npm link`:

```bash
git clone https://github.com/hollesse/agentheim-kanban-board
cd agentheim-kanban-board
npm link
```

`npm link` only creates a symlink for the `kanban` binary; no `node_modules` are installed.

### Usage

Run `kanban` from inside any Agentheim project (the directory that contains `.agentheim/`):

```bash
kanban start    # start the server and open the browser
kanban status   # exit 0 if running, 1 otherwise — script-friendly
kanban open     # open the browser without restarting the server
kanban stop     # stop the running server
```

The CLI and the slash commands share the same lock file at `.agentheim/.kanban.lock`. Starting via one surface and stopping via the other works — both consume the same lifecycle module.

## Updating

```bash
claude plugin update agentheim-kanban-board
```

## How it works

The server reads `.agentheim/contexts/` from the project root where Claude Code is running. There is no global state and no configuration file — the board reflects exactly the project you are currently working in.
