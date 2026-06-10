'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// CWD is assumed to be the project root (where .agentheim/ lives)
const ROOT = process.cwd();
const LOCK_FILE = path.join(ROOT, '.agentheim', '.kanban.lock');
const CONTEXTS_DIR = path.join(ROOT, '.agentheim', 'contexts');

// ── Task parsing ────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const block = match[1];
  const result = {};
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    result[key] = value;
  }
  return result;
}

function readTasksFromDisk() {
  const tasks = [];
  if (!fs.existsSync(CONTEXTS_DIR)) return tasks;

  const contexts = fs.readdirSync(CONTEXTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const LANES = ['backlog', 'todo', 'doing', 'done'];

  for (const context of contexts) {
    for (const lane of LANES) {
      const laneDir = path.join(CONTEXTS_DIR, context, lane);
      if (!fs.existsSync(laneDir)) continue;
      const files = fs.readdirSync(laneDir)
        .filter(f => f.endsWith('.md'));
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(laneDir, file), 'utf8');
          const fm = parseFrontmatter(content);
          // Extract title from first H1 if not in frontmatter
          const h1Match = content.match(/^#\s+(.+)$/m);
          tasks.push({
            id: fm.id || file.replace('.md', ''),
            title: fm.title ? fm.title.replace(/^["']|["']$/g, '') : (h1Match ? h1Match[1].trim() : file),
            type: fm.type || null,
            status: fm.status || lane,
            lane,
            context,
          });
        } catch (_) {
          // Skip unreadable files
        }
      }
    }
  }

  return tasks;
}

// ── HTML page ───────────────────────────────────────────────────────────────

function buildHtmlPage(tasks) {
  const count = tasks.length;
  const lanes = ['backlog', 'todo', 'doing', 'done'];

  const columns = lanes.map(lane => {
    const laneTasks = tasks.filter(t => t.lane === lane);
    const cards = laneTasks.map(t =>
      `<div class="card"><span class="context">${escHtml(t.context)}</span><span class="title">${escHtml(t.title)}</span><span class="id">${escHtml(t.id)}</span></div>`
    ).join('\n');
    return `<div class="column"><h2>${lane}</h2>${cards}</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kanban Board</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#f4f4f5;padding:1rem}
h1{font-size:1.4rem;margin-bottom:1rem;color:#18181b}
.count{font-size:.9rem;color:#71717a;margin-left:.5rem}
.board{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.column{background:#fff;border-radius:.5rem;padding:.75rem;min-height:4rem}
.column h2{font-size:.85rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#71717a;margin-bottom:.5rem}
.card{background:#f9f9fb;border:1px solid #e4e4e7;border-radius:.375rem;padding:.5rem;margin-bottom:.5rem}
.card .context{display:block;font-size:.7rem;color:#a1a1aa;margin-bottom:.2rem}
.card .title{display:block;font-size:.8rem;color:#18181b;line-height:1.3}
.card .id{display:block;font-size:.7rem;color:#a1a1aa;margin-top:.2rem}
</style>
</head>
<body>
<h1>Kanban Board<span class="count">${count} task${count === 1 ? '' : 's'}</span></h1>
<div class="board">
${columns}
</div>
</body>
</html>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Request handler ──────────────────────────────────────────────────────────

function handleRequest(req, res) {
  const url = req.url.split('?')[0];

  if (req.method === 'GET' && url === '/') {
    const tasks = readTasksFromDisk();
    const html = buildHtmlPage(tasks);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && url === '/api/tasks') {
    const tasks = readTasksFromDisk();
    const body = JSON.stringify(tasks, null, 2);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

// ── Port binding with auto-increment ────────────────────────────────────────

function startOnPort(port) {
  const server = http.createServer(handleRequest);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      startOnPort(port + 1);
    } else {
      console.error('Server error:', err.message);
      process.exit(1);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    const actualPort = server.address().port;
    writeLockFile(actualPort);
    console.log(`Kanban board listening on http://localhost:${actualPort}`);
  });
}

// ── Lock file ────────────────────────────────────────────────────────────────

function writeLockFile(port) {
  const lock = {
    pid: process.pid,
    port,
    started: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2), 'utf8');
  } catch (err) {
    console.error('Warning: could not write lock file:', err.message);
  }
}

function cleanupLockFile() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (_) {}
}

process.on('SIGTERM', () => { cleanupLockFile(); process.exit(0); });
process.on('SIGINT',  () => { cleanupLockFile(); process.exit(0); });

// ── Entry point ──────────────────────────────────────────────────────────────

const DEFAULT_PORT = 3131;
startOnPort(DEFAULT_PORT);
