---
name: kanban-status
description: Report the status of the Agentheim Kanban board server. Use when the user asks whether the board is running, what port it is on, or wants a quick health check.
---

# kanban-status

Report whether the Kanban board server is running and on which port.
Delegates to the `kanban` CLI via the version-aware dispatch helper
— see ADR-0006 and ADR-0009.

```bash
PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
bash "$PLUGIN_ROOT/bin/dispatch.sh" status
```
