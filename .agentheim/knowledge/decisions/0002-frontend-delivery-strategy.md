---
id: "0002"
title: "Frontend delivery strategy"
scope: global
status: accepted
date: 2026-06-10
supersedes: []
superseded_by: []
related_tasks: [infrastructure-001]
---

# ADR-0002 — Frontend delivery strategy

## Decision

Serve a single self-contained HTML file with inline CSS and inline JavaScript. No build step, no framework, no bundler.

## Context

The UI is four columns of read-only task cards. No state management needed. A build step adds a bundler dependency and a dev loop that is unnecessary for a layout this size. Design-system tokens are CSS custom properties, handled natively by inline CSS.

## Consequences

- (+) No build step, no devDependencies for the frontend.
- (+) Entire frontend readable in one file, no toolchain.
- (−) No component hot reload; changes require server restart + browser reload.
- (−) Does not scale past ~500 lines without discipline.
- Revisit if any interactive feature (drag-and-drop, filtering) is added, or UI exceeds ~300 lines of template code.
