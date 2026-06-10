---
id: "0005"
title: "Plugin packaging and dependency strategy"
scope: global
status: accepted
date: 2026-06-10
supersedes: []
superseded_by: []
related_tasks: [infrastructure-001]
---

# ADR-0005 — Plugin packaging and dependency strategy

## Decision

Single `server.js` using only Node.js built-in modules (`node:http`, `node:fs`, `node:path`). No `package.json`, no `node_modules`, no build step. Plugin is installed by copying the directory.

## Context

A Claude Code plugin is a directory. If it contains `package.json`, the developer must run `npm install` before the plugin works — exactly the friction the vision eliminates. Markdown title extraction is a one-line regex; YAML frontmatter (`type`, `depends_on`) is parseable with a small hand-rolled key-value loop.

## Consequences

- (+) True zero-install; no `npm install` after plugin setup.
- (+) Plugin directory is portable: copy, zip, or git-clone and it works.
- (−) Markdown parsing limited to regex-extractable fields.
- Revisit if YAML frontmatter parsing becomes error-prone: introduce `package.json` + `gray-matter` as single dependency, then consider pre-bundling with esbuild to eliminate the install step again.
