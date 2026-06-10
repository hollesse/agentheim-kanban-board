# Infrastructure

## Purpose
Owns globally-true technical concerns: runtime, build tooling, dependency management, and process lifecycle. BC-local infra (e.g., the board's file-reading adapter) stays inside the originating BC.

## Classification
Supporting — foundation for all other BCs.

## Actors
None. This BC contains decisions and spike work, not running code with user-facing actors.

## Ubiquitous language
- **Runtime** — the execution environment for the server (e.g., Node.js, Deno)
- **Build** — the process that produces deployable/runnable artefacts from source
- **Process** — a running OS process; the board server is one such process
- **Dependency** — an external package or library the project depends on

## Aggregates
None at this stage.

## Key events
None at this stage.

## Key commands
None at this stage.

## Relationships with other contexts
- **Shared kernel with:** plugin, board — provides the runtime and build environment both depend on

## Open questions
See decision tasks in `todo/`.
