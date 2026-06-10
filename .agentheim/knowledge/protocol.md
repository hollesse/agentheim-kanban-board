# Protocol

Chronological log of everything that happens in this project.
Newest entries on top.

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
