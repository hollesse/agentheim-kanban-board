#!/usr/bin/env bash
# bin/dispatch.sh <subcommand>
#
# Version-aware dispatch helper for the kanban plugin skills.
# Invoked by each skill file as:
#   bash "$PLUGIN_ROOT/bin/dispatch.sh" <subcommand>
#
# Behaviour:
#   1. If no global `kanban` on PATH → run bundled binary (no warning)
#   2. If global `kanban` version == plugin version → run global binary
#   3. If global `kanban` version != plugin version → run bundled, warn on stderr
#
# See ADR-0006 (CLI as second delivery surface) and ADR-0009 (version sync).

set -euo pipefail

SUBCOMMAND="${1:?dispatch.sh requires a subcommand argument}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BUNDLED_BIN="$PLUGIN_ROOT/bin/kanban.js"

if command -v kanban >/dev/null 2>&1; then
  GLOBAL_VERSION="$(kanban --version 2>/dev/null || true)"
  PLUGIN_VERSION="$(node -e "process.stdout.write(require('$PLUGIN_ROOT/package.json').version)")"

  if [ "$GLOBAL_VERSION" = "$PLUGIN_VERSION" ]; then
    exec kanban "$SUBCOMMAND"
  else
    echo "warning: kanban: global v${GLOBAL_VERSION} != plugin v${PLUGIN_VERSION}. Using bundled binary." >&2
    echo "  To fix: npm install -g agentheim-kanban-board@${PLUGIN_VERSION}  OR  reinstall the plugin." >&2
    exec node "$BUNDLED_BIN" "$SUBCOMMAND"
  fi
else
  exec node "$BUNDLED_BIN" "$SUBCOMMAND"
fi
