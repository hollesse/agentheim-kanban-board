---
name: kanban-open
description: Open the Agentheim Kanban board in the browser. Use when the user wants to view or reopen the board, navigate to the kanban URL, or just open the board without restarting the server.
---

# kanban-open

Open the Kanban board in the browser (server must already be running).
Delegates to the `kanban` CLI (or the in-plugin binary as fallback)
— see ADR-0006.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if command -v kanban >/dev/null 2>&1; then
  kanban open
else
  node "$PLUGIN_ROOT/bin/kanban.js" open
fi
```
