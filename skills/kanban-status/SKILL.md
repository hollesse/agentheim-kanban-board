---
name: kanban-status
description: Report the status of the Agentheim Kanban board server. Use when the user asks whether the board is running, what port it is on, or wants a quick health check.
---

# kanban-status

Report whether the Kanban board server is running and on which port.
Delegates to the `kanban` CLI (or the in-plugin binary as fallback)
— see ADR-0006.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if command -v kanban >/dev/null 2>&1; then
  kanban status
else
  node "$PLUGIN_ROOT/bin/kanban.js" status
fi
```
