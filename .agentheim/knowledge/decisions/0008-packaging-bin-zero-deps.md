---
id: "0008"
title: "Packaging: package.json with bin and zero runtime dependencies"
scope: global
status: accepted
date: 2026-06-19
supersedes: []
superseded_by: []
amends: [0005]
related_tasks: [infrastructure-006]
---

# ADR-0008 — Packaging: package.json with bin and zero runtime dependencies

## Decision

Introduce a `package.json` at the project root that:

- Declares the npm package name `agentheim-kanban-board`.
- Declares `"bin": { "kanban": "./bin/kanban.js" }` so `npm link` / `npm install -g` puts the `kanban` binary on the user's PATH.
- Declares `"dependencies": {}` — explicitly empty. The board (`server.js`) and the CLI (`bin/kanban.js`) consume only Node.js built-ins.
- Declares `"engines": { "node": ">=18" }`.
- Declares `"main": "server.js"`.

This **amends** [ADR-0005](0005-plugin-packaging-dependencies.md) (zero-install plugin packaging) — it does not supersede it.

## Context

[ADR-0005](0005-plugin-packaging-dependencies.md) banned `package.json` on the grounds that any `package.json` forces an `npm install` step on plugin users, undoing zero-install. That reasoning holds **only** when `dependencies` is non-empty:

- A `package.json` with `"dependencies": {}` triggers no install step. `npm` writes no `node_modules`, and Claude Code's plugin loader doesn't care that the file exists.
- A `package.json` is required to expose a `bin` entry. Without it, there is no portable way to install a command-line tool from a Node.js source tree.

[[infrastructure-006]] introduces the `kanban` CLI binary as a second delivery surface ([ADR-0006](0006-cli-second-delivery-surface.md)). Shipping that binary without `package.json` would mean asking users to manually symlink `bin/kanban.js` into their PATH — exactly the friction we want to avoid for opt-in CLI users.

Plugin users who don't want the CLI continue to do nothing: they `claude plugins install` the repo and the empty-deps `package.json` is inert.

## Consequences

- (+) Opt-in CLI install: `npm link` (or future `npm i -g`) inside the cloned plugin directory puts `kanban` on PATH.
- (+) ADR-0005's zero-install guarantee is preserved for plugin-only users because `dependencies: {}` triggers no install step.
- (+) `bin` entry survives any future publish to npm.
- (−) The codebase now has a `package.json` and must defend the empty-deps invariant. If a real runtime dependency is ever needed, it forces a re-evaluation of ADR-0005's premises (bundling, vendoring, etc.).
- (−) `npm publish` is now a one-line follow-up if desired — out of scope here but trivially reachable.

## Forward references

- [ADR-0006](0006-cli-second-delivery-surface.md) — the surface this packaging enables.
- [ADR-0007](0007-lifecycle-module.md) — the module both surfaces consume; `lib/` is also referenced from `main`.
