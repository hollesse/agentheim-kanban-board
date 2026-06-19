---
name: kanban-stop
description: Stop the Agentheim Kanban board server for the current project. Use when the user wants to stop the board, shut down the server, or kill the kanban process.
---

# kanban-stop

Stop the running Kanban board server. Delegates to the `kanban` CLI
via the version-aware dispatch helper — see ADR-0006 and ADR-0009.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
bash "$PLUGIN_ROOT/bin/dispatch.sh" stop
```
