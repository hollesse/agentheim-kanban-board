---
id: "0004"
title: "File watching and live-reload strategy"
scope: global
status: accepted
date: 2026-06-10
supersedes: []
superseded_by: []
related_tasks: [infrastructure-001]
---

# ADR-0004 — File watching and live-reload strategy

## Decision

v1: read `.agentheim/contexts/` fresh on every GET request. No file watcher, no push mechanism. Developer reloads the browser tab to see updated state.

## Context

Filesystem reads of a small markdown directory are effectively free on localhost. File watcher complexity (debounce, macOS FSEvents, cleanup on stop) is not justified for a personal tool at this scope. Noted as open question in vision.md — not a confirmed requirement.

## Consequences

- (+) Zero watcher infrastructure; no cleanup required on server stop.
- (+) Board is always current at the moment of the request.
- (−) Developer must manually reload to see changes.
- Revisit as v2 increment: Server-Sent Events + `fs.watch` if manual reload becomes annoying.
