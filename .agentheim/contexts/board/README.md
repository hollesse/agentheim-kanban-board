# Board

## Purpose
The web application: an HTTP server that reads `.agentheim/contexts/*/` task files from the current repo and serves a Kanban board UI. This is the core context — everything else exists to make this visible.

**Note:** All frontend work in this context depends on the design-system styleguide task being completed and signed off first. No UI is implemented before that gate is open.

## Classification
Core — the primary value of the whole project lives here.

## Actors
- **Developer** — opens the board in a browser to see task status at a glance

## Ubiquitous language
- **Board** — the single-page web view showing all tasks as cards in columns
- **Column** — one of four task states: `backlog`, `todo`, `doing`, `done`; maps directly to a filesystem subdirectory
- **Task card** — the visual representation of one markdown task file on the board
- **Bounded context** — a named group of tasks; appears as a label or tag on cards, not a separate board
- **File reader** — the server-side component that scans `.agentheim/contexts/` and parses task frontmatter
- **Task** — a single markdown file; has a title (H1 or filename), optional frontmatter (type, depends_on), and a description

## Aggregates
- **Task list** — the current state of all tasks read from disk; rebuilt on each request (or on file change if live-reload is added)

## Key events
- `TasksLoaded` — file reader has parsed all task files into a board-ready structure
- `BoardRendered` — HTML/JSON representation of the task list has been served to the browser

## Key commands
- `LoadTasks` — scan `.agentheim/contexts/` and return structured task data
- `ServeBoard` — handle an HTTP request and return the board page or API response

## Relationships with other contexts
- **Downstream of:** plugin — board server lifecycle is managed by plugin skills
- **Conformist to:** Agentheim's published file structure (`.agentheim/contexts/<bc>/<column>/*.md`)
- **Downstream of:** design-system — implements design-system components and tokens

## Open questions
- Show task frontmatter fields (type, depends_on) on the card, or just title?
- Auto-refresh on file change (file watcher), or manual browser reload?
