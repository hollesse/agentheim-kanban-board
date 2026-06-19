---
id: board-003
title: Sort Done column by completion time descending
status: done
type: feature
context: board
created: 2026-06-19
completed: 2026-06-19
commit: 3a88607
depends_on: []
blocks: []
tags: [sorting, done-column]
related_adrs: []
related_research: []
prior_art: []
---

## Why
Tasks that were completed most recently are the most relevant to the developer reviewing the board. Currently the Done column has no guaranteed order, making it harder to see what just finished.

## What
The Done column renders task cards sorted by their `completed` frontmatter field in descending order (newest completion at the top). Tasks with no `completed` date fall to the bottom.

## Acceptance criteria
- [x] Done column cards appear newest-first based on the `completed` frontmatter field
- [x] Tasks without a `completed` date are placed after all dated tasks (stable order among undated tasks)
- [x] Other columns (backlog, todo, doing) are not affected

## Outcome
Extracted sorting logic into `lib/sort-done-column.js` with a pure `sortDoneColumn(tasks)` function. Wired it into `server.js`: `readTasksFromDisk()` now includes the `completed` field on each task object, and `buildHtmlPage()` applies the sort only for the done lane. Five unit tests covering all acceptance criteria added to `test/sort-done-column.test.js`. A `test` script was added to `package.json`.
