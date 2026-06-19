---
name: kanban-open
description: Open the Agentheim Kanban board in the browser. Use when the user wants to view or reopen the board, navigate to the kanban URL, or just open the board without restarting the server.
---

# kanban-open

Open the Kanban board in the browser (server must already be running).
Delegates to the `kanban` CLI via the version-aware dispatch helper
— see ADR-0006 and ADR-0009.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
bash "$PLUGIN_ROOT/bin/dispatch.sh" open
```
