---
name: kanban-status
description: Report the status of the Agentheim Kanban board server. Use when the user asks whether the board is running, what port it is on, or wants a quick health check.
---

# kanban-status

Report whether the Kanban board server is running and on which port.

## Steps

1. **Check for lock file:**
   ```bash
   LOCK=".agentheim/.kanban.lock"
   if [ ! -f "$LOCK" ]; then
     echo "Kanban board: NOT running (no lock file at $LOCK)"
     exit 0
   fi
   ```

2. **Parse lock file:**
   ```bash
   PID=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).pid))")
   PORT=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).port))")
   STARTED=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(JSON.parse(l).started)")
   ```

3. **Check liveness and report:**
   ```bash
   if kill -0 "$PID" 2>/dev/null; then
     echo "Kanban board: RUNNING"
     echo "  URL:     http://localhost:$PORT"
     echo "  PID:     $PID"
     echo "  Started: $STARTED"
   else
     echo "Kanban board: NOT running (stale lock file — PID $PID no longer alive)"
     echo "  Use /kanban-start to start the server."
   fi
   ```
