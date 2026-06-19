---
name: kanban-stop
description: Stop the Agentheim Kanban board server for the current project. Use when the user wants to stop the board, shut down the server, or kill the kanban process.
---

# kanban-stop

Stop the running Kanban board server. Delegates to the `kanban` CLI
(or the in-plugin binary as fallback) — see ADR-0006.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if command -v kanban >/dev/null 2>&1; then
  kanban stop
else
  node "$PLUGIN_ROOT/bin/kanban.js" stop
fi
```
