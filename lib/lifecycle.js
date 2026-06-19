'use strict';

/**
 * Lifecycle module for the kanban board server process.
 *
 * Pure helpers (no stdout/stderr formatting, no exit codes) so both
 * the CLI binary and the SKILL.md skills can build on top of it.
 *
 * Responsibilities:
 *  - Read the lock file at `.agentheim/.kanban.lock`
 *  - Check process liveness via `process.kill(pid, 0)`
 *  - Spawn the server detached and poll until it has written its lock
 *  - Stop the server via SIGTERM and clean up stale locks
 *  - Open the board URL in the user's browser, cross-platform
 *
 * Non-responsibilities (kept where they belong):
 *  - Writing the lock file at listen time — that stays in `server.js`
 *    so the write is atomic with the actual port binding (see ADR-0007).
 *  - Port discovery / EADDRINUSE handling — server.js does the increment.
 *
 * Dependencies: Node built-ins only (ADR-0005). No npm.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const LOCK_RELATIVE = path.join('.agentheim', '.kanban.lock');
const START_TIMEOUT_MS = 3000;
const START_POLL_MS = 50;
const STOP_WAIT_MS = 500;
const STOP_POLL_MS = 25;

// ── Path helpers ───────────────────────────────────────────────────────────

function lockPath(root) {
  return path.join(root, LOCK_RELATIVE);
}

// ── Lock I/O ───────────────────────────────────────────────────────────────

/**
 * Read and parse the lock file. Returns `null` if missing or unparseable.
 * Shape: { pid: number, port: number, started: string }.
 */
function readLock(root) {
  const file = lockPath(root);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.pid !== 'number' || typeof parsed.port !== 'number') return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

/**
 * Write the lock file. Called by `server.js` at listen-time so that the
 * write is atomic with the actual port binding. Exposed here so there is
 * exactly one definition of the lock file shape.
 */
function writeLock(root, { pid, port, started }) {
  const file = lockPath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const payload = {
    pid,
    port,
    started: started || new Date().toISOString(),
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
}

function deleteLock(root) {
  const file = lockPath(root);
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (_) {
    // swallow — best-effort cleanup
  }
}

// ── Liveness ───────────────────────────────────────────────────────────────

/**
 * Returns true iff a process with `pid` exists and we may signal it.
 * Uses `process.kill(pid, 0)` which is portable across macOS/Linux/Windows.
 */
function isAlive(pid) {
  if (typeof pid !== 'number' || !Number.isFinite(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM means the process exists but we can't signal it — still "alive"
    if (err && err.code === 'EPERM') return true;
    return false;
  }
}

// ── Browser dispatch ───────────────────────────────────────────────────────

/**
 * Open `url` in the user's default browser. Detached and unref'd so the
 * caller (CLI / skill) can exit immediately.
 */
function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  let args;

  if (platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else if (platform === 'win32') {
    // `start` is a cmd builtin. Empty title argument prevents quoting woes.
    cmd = 'cmd';
    args = ['/c', 'start', '""', url];
  } else {
    // linux, freebsd, openbsd, ...
    cmd = 'xdg-open';
    args = [url];
  }

  try {
    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore',
      shell: false,
    });
    child.on('error', () => { /* best-effort; caller can't recover */ });
    child.unref();
    return true;
  } catch (_) {
    return false;
  }
}

// ── Sleep helper ───────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Status (pure, no side effects) ─────────────────────────────────────────

/**
 * Inspect the lock file and return a structured status.
 *
 *  { running: boolean, pid: number|null, port: number|null,
 *    lockPath: string, stale: boolean }
 *
 * `stale: true` means a lock file exists but the recorded PID is no
 * longer alive — callers may choose to clean it up.
 */
function status({ root }) {
  if (!root) throw new TypeError('status: { root } is required');
  const file = lockPath(root);
  const lock = readLock(root);
  if (!lock) {
    return { running: false, pid: null, port: null, lockPath: file, stale: false };
  }
  if (!isAlive(lock.pid)) {
    return { running: false, pid: lock.pid, port: lock.port, lockPath: file, stale: true };
  }
  return { running: true, pid: lock.pid, port: lock.port, lockPath: file, stale: false };
}

// ── Start ──────────────────────────────────────────────────────────────────

/**
 * Start the server if not already running, then open the browser.
 *
 * Idempotent: if a live server is found via the lock file, the existing
 * pid/port is reused.
 *
 * Returns:
 *   { alreadyRunning: true,  pid, port, opened }   — server was already up
 *   { alreadyRunning: false, pid, port, opened }   — server was spawned
 *
 * Throws if the spawned server fails to write a lock within
 * `START_TIMEOUT_MS` milliseconds.
 */
async function start({ root, serverPath, timeoutMs = START_TIMEOUT_MS, openInBrowser = true }) {
  if (!root) throw new TypeError('start: { root } is required');
  if (!serverPath) throw new TypeError('start: { serverPath } is required');

  // 1. Already running?
  const current = status({ root });
  if (current.running) {
    const opened = openInBrowser ? openBrowser(`http://localhost:${current.port}`) : false;
    return { alreadyRunning: true, pid: current.pid, port: current.port, opened };
  }

  // 2. Stale lock? Clean it up before spawning.
  if (current.stale) deleteLock(root);

  // 3. Spawn server detached.
  const child = spawn(process.execPath, [serverPath], {
    cwd: root,
    detached: true,
    stdio: 'ignore',
  });
  child.on('error', () => { /* error surfaced via timeout below */ });
  child.unref();

  // 4. Poll for the lock file to appear with a live pid.
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const s = status({ root });
    if (s.running) {
      const opened = openInBrowser ? openBrowser(`http://localhost:${s.port}`) : false;
      return { alreadyRunning: false, pid: s.pid, port: s.port, opened };
    }
    await sleep(START_POLL_MS);
  }

  throw new Error(
    `lifecycle.start: server did not become ready within ${timeoutMs}ms ` +
    `(no live lock at ${lockPath(root)})`
  );
}

// ── Stop ───────────────────────────────────────────────────────────────────

/**
 * Stop the running server. Returns:
 *   { stopped: true,  pid }
 *   { stopped: false, reason: 'not-running' | 'stale-lock' | 'kill-failed', pid? }
 *
 * Always best-effort cleans the lock file on a successful stop or when the
 * lock was stale to begin with.
 */
async function stop({ root, waitMs = STOP_WAIT_MS }) {
  if (!root) throw new TypeError('stop: { root } is required');

  const lock = readLock(root);
  if (!lock) {
    return { stopped: false, reason: 'not-running' };
  }

  if (!isAlive(lock.pid)) {
    deleteLock(root);
    return { stopped: false, reason: 'stale-lock', pid: lock.pid };
  }

  try {
    process.kill(lock.pid, 'SIGTERM');
  } catch (err) {
    return { stopped: false, reason: 'kill-failed', pid: lock.pid, error: err.message };
  }

  // Wait briefly for the server's SIGTERM handler to clean up.
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    if (!isAlive(lock.pid)) break;
    await sleep(STOP_POLL_MS);
  }

  // Belt-and-braces: if the server didn't unlink its own lock, do it now.
  if (!isAlive(lock.pid)) deleteLock(root);

  return { stopped: true, pid: lock.pid };
}

// ── Open ───────────────────────────────────────────────────────────────────

/**
 * Open the browser on the running server. Returns:
 *   { opened: true,  port }
 *   { opened: false, reason: 'not-running' | 'stale-lock' | 'spawn-failed', port? }
 */
function open({ root }) {
  if (!root) throw new TypeError('open: { root } is required');
  const s = status({ root });
  if (!s.running) {
    if (s.stale) {
      deleteLock(root);
      return { opened: false, reason: 'stale-lock' };
    }
    return { opened: false, reason: 'not-running' };
  }
  const ok = openBrowser(`http://localhost:${s.port}`);
  if (!ok) return { opened: false, reason: 'spawn-failed', port: s.port };
  return { opened: true, port: s.port };
}

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  // Public API
  start,
  stop,
  status,
  open,
  // Helpers — exported for reuse (server.js) and ad-hoc testing
  lockPath,
  readLock,
  writeLock,
  deleteLock,
  isAlive,
  openBrowser,
};
