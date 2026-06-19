# Index

Top-level catalog of this project's bounded contexts, global decisions, and research.
For BC-scoped artifacts, see each BC's `INDEX.md`.

> Updated by: `model` (BC creation), `work` (global ADRs), `research` (reports tagged global / cross-BC), backfill script.
> Hand-edits are fine but the skills will append at the section markers below.

---

## Bounded contexts

<!-- bc-list:start -->
- **plugin** — Claude Code skill files exposing `/kanban-*` slash commands — `contexts/plugin/INDEX.md`
- **board** — HTTP server + Kanban board web UI reading `.agentheim/` task files — `contexts/board/INDEX.md`
- **infrastructure** — Globally-true technical concerns: runtime, build, process lifecycle — `contexts/infrastructure/INDEX.md`
- **design-system** — Visual language, tokens, and components for the board UI — `contexts/design-system/INDEX.md`
<!-- bc-list:end -->

## Global ADRs (scope: global)

<!-- adr-global:start -->
- **0001** — HTTP server runtime — 2026-06-10 — `knowledge/decisions/0001-http-server-runtime.md`
- **0002** — Frontend delivery strategy — 2026-06-10 — `knowledge/decisions/0002-frontend-delivery-strategy.md`
- **0003** — Process lifecycle and lock file strategy — 2026-06-10 — `knowledge/decisions/0003-process-lifecycle-lock-file.md`
- **0004** — File watching and live-reload strategy — 2026-06-10 — `knowledge/decisions/0004-file-watching-live-reload.md`
- **0005** — Plugin packaging and dependency strategy — 2026-06-10 — `knowledge/decisions/0005-plugin-packaging-dependencies.md`
- **0006** — CLI as second delivery surface alongside plugin skills — 2026-06-19 — `knowledge/decisions/0006-cli-second-delivery-surface.md`
- **0007** — Lifecycle module location and contract — 2026-06-19 — `knowledge/decisions/0007-lifecycle-module.md`
- **0008** — Packaging: package.json with bin, zero runtime deps — 2026-06-19 — `knowledge/decisions/0008-packaging-bin-zero-deps.md`
- **0009** — Version synchronisation between package.json and plugin.json — 2026-06-19 — `knowledge/decisions/0009-version-sync.md`
<!-- adr-global:end -->

## Cross-BC research

<!-- research-global:start -->
<!-- research-global:end -->

## Pointers

- Vision: `vision.md`
- Context map: `context-map.md`
- Protocol (chronological log): `knowledge/protocol.md` — newest entries on top
- All ADRs: `knowledge/decisions/`
- All research: `knowledge/research/`
