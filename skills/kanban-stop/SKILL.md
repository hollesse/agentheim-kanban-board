---
name: kanban-stop
description: Stop the Agentheim Kanban board server for the current project. Use when the user wants to stop the board, shut down the server, or kill the kanban process.
---

# kanban-stop

Stop the running Kanban board server.

## Steps

1. **Read the lock file.** Check `.agentheim/.kanban.lock` in the current working directory:
   ```bash
   LOCK=".agentheim/.kanban.lock"
   if [ ! -f "$LOCK" ]; then
     echo "No lock file found — the Kanban board does not appear to be running."
     exit 0
   fi
   PID=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).pid))")
   PORT=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).port))")
   ```

2. **Check liveness and kill:**
   ```bash
   if kill -0 "$PID" 2>/dev/null; then
     kill "$PID"
     echo "Kanban board server (PID $PID, port $PORT) stopped."
   else
     echo "Process $PID is not running (stale lock file)."
   fi
   ```

3. **Delete the lock file:**
   ```bash
   rm -f "$LOCK"
   echo "Lock file removed."
   ```
