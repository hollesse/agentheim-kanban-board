'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const PLUGIN_ROOT = path.resolve(__dirname, '..');
const DISPATCH_SH = path.join(PLUGIN_ROOT, 'bin', 'dispatch.sh');
const PLUGIN_VERSION = require(path.join(PLUGIN_ROOT, 'package.json')).version;

/**
 * Create a temporary directory with a fake `kanban` stub binary that
 * returns the given version string on `--version`.
 */
function makeFakeKanbanBin(tmpDir, version) {
  const fakeBin = path.join(tmpDir, 'kanban');
  fs.writeFileSync(
    fakeBin,
    `#!/usr/bin/env bash\nif [ "$1" = "--version" ]; then echo "${version}"; exit 0; fi\necho "stub:$1"\n`,
  );
  fs.chmodSync(fakeBin, 0o755);
  return fakeBin;
}

/**
 * Run dispatch.sh with a controlled PATH. Returns { status, stdout, stderr }.
 */
function runDispatch(subcommand, envOverrides = {}) {
  const result = spawnSync('bash', [DISPATCH_SH, subcommand], {
    encoding: 'utf8',
    env: { ...process.env, ...envOverrides },
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

test('dispatch: no global kanban on PATH → runs bundled binary, no warning', () => {
  // Use a PATH that has no kanban binary (just /usr/bin for basic shell tools)
  const result = runDispatch('status', {
    PATH: '/usr/bin:/bin',
    // Prevent the bundled binary from actually starting a server — just test dispatch
    // We test that the bundled node binary is invoked by catching its output/error
    // The bundled bin will fail without an .agentheim dir, but dispatch itself should not warn.
  });

  // No version-mismatch warning should appear on stderr
  assert.ok(
    !result.stderr.includes('global v'),
    `Expected no version-mismatch warning, got stderr: ${result.stderr}`,
  );
});

test('dispatch: global kanban version matches plugin version → global binary used, no warning', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-test-'));
  try {
    makeFakeKanbanBin(tmpDir, PLUGIN_VERSION);
    const result = runDispatch('status', {
      PATH: `${tmpDir}:${process.env.PATH}`,
    });

    // No version-mismatch warning
    assert.ok(
      !result.stderr.includes('global v'),
      `Expected no warning on version match, got stderr: ${result.stderr}`,
    );
    // Stub echoes "stub:<subcommand>" to stdout
    assert.ok(
      result.stdout.includes('stub:status'),
      `Expected global stub output, got stdout: ${result.stdout}`,
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('dispatch: global kanban version differs → bundled binary used, warning on stderr', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-test-'));
  try {
    const differentVersion = '0.0.1';
    makeFakeKanbanBin(tmpDir, differentVersion);
    const result = runDispatch('status', {
      PATH: `${tmpDir}:${process.env.PATH}`,
    });

    // Warning should be on stderr
    assert.ok(
      result.stderr.includes(`global v${differentVersion}`),
      `Expected global version in warning, got stderr: ${result.stderr}`,
    );
    assert.ok(
      result.stderr.includes(`plugin v${PLUGIN_VERSION}`),
      `Expected plugin version in warning, got stderr: ${result.stderr}`,
    );
    // Warning should mention both fix paths
    assert.ok(
      result.stderr.includes('npm install -g agentheim-kanban-board'),
      `Expected npm fix path in warning, got stderr: ${result.stderr}`,
    );
    assert.ok(
      result.stderr.includes('reinstall the plugin'),
      `Expected plugin reinstall path in warning, got stderr: ${result.stderr}`,
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('dispatch: mismatch warning goes to stderr only, not stdout', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-test-'));
  try {
    makeFakeKanbanBin(tmpDir, '0.0.1');
    const result = runDispatch('status', {
      PATH: `${tmpDir}:${process.env.PATH}`,
    });

    assert.ok(
      !result.stdout.includes('warning'),
      `Warning must not appear on stdout, got stdout: ${result.stdout}`,
    );
    assert.ok(
      result.stderr.includes('warning'),
      `Warning must appear on stderr, got stderr: ${result.stderr}`,
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('dispatch: version comparison is exact string equality', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dispatch-test-'));
  try {
    // Use a semver that would pass a ^ range but should fail exact match
    const [major] = PLUGIN_VERSION.split('.');
    const patchBump = `${major}.0.999`;
    makeFakeKanbanBin(tmpDir, patchBump);
    const result = runDispatch('status', {
      PATH: `${tmpDir}:${process.env.PATH}`,
    });

    // Even a "compatible" semver that differs exactly should warn
    assert.ok(
      result.stderr.includes('global v'),
      `Expected mismatch warning for semver-compatible but non-identical version, got stderr: ${result.stderr}`,
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('dispatch: missing subcommand argument exits non-zero', () => {
  const result = spawnSync('bash', [DISPATCH_SH], {
    encoding: 'utf8',
    env: { ...process.env, PATH: '/usr/bin:/bin' },
  });
  assert.notEqual(result.status, 0, 'dispatch.sh with no argument should exit non-zero');
});
