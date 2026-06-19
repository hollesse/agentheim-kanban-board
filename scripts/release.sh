#!/usr/bin/env bash
# scripts/release.sh — bump version in package.json + .claude-plugin/plugin.json,
# commit, annotated-tag, push. The GitHub Actions workflow handles the actual
# npm publish on tag push.
#
# Usage: scripts/release.sh <version>
#   e.g. scripts/release.sh 1.1.0
#        scripts/release.sh 2.0.0-beta.1
#
# Pre-flight checks (fail loud, do nothing):
#   - on branch main
#   - working tree clean
#   - local main in sync with origin/main
#   - tag v<version> doesn't exist (local or remote)
#   - version not already published on npm
#   - version differs from current
#   - npm pack --dry-run succeeds (catches files-allowlist drift)
#
# See ADR-0009 (version sync) and .github/workflows/publish.yml.

set -euo pipefail

# ── colors (only if stdout is a tty) ────────────────────────────────────────
if [ -t 1 ]; then
  RED=$'\e[31m'; GREEN=$'\e[32m'; YELLOW=$'\e[33m'; BOLD=$'\e[1m'; RESET=$'\e[0m'
else
  RED=""; GREEN=""; YELLOW=""; BOLD=""; RESET=""
fi

die()  { echo "${RED}error:${RESET} $*" >&2; exit 1; }
info() { echo; echo "${BOLD}→ $*${RESET}"; }
ok()   { echo "  ${GREEN}✓${RESET} $*"; }

# ── arg parsing ─────────────────────────────────────────────────────────────
[ $# -eq 1 ] || die "usage: $0 <version>  (e.g. 1.1.0, 2.0.0-beta.1)"

VERSION="${1#v}"  # strip leading "v" if user typed v1.1.0
TAG="v$VERSION"

# semver: x.y.z optionally with -pre-release.N or +build metadata
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$ ]]; then
  die "'$VERSION' doesn't look like a semver. Examples: 1.1.0, 2.0.0-beta.1"
fi

# ── locate repo root ────────────────────────────────────────────────────────
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repo"
cd "$REPO_ROOT"

PKG="$REPO_ROOT/package.json"
PLUGIN="$REPO_ROOT/.claude-plugin/plugin.json"
[ -f "$PKG" ]    || die "package.json not found at repo root"
[ -f "$PLUGIN" ] || die ".claude-plugin/plugin.json not found"

# ── pre-flight ──────────────────────────────────────────────────────────────
info "pre-flight"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "main" ] || die "you are on '$BRANCH'. Releases must be cut from main."
ok "branch=main"

[ -z "$(git status --porcelain)" ] || die "working tree has uncommitted changes. Commit or stash first."
ok "working tree clean"

git fetch --quiet origin main
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse '@{u}')
[ "$LOCAL" = "$REMOTE" ] || die "your main is out of sync with origin/main. Pull or push first."
ok "in sync with origin/main"

if git rev-parse --verify --quiet "refs/tags/$TAG" >/dev/null; then
  die "tag $TAG already exists locally."
fi
if git ls-remote --tags origin "$TAG" 2>/dev/null | grep -q "refs/tags/$TAG"; then
  die "tag $TAG already exists on origin."
fi
ok "tag $TAG free"

# best-effort registry lookup; tolerates network/auth issues but won't tolerate a hit
if NPM_RESULT=$(npm view "agentheim-kanban-board@$VERSION" version 2>/dev/null) && [ -n "$NPM_RESULT" ]; then
  die "version $VERSION is already published on npm."
fi
ok "version not yet on npm"

CURRENT=$(node -p "require('./package.json').version")
[ "$VERSION" != "$CURRENT" ] || die "package.json is already at $VERSION."
ok "current=$CURRENT, target=$VERSION"

# ── plan + confirm ──────────────────────────────────────────────────────────
info "release plan"
echo "  bump  package.json:                $CURRENT → $VERSION"
echo "  bump  .claude-plugin/plugin.json:  $CURRENT → $VERSION"
echo "  commit on main"
echo "  tag   $TAG  (annotated)"
echo "  push  origin main --follow-tags"
echo "  → GitHub Action then publishes agentheim-kanban-board@$VERSION to npm"
echo

read -r -p "${YELLOW}proceed?${RESET} [y/N] " REPLY
echo
[[ "$REPLY" =~ ^[Yy]$ ]] || die "aborted."

# ── bump (atomic via node, preserves indentation, trailing newline) ─────────
info "bumping versions"
NEW_VERSION="$VERSION" node -e '
const fs = require("fs");
for (const f of ["package.json", ".claude-plugin/plugin.json"]) {
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  j.version = process.env.NEW_VERSION;
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
}
'

PKG_V=$(node -p    "require('./package.json').version")
PLUGIN_V=$(node -p "require('./.claude-plugin/plugin.json').version")
[ "$PKG_V" = "$VERSION" ] && [ "$PLUGIN_V" = "$VERSION" ] || die "bump verification failed (pkg=$PKG_V, plugin=$PLUGIN_V)"
ok "package.json=$PKG_V, plugin.json=$PLUGIN_V"

# ── tarball sanity ──────────────────────────────────────────────────────────
info "npm pack --dry-run"
if ! npm pack --dry-run >/dev/null 2>&1; then
  # restore JSONs before bailing
  git checkout -- package.json .claude-plugin/plugin.json
  die "npm pack --dry-run failed. Bump reverted. Inspect the package manually."
fi
ok "tarball validates"

# ── commit + tag + push ─────────────────────────────────────────────────────
info "commit, tag, push"
git add package.json .claude-plugin/plugin.json
git commit -m "release: $TAG"
ok "commit created"
git tag -a "$TAG" -m "Release $TAG"
ok "annotated tag $TAG created"
git push origin main --follow-tags
ok "pushed to origin"

# ── done ────────────────────────────────────────────────────────────────────
echo
echo "${GREEN}${BOLD}✓ release $TAG triggered.${RESET}"
echo
echo "  watch:    gh run watch"
echo "  browser:  https://github.com/hollesse/agentheim-kanban-board/actions"
echo "  package:  https://www.npmjs.com/package/agentheim-kanban-board/v/$VERSION"
