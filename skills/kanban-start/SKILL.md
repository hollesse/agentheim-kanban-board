---
name: kanban-start
description: Start the Agentheim Kanban board server for the current project and open it in the browser. Use when the user wants to view the task board, open the kanban board, or start the board server.
---

# kanban-start

Start the Kanban board server and open the browser. Delegates to the
`kanban` CLI via the version-aware dispatch helper — see ADR-0006 and ADR-0009.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
bash "$PLUGIN_ROOT/bin/dispatch.sh" start
```
