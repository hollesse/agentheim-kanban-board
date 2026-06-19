# Protocol

Chronological log of everything that happens in this project.
Newest entries on top.

---

## 2026-06-19 -- Work session ended

**Type:** Work / Session end
**Completed:** 1 (first-try PASS: 1 [infrastructure-005])
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Commits:** 1
**Next unblocked:** infrastructure-006 (still in backlog — promote via `model` to dispatch)

---

## 2026-06-19 -- Task verified and completed: infrastructure-005 - Extract lifecycle module

**Type:** Work / Task completion
**Task:** infrastructure-005 - Extract lifecycle module (lib/lifecycle.js)
**Summary:** lib/lifecycle.js extracted with start/stop/status/open + lock/browser helpers (built-ins only). server.js delegates lock-write shape but still owns the atomic listen-time write. Cross-platform browser-open (darwin/linux/win32) ships. ADR-0007 documents the contract.
**Verification:** PASS (iteration 1)
**Commit:** b0cba5f
**Files changed:** 4
**ADRs written:** 0007-lifecycle-module.md

---

## 2026-06-19 -- Batch started: [infrastructure-005]

**Type:** Work / Batch start
**Tasks:** infrastructure-005 - Extract lifecycle module (lib/lifecycle.js)
**Parallel:** no (1 worker)

---

## 2026-06-19 -- Model / Refined: infrastructure-004 - CLI entry point

**Type:** Model / Refine
**BC:** infrastructure (split crosses into plugin)
**Status after:** backlog (tracker — decomposed)
**Summary:** Architect-Refinement. Packaging-Tension mit ADR-0005 aufgelöst (package.json mit leeren Deps ergänzt ADR-0005, kein Supersede). Lifecycle-Logik wird in `lib/lifecycle.js` extrahiert, Skills delegieren künftig an die CLI-Binary `kanban`. npm-Name `agentheim-kanban-board`, Publish-Scope: nur npm-link-ready.
**Split into:** infrastructure-005 (lib/lifecycle.js, todo), infrastructure-006 (CLI-Binary, backlog, depends on -005), plugin-002 (Skills → CLI delegieren, backlog, depends on -005 + -006)
**ADRs written:** none yet — 0006/0007/0008 werden beim Implementieren der jeweiligen Sub-Tasks geschrieben

---

## 2026-06-19 -- Model / Captured: infrastructure-004 - CLI entry point

**Type:** Model / Capture
**BC:** infrastructure
**Filed to:** backlog
**Summary:** CLI-Binary, das die vier Kanban-Skills (start/stop/status/open) parallel zu Claude Code aus dem Terminal aufrufbar macht. Geht ins backlog, weil offen ist: Packaging-Strategie (kollidiert mit ADR-0005), Distribution/Naming, Code-Sharing mit den Skills (Lifecycle-Logik aus SKILL.md in Node-Modul ziehen), cross-platform Browser-Open.

---

## 2026-06-10 -- Task verified and completed: plugin-001 - Project README

**Type:** Work / Task completion
**Task:** plugin-001 - Project README — what it is, how to install and update
**Summary:** README.md created at project root: purpose, prerequisites, installation, all four skills, update command, .agentheim/ path note.
**Verification:** PASS (iteration 1)
**Commit:** 52eff28
**Files changed:** 1
**ADRs written:** none

---

## 2026-06-10 -- Work session ended

**Type:** Work / Session end
**Completed:** 2 (first-try PASS: 1 [plugin-001], orchestrator-fixed: 1 [infrastructure-003])
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Commits:** 2 (+ 2 housekeeping commits)

---

## 2026-06-10 -- Task verified and completed: infrastructure-003 - First release

**Type:** Work / Task completion
**Task:** infrastructure-003 - First release: version bump to 1.0.0 and git tag
**Summary:** version in .claude-plugin/plugin.json bumped to 1.0.0; annotated tag agentheim-kanban-board--v1.0.0 created pointing at HEAD. Note: tag was recreated by orchestrator after a housekeeping commit moved HEAD; verifier FAIL was a legitimate procedural issue, fixed directly.
**Verification:** PASS (orchestrator-fixed after verifier FAIL)
**Commit:** 6972e22
**Files changed:** 1
**ADRs written:** none

---

## 2026-06-10 -- Batch started: [plugin-001]

**Type:** Work / Batch start
**Tasks:** plugin-001 - Project README — what it is, how to install and update
**Parallel:** no (1 worker)

---

## 2026-06-10 -- Batch started: [infrastructure-003]

**Type:** Work / Batch start
**Tasks:** infrastructure-003 - First release: version bump to 1.0.0 and git tag
**Parallel:** no (1 worker)

---

## 2026-06-10 -- Task verified and completed: board-001 - Task detail page

**Type:** Work / Task completion
**Task:** board-001 - Task detail page
**Summary:** /task/:id route added; board cards are now links; detail page renders markdown body with headings/lists/bold/checkboxes using design-system tokens; 404 for unknown ids.
**Verification:** PASS (iteration 1)
**Commit:** 85ebac1
**Files changed:** 1
**ADRs written:** none

---

## 2026-06-10 -- Model / Captured: infrastructure-003, plugin-001 - Release + README

**Type:** Model / Capture
**BC:** infrastructure (infrastructure-003), plugin (plugin-001)
**Filed to:** todo
**Summary:** infrastructure-003 bumpt Version auf 1.0.0 und setzt den Git-Tag für das erste Release. plugin-001 erstellt die README.md mit Installations- und Update-Anleitung; hängt von infrastructure-003 ab damit die Versionsnummer korrekt ist.

---

## 2026-06-10 -- Task verified and completed: board-002 - Structured frontmatter display

**Type:** Work / Task completion
**Task:** board-002 - Structured frontmatter display on detail page
**Summary:** Detail page now shows type badge, coloured status badge, context label, depends_on as /task/<id> links, created/completed dates. Empty fields suppressed. Verification iteration 1 was false-positive (orchestrator uncommitted changes in diff); iteration 2 PASS.
**Verification:** PASS (iteration 2 — iteration 1 false-positive)
**Commit:** 663a439
**Files changed:** 1
**ADRs written:** none

---

## 2026-06-10 -- Work session ended

**Type:** Work / Session end
**Completed:** 2 (first-try PASS: 1 [board-001], re-dispatched: 1 [board-002 false-positive], skipped: 0)
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Commits:** 2

---

## 2026-06-10 -- Batch started: [board-002]

**Type:** Work / Batch start
**Tasks:** board-002 - Structured frontmatter display on detail page
**Parallel:** no (1 worker)

---

## 2026-06-10 -- Batch started: [board-001]

**Type:** Work / Batch start
**Tasks:** board-001 - Task detail page
**Parallel:** no (1 worker)

---

## 2026-06-10 -- Model / Captured: board-001, board-002 - Task detail page + Frontmatter display

**Type:** Model / Capture
**BC:** board
**Filed to:** todo
**Summary:** Zwei Tasks für die Task-Detailansicht: board-001 fügt eine klickbare `/task/<id>`-Route hinzu mit gerenderten Markdown-Body; board-002 ergänzt strukturierte Frontmatter-Felder (Typ, Status, depends_on als Links) im Metadaten-Bereich.

---

## 2026-06-10 -- Design system sign-off: design-system-001

**Type:** Gate / Developer approval
**Gate:** design-system-001 styleguide approved by developer (2026-06-10)
**Effect:** Frontend feature tasks in board BC (and any other BC with UI) may now be promoted to todo.

---

## 2026-06-10 -- Task verified and completed: design-system-001 - Styleguide

**Type:** Work / Task completion
**Task:** design-system-001 - Styleguide: tokens, components, and developer sign-off gate
**Summary:** Dark-mode design system: CSS custom property tokens, component styles for card/column/badge/empty-state, standalone styleguide.html for developer review, board server updated with full design inline. Awaiting developer sign-off before board BC frontend work begins.
**Verification:** PASS (iteration 1)
**Commit:** 02d867b
**Files changed:** 4
**ADRs written:** none

---

## 2026-06-10 -- Work session ended

**Type:** Work / Session end
**Completed:** 3 (first-try PASS: 3, re-dispatched: 0, skipped: 0)
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Commits:** 3

---

## 2026-06-10 -- Batch started: [design-system-001]

**Type:** Work / Batch start
**Tasks:** design-system-001 - Styleguide: tokens, components, and developer sign-off gate
**Parallel:** no (1 worker)

---

## 2026-06-10 -- Task verified and completed: infrastructure-002 - Walking skeleton

**Type:** Work / Task completion
**Task:** infrastructure-002 - Walking skeleton: thin end-to-end slice — server starts, reads .agentheim/, returns board page
**Summary:** Zero-dependency Node.js HTTP server on port 3131, lock file lifecycle, four Claude Code skill stubs, plugin manifest. All acceptance criteria confirmed live.
**Verification:** PASS (iteration 1)
**Commit:** 238e5ea
**Files changed:** 7
**ADRs written:** none

---

## 2026-06-10 -- Batch started: [infrastructure-002]

**Type:** Work / Batch start
**Tasks:** infrastructure-002 - Walking skeleton: thin end-to-end slice — server starts, reads .agentheim/, returns board page
**Parallel:** no (1 worker)

---

## 2026-06-10 -- Task verified and completed: infrastructure-001 - Stack decision

**Type:** Work / Task completion
**Task:** infrastructure-001 - Stack decision: runtime, server framework, frontend delivery, process lifecycle, plugin packaging
**Summary:** Five global ADRs (0001-0005) written: Node.js built-in http, single inline HTML frontend, JSON lock file process lifecycle, read-on-demand file strategy, zero-dependency server.js packaging.
**Verification:** PASS (iteration 1)
**Commit:** 5813ee6
**Files changed:** 7
**ADRs written:** 0001, 0002, 0003, 0004, 0005

---

## 2026-06-10 -- Batch started: [infrastructure-001]

**Type:** Work / Batch start
**Tasks:** infrastructure-001 - Stack decision: runtime, server framework, frontend delivery, process lifecycle, plugin packaging
**Parallel:** no (1 worker)

---

## 2026-06-10 -- Brainstorm: Agentheim Kanban Board

**Type:** Brainstorm
**Outcome:** vision created
**BCs identified:** plugin, board, infrastructure, design-system
**Summary:** The project is a Claude Code plugin that starts a local web server serving a read-only Kanban board over the Agentheim task file structure. The board shows all tasks across all bounded contexts in four columns (backlog, todo, doing, done). The developer interacts via `/kanban-start`, `/kanban-stop`, `/kanban-open`, `/kanban-status` slash commands. The core motivation is friction reduction: the developer doesn't open markdown files often enough, leading to worse outcomes. Architecture foundation: Node.js built-in http only, single inline HTML file frontend, lock file for process lifecycle, read-on-demand (no file watcher in v1), single `server.js` with no npm dependencies.
**ADRs written:** none (decisions deferred to task queue as type: decision)
**Foundation tasks emitted:** infrastructure-001 (stack decision, 5 ADR drafts in Notes), infrastructure-002 (walking skeleton, depends on infrastructure-001), design-system-001 (styleguide, depends on infrastructure-002)

---
