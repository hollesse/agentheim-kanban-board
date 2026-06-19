# Protocol

Chronological log of everything that happens in this project.
Newest entries on top.

---

## 2026-06-19 -- Work session ended

**Type:** Work / Session end
**Completed:** 1 ([infrastructure-008] — tag-triggered publish pipeline live)
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Verification:** SKIPPED — same non-standard split as -007 (worker writes workflow, user triggers smoke release by tag push); verified end-to-end via the v1.0.2 smoke run.
**Commits:** 4 (1 worker prep + 1 housekeeping + 1 debug roundtrip + 1 cleanup) + 1 release commit by user
**External effects:** v1.0.2 published live to npm via the new GH Action; tag v1.0.2 on remote; release pipeline now triggers automatically on `v*` tag push.

---

## 2026-06-19 -- Task completed: infrastructure-008 - Tag-triggered GH Action publish

**Type:** Work / Task completion
**Task:** infrastructure-008 - Tag-triggered npm publish via GitHub Actions (OIDC trusted publishing)
**Summary:** `.github/workflows/publish.yml` triggers on `v*` tag push, verifies version sync (tag ↔ package.json ↔ plugin.json), runs `npm pack --dry-run`, and publishes via OIDC Trusted Publishing with provenance attestation. Smoke release v1.0.2 succeeded end-to-end.
**Verification:** SKIPPED — non-standard split
**Commit:** 35477c8 (cleanup of diagnostic step) — see also 06c257d (initial workflow) and 1.0.2 smoke
**Files changed:** 4 (workflow file, root README, ADR-0009 extended, BC README)
**Diagnostic note:** First three attempts (against v1.0.1) failed with a 404 on PUT despite a correct Trusted Publisher config. Root cause: GitHub-hosted runner ships **npm 10.9.8**, but Trusted Publishing requires **npm CLI >= 11.5.1**. Without the upgrade, npm falls back to token-auth, tries the setup-node placeholder token, and the registry returns 404. Workflow now upgrades npm to latest as a permanent step (with comment); diagnostic OIDC claim-dump step removed after the fix landed.
**Smoke release:** v1.0.2 via tag push (https://github.com/hollesse/agentheim-kanban-board/actions/runs/27824262845)
**Published:** https://www.npmjs.com/package/agentheim-kanban-board/v/1.0.2

---

## 2026-06-19 -- Batch started: [infrastructure-008] (prep-only scope)

**Type:** Work / Batch start
**Tasks:** infrastructure-008 - Tag-triggered npm publish via GitHub Actions (worker writes workflow + README + ADR; user does smoke release via tag push)
**Parallel:** no (1 worker)
**Pre-conditions met:** npmjs.com Trusted Publisher configured (workflow `publish.yml`, 2FA + disallow tokens); -007 done; package live on npm.

---

## 2026-06-19 -- Model / Promoted: infrastructure-008 - Tag-triggered GH Action publish

**Type:** Model / Promote
**BC:** infrastructure
**From → To:** backlog → todo → doing (work started immediately)

---

## 2026-06-19 -- Work session ended

**Type:** Work / Session end
**Completed:** 1 ([infrastructure-007] — published live to npm as v1.0.0)
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Verification:** SKIPPED — non-standard split task; user handled the npm publish step, orchestrator verified by inspection (npm pack --dry-run, post-publish smoke via npx)
**Commits:** 2 (1 prep + 1 housekeeping)
**External effects:** `agentheim-kanban-board@1.0.0` published to npmjs.com; tag `v1.0.0` pushed to GitHub.

---

## 2026-06-19 -- Task completed: infrastructure-007 - First npm publish

**Type:** Work / Task completion
**Task:** infrastructure-007 - First npm publish: ship agentheim-kanban-board to the registry
**Summary:** Package live at https://www.npmjs.com/package/agentheim-kanban-board as v1.0.0. Files allowlist verified via `npm pack --dry-run` (6 files, 12.5 kB). Post-publish smoke: `npx agentheim-kanban-board --version` → 1.0.0; `npx … status` in temp .agentheim project → "not running" exit 1, as spec'd. Git tag v1.0.0 pushed.
**Verification:** SKIPPED — non-standard split (worker did prep only, user did publish, orchestrator did post-publish smoke + tag)
**Commit:** 4296935 (prep) + housekeeping
**Files changed:** 4 (package.json, README.md, contexts/infrastructure/README.md, ADR-0009)
**ADRs written:** 0009-version-sync.md
**Published:** https://www.npmjs.com/package/agentheim-kanban-board (v1.0.0)
**Git tag:** v1.0.0

---

## 2026-06-19 -- Batch started: [infrastructure-007] (prep-only scope)

**Type:** Work / Batch start
**Tasks:** infrastructure-007 - First npm publish (prep portion only — npm publish itself stays with the user for 2FA-OTP interaction)
**Parallel:** no (1 worker)
**Pre-flight:** npm whoami=hollesse ✓; npm view agentheim-kanban-board=E404 (name free, no scope fallback needed)

---

## 2026-06-19 -- Model / Captured: infrastructure-008 - Tag-triggered GH Action publish

**Type:** Model / Capture
**BC:** infrastructure
**Filed to:** backlog
**Summary:** Follow-on zu infrastructure-007: nach dem manuellen Erstpublish ein GitHub-Actions-Workflow, der auf `git push v*`-Tag triggert und via npm Trusted Publishing (OIDC, kein Token-Secret) publiziert — inkl. Provenance-Attestation. depends_on: [infrastructure-007]; -007 hat blocks: [infrastructure-008] erhalten. Pre-Setup auf npmjs.com (Trusted-Publisher-Eintrag) ist ein manueller Schritt vor Worker-Start.

---

## 2026-06-19 -- Model / Refined + Promoted: infrastructure-007 - First npm publish

**Type:** Model / Refine + Promote
**BC:** infrastructure
**Status after:** todo
**Summary:** Architect-Refinement der 5 offenen Punkte: (1) `files`-Allowlist mit 5 expliziten Pfaden statt `.npmignore`-Denylist; (2) manuelle Versions-Sync-Konvention via ADR-0009, kein Hook; (3) interaktives 2FA-OTP, Fallback `@hollesse/agentheim-kanban-board` falls Name belegt; (4) direkt `latest` mit `npm pack --dry-run`-Gate; (5) README-CLI-Sektion umstrukturieren (npm primär, from-source sekundär). Plus: `prepublishOnly`-Script, `repository`/`bugs`/`homepage`-Felder. Direkt nach todo promoted — todo-ready, alle externen Unknowns von der Worker-Outline mit Eskalation abgefangen.
**ADRs to write while implementing:** 0009-version-sync.md (global scope)

---

## 2026-06-19 -- Model / Captured: infrastructure-007 - First npm publish

**Type:** Model / Capture
**BC:** infrastructure
**Filed to:** backlog
**Summary:** Erstmaliges Veröffentlichen von `agentheim-kanban-board` auf npm, damit `npm install -g agentheim-kanban-board` der offizielle Install-Pfad wird. Geht ins backlog — offene Entscheidungen: Tarball-Scope (`files`-Allowlist), Versions-Koordination zwischen `package.json` und `.claude-plugin/plugin.json`, Auth-Workflow (2FA + Name-Verfügbarkeitscheck), README-Erweiterung um den zweiten Install-Pfad.

---

## 2026-06-19 -- Work session ended

**Type:** Work / Session end
**Completed:** 1 (first-try PASS: 1 [plugin-002]) + 1 tracker closed (infrastructure-004)
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Commits:** 2 (1 task + 1 housekeeping)
**CLI introduction complete:** infrastructure-004 tracker closed; all three subtasks (-005 lifecycle module, -006 CLI binary, plugin-002 skills migration) done.

---

## 2026-06-19 -- Tracker closed: infrastructure-004 - CLI entry point

**Type:** Work / Tracker closure
**Task:** infrastructure-004 - CLI entry point (parent tracker)
**Summary:** All three decomposition children landed: lib/lifecycle.js (b0cba5f), bin/kanban.js + package.json (86d44a4), skills migrated to hybrid dispatch (7387288). Moved to done/ with the final child's commit SHA stamped.

---

## 2026-06-19 -- Task verified and completed: plugin-002 - Skills call CLI dispatcher (hybrid)

**Type:** Work / Task completion
**Task:** plugin-002 - Migrate skills to call CLI dispatcher (hybrid local/global)
**Summary:** All four kanban skill bodies collapsed to a ~7-line hybrid block (`command -v kanban` → CLI; else fallback to `node $PLUGIN_ROOT/bin/kanban.js`). 148 lines of duplicated lock-file bash removed. Frontmatter preserved byte-for-byte.
**Verification:** PASS (iteration 1)
**Commit:** 7387288
**Files changed:** 5
**ADRs written:** none

---

## 2026-06-19 -- Batch started: [plugin-002]

**Type:** Work / Batch start
**Tasks:** plugin-002 - Migrate skills to call CLI dispatcher (hybrid local/global)
**Parallel:** no (1 worker)

---

## 2026-06-19 -- Model / Promoted: plugin-002 - Skills call CLI dispatcher

**Type:** Model / Promote
**BC:** plugin
**From → To:** backlog → todo → doing (work started immediately)

---

## 2026-06-19 -- Model / Refined: plugin-002 - Skills call CLI dispatcher

**Type:** Model / Refine
**BC:** plugin
**Status after:** backlog (ready to promote)
**Summary:** Pure-Pfad-Aufruf zu Hybrid-Dispatch erweitert: `command -v kanban` zuerst prüfen, sonst Fallback auf `node $PLUGIN_ROOT/bin/kanban.js`. Gibt Plugin-Usern weiterhin Zero-Install, Terminal-Usern automatisch die saubere `kanban`-Erfahrung bei globaler Installation. Auto-Install im Skill explizit ausgeschlossen (AV/sudo/Orphan-Risiken, untergräbt ADR-0005). related_adrs ergänzt um 0006.
**ADRs written:** none

---

## 2026-06-19 -- Work session ended

**Type:** Work / Session end
**Completed:** 1 (first-try PASS: 1 [infrastructure-006])
**Bounced:** 0
**Failed:** 0
**Escalated after verification:** 0
**Commits:** 1
**Next unblocked:** plugin-002 (still in backlog — promote via `model` to dispatch)

---

## 2026-06-19 -- Task verified and completed: infrastructure-006 - CLI binary

**Type:** Work / Task completion
**Task:** infrastructure-006 - CLI binary `kanban` with package.json + bin entry
**Summary:** bin/kanban.js dispatches start/stop/status/open via lib/lifecycle.js; package.json with bin entry + empty deps preserves ADR-0005's zero-install posture (ADR-0008 amends, does not supersede). Smoke-tested: --version, --help, status exit 1 when not running.
**Verification:** PASS (iteration 1)
**Commit:** 86d44a4
**Files changed:** 7
**ADRs written:** 0006-cli-second-delivery-surface.md, 0008-packaging-bin-zero-deps.md

---

## 2026-06-19 -- Batch started: [infrastructure-006]

**Type:** Work / Batch start
**Tasks:** infrastructure-006 - CLI binary `kanban` with package.json + bin entry
**Parallel:** no (1 worker)

---

## 2026-06-19 -- Model / Promoted: infrastructure-006 - CLI binary

**Type:** Model / Promote
**BC:** infrastructure
**From → To:** backlog → todo

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
