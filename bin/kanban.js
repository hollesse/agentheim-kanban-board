#!/usr/bin/env node
'use strict';

/**
 * `kanban` — CLI binary for the Agentheim kanban board.
 *
 * Thin dispatcher over `lib/lifecycle.js`. The lifecycle module is pure
 * (data in, data out); this file owns the CLI concerns: argv parsing,
 * stdout/stderr formatting, and exit codes.
 *
 * Operates on `.agentheim/` in the current working directory — invoke
 * `kanban` *inside* an Agentheim project.
 *
 * See ADR-0006 (CLI as second delivery surface) and ADR-0008 (packaging).
 */

const path = require('node:path');
const fs = require('node:fs');

const lifecycle = require(path.resolve(__dirname, '..', 'lib', 'lifecycle.js'));

const SERVER_PATH = path.resolve(__dirname, '..', 'server.js');
const PKG_PATH = path.resolve(__dirname, '..', 'package.json');

function readVersion() {
  try {
    const raw = fs.readFileSync(PKG_PATH, 'utf8');
    const pkg = JSON.parse(raw);
    return pkg.version || 'unknown';
  } catch (_) {
    return 'unknown';
  }
}

function printUsage(stream) {
  const out = stream || process.stdout;
  out.write(
    [
      'Usage: kanban <command>',
      '',
      'Commands:',
      '  start       Start the kanban board server and open it in the browser',
      '  stop        Stop the running kanban board server',
      '  status      Report whether the server is running (exit 0 = running, 1 = not)',
      '  open        Open the board in the browser (server must already be running)',
      '  help        Show this help message',
      '',
      'Options:',
      '  -h, --help     Show this help message',
      '  -v, --version  Print the CLI version',
      '',
      'The CLI operates on `.agentheim/` in the current working directory.',
      'It shares its lock file with the slash-command skills — starting via',
      'one surface and stopping via the other works fine.',
      '',
    ].join('\n')
  );
}

async function cmdStart(root) {
  try {
    const result = await lifecycle.start({ root, serverPath: SERVER_PATH });
    const url = `http://localhost:${result.port}`;
    if (result.alreadyRunning) {
      process.stdout.write(`Kanban board is already running at ${url} (PID ${result.pid})\n`);
    } else {
      process.stdout.write(`Kanban board running at ${url} (PID ${result.pid})\n`);
    }
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Failed to start kanban board: ${err.message}\n`);
    process.exit(1);
  }
}

async function cmdStop(root) {
  const result = await lifecycle.stop({ root });
  if (result.stopped) {
    process.stdout.write(`Stopped Kanban board (was PID ${result.pid})\n`);
    process.exit(0);
  }
  switch (result.reason) {
    case 'not-running':
      process.stdout.write('Kanban board is not running\n');
      process.exit(0);
      break;
    case 'stale-lock':
      process.stdout.write(`Cleaned stale lock file (PID ${result.pid} was no longer alive)\n`);
      process.exit(0);
      break;
    case 'kill-failed':
      process.stderr.write(
        `Failed to stop server (PID ${result.pid}): ${result.error || 'unknown error'}\n`
      );
      process.exit(1);
      break;
    default:
      process.stderr.write(`Failed to stop server: ${result.reason}\n`);
      process.exit(1);
  }
}

function cmdStatus(root) {
  const s = lifecycle.status({ root });
  if (s.running) {
    process.stdout.write(
      `Kanban board is running at http://localhost:${s.port} (PID ${s.pid})\n`
    );
    process.exit(0);
  }
  if (s.stale) {
    process.stdout.write(
      `Kanban board is not running (stale lock at ${s.lockPath}, PID ${s.pid} no longer alive)\n`
    );
    process.exit(1);
  }
  process.stdout.write('Kanban board is not running\n');
  process.exit(1);
}

function cmdOpen(root) {
  const result = lifecycle.open({ root });
  if (result.opened) {
    process.stdout.write(`Opened http://localhost:${result.port}\n`);
    process.exit(0);
  }
  switch (result.reason) {
    case 'not-running':
      process.stderr.write('Kanban board is not running. Run `kanban start` first.\n');
      process.exit(1);
      break;
    case 'stale-lock':
      process.stderr.write('Cleaned stale lock file. Run `kanban start`.\n');
      process.exit(1);
      break;
    case 'spawn-failed':
      process.stderr.write(
        `Failed to open browser (port ${result.port}). Open http://localhost:${result.port} manually.\n`
      );
      process.exit(1);
      break;
    default:
      process.stderr.write(`Failed to open browser: ${result.reason}\n`);
      process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd) {
    printUsage(process.stderr);
    process.exit(2);
  }

  if (cmd === '-h' || cmd === '--help' || cmd === 'help') {
    printUsage(process.stdout);
    process.exit(0);
  }

  if (cmd === '-v' || cmd === '--version') {
    process.stdout.write(`${readVersion()}\n`);
    process.exit(0);
  }

  const root = process.cwd();

  switch (cmd) {
    case 'start':
      await cmdStart(root);
      return;
    case 'stop':
      await cmdStop(root);
      return;
    case 'status':
      cmdStatus(root);
      return;
    case 'open':
      cmdOpen(root);
      return;
    default:
      process.stderr.write(`Unknown command: ${cmd}\n`);
      printUsage(process.stderr);
      process.exit(2);
  }
}

main().catch(err => {
  process.stderr.write(`kanban: unexpected error: ${err && err.stack ? err.stack : err}\n`);
  process.exit(1);
});
