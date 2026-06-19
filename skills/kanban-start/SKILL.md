---
name: kanban-start
description: Start the Agentheim Kanban board server for the current project and open it in the browser. Use when the user wants to view the task board, open the kanban board, or start the board server.
---

# kanban-start

Start the Kanban board server and open the browser. Delegates to the
`kanban` CLI (or the in-plugin binary as fallback) — see ADR-0006.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if command -v kanban >/dev/null 2>&1; then
  kanban start
else
  node "$PLUGIN_ROOT/bin/kanban.js" start
fi
```
