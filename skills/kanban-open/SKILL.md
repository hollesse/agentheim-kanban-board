---
name: kanban-open
description: Open the Agentheim Kanban board in the browser. Use when the user wants to view or reopen the board, navigate to the kanban URL, or just open the board without restarting the server.
---

# kanban-open

Open the Kanban board in the browser (server must already be running).

## Steps

1. **Read the lock file:**
   ```bash
   LOCK=".agentheim/.kanban.lock"
   if [ ! -f "$LOCK" ]; then
     echo "No lock file found — run /kanban-start first."
     exit 1
   fi
   PID=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).pid))")
   PORT=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).port))")
   ```

2. **Verify the server is alive:**
   ```bash
   if ! kill -0 "$PID" 2>/dev/null; then
     echo "Server process $PID is not running. Use /kanban-start to start it."
     exit 1
   fi
   ```

3. **Open in browser:**
   ```bash
   echo "Opening http://localhost:$PORT"
   open "http://localhost:$PORT"
   ```

## Notes

- On macOS use `open <url>`. On Linux use `xdg-open <url>`. On Windows use `start <url>`.
- If the server is not running, use `/kanban-start` instead.
