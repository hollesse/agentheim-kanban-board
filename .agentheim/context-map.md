# Context map

## Contexts

### plugin
- **Purpose:** Claude Code integration layer — defines the skill files (slash commands) that start, stop, and open the board server
- **Core language:** skill, slash command, plugin manifest, server process
- **Classification:** supporting
- **Key actors:** developer (invoking slash commands), Claude Code (executing skills)

### board
- **Purpose:** The web application — HTTP server that reads `.agentheim/` task files from the current repo and serves the Kanban board UI
- **Core language:** board, column, task card, HTTP server, file reader
- **Classification:** core
- **Key actors:** developer (viewing in browser)

### infrastructure
- **Purpose:** Cross-cutting technical concerns: runtime, build tooling, process lifecycle, deployment topology
- **Core language:** process, server lifecycle, build, dependency
- **Classification:** supporting
- **Key actors:** none (concerns, not actors)

### design-system
- **Purpose:** Visual language for the board UI: tokens, component library, layout patterns
- **Core language:** token, component, style, typography, colour palette
- **Classification:** supporting
- **Key actors:** developer (reviewing and approving the design before frontend work begins)

## Relationships

- **plugin → board**: plugin is upstream supplier; its skills manage the board server's lifecycle (start/stop). Relationship: customer-supplier.
- **board → filesystem**: board reads `.agentheim/contexts/` directly; conforms to the Agentheim folder convention. Relationship: conformist to Agentheim's published file structure.
- **board → design-system**: board's frontend implements the design-system's components and tokens. Relationship: conformist (downstream).
- **infrastructure → plugin, board**: provides the shared runtime and build environment both BCs depend on. Relationship: shared kernel (runtime and tooling).
