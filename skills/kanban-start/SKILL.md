---
name: kanban-start
description: Start the Agentheim Kanban board server for the current project and open it in the browser. Use when the user wants to view the task board, open the kanban board, or start the board server.
---

# kanban-start

Start the Kanban board server and open the browser.

## Steps

1. **Locate the server.** This skill file is at `skills/kanban-start/SKILL.md` inside the plugin directory. The server is at `server.js` in the plugin root — two directories above this file. To get the absolute path, run:
   ```bash
   SKILL_DIR="$(dirname "$(realpath "$0" 2>/dev/null || echo "${BASH_SOURCE[0]}")")"
   ```
   Because Claude Code runs Bash directly (not via a shell script), find the plugin root by checking this skill's location. The server path is `<plugin-root>/server.js`. The plugin root when installed is `~/.claude/plugins/cache/<publisher>/agentheim-kanban-board/<version>/`.

   **Practical approach**: Use the absolute path. When this plugin is installed, find the server by running:
   ```bash
   PLUGIN_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
   SERVER="$PLUGIN_ROOT/server.js"
   ```

2. **Check the lock file.** Look for `.agentheim/.kanban.lock` in the current working directory (the project root where Claude Code is running):
   ```bash
   LOCK=".agentheim/.kanban.lock"
   if [ -f "$LOCK" ]; then
     PID=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).pid))")
     PORT=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).port))")
     if kill -0 "$PID" 2>/dev/null; then
       echo "Kanban board is already running at http://localhost:$PORT (PID $PID)"
       open "http://localhost:$PORT"
       exit 0
     else
       echo "Stale lock file found — cleaning up."
       rm "$LOCK"
     fi
   fi
   ```

3. **Start the server.** Run `node <plugin-root>/server.js` in the background from the project root (CWD must stay as the project root so `.agentheim/` resolves correctly):
   ```bash
   node ~/.claude/plugins/cache/joshuatopfer/agentheim-kanban-board/0.1.0/server.js &
   SERVER_PID=$!
   sleep 1
   ```

4. **Read the port from the lock file** and open the browser:
   ```bash
   LOCK=".agentheim/.kanban.lock"
   if [ -f "$LOCK" ]; then
     PORT=$(node -e "const l=require('fs').readFileSync('$LOCK','utf8'); process.stdout.write(String(JSON.parse(l).port))")
     echo "Kanban board started at http://localhost:$PORT"
     open "http://localhost:$PORT"
   else
     echo "Server started (PID $SERVER_PID) but lock file not yet written — try /kanban-open in a moment."
   fi
   ```

## Important notes

- Always run the server from the **project root** (the directory where `.agentheim/` lives), not from the plugin directory. The server resolves `.agentheim/` relative to `process.cwd()`.
- On macOS use `open <url>`. On Linux use `xdg-open <url>`. On Windows use `start <url>`.
- If the server fails to start, check that Node.js is installed (`node --version`).
