---
id: "0009"
title: "Version synchronisation between package.json and plugin.json"
scope: global
status: accepted
date: 2026-06-19
supersedes: []
superseded_by: []
related_tasks: [infrastructure-007]
---

# ADR-0009 — Version synchronisation between package.json and plugin.json

## Decision

`package.json#version` and `.claude-plugin/plugin.json#version` MUST be kept in sync. Both are bumped together in the same commit. Manual convention for now — automate (e.g., an `npm version` lifecycle hook) only if drift is observed in practice.

## Context

The project has two delivery surfaces: the npm package (`agentheim-kanban-board` on the registry) and the Claude Code plugin (loaded via the marketplace). Each surface reads its own version manifest — npm reads `package.json`, Claude reads `.claude-plugin/plugin.json`. Both surfaces must report the same version string to users, otherwise the "what version do I have?" answer depends on how you installed it. That's a confusing footgun for a tool whose whole value is removing friction.

## Consequences

- (+) Zero new tooling — one rule, applied at bump time.
- (+) The convention is explicit and reviewable in any version-bump diff.
- (−) Manual coordination is fallible. Mitigated by code review and by [[infrastructure-008]], which will add a CI verification step in the tag-triggered publish workflow that fails the release if the two versions disagree.
