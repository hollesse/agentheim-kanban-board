---
id: "0001"
title: "HTTP server runtime"
scope: global
status: accepted
date: 2026-06-10
supersedes: []
superseded_by: []
related_tasks: [infrastructure-001]
---

# ADR-0001 — HTTP server runtime

## Decision

Use Node.js with the built-in `node:http` module only. No framework, no additional runtime.

## Context

Claude Code runs on Node.js — guaranteed present, zero installation cost. Server surface is two routes: one HTML endpoint, one JSON endpoint. Express/Fastify/Hono add nothing for two routes. Deno and Bun require a separate install, breaking the zero-friction constraint.

## Consequences

- (+) Zero installation requirement.
- (+) No transitive dependencies; entire server is auditable in one file.
- (+) Cold start is effectively instantaneous.
- (−) Routing helpers must be written by hand (trivial at two routes).
- Revisit if routes grow past ~6 or WebSocket support is needed.
