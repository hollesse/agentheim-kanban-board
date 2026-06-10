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

function findTaskById(id) {
  if (!fs.existsSync(CONTEXTS_DIR)) return null;

  const contexts = fs.readdirSync(CONTEXTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const LANES = ['backlog', 'todo', 'doing', 'done'];

  for (const context of contexts) {
    for (const lane of LANES) {
      const laneDir = path.join(CONTEXTS_DIR, context, lane);
      if (!fs.existsSync(laneDir)) continue;
      const files = fs.readdirSync(laneDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        try {
          const filePath = path.join(laneDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const fm = parseFrontmatter(content);
          const fileId = fm.id || file.replace('.md', '');
          if (fileId === id) {
            // Strip frontmatter block to get body
            const bodyMatch = content.match(/^---[\s\S]*?---\r?\n([\s\S]*)$/);
            const body = bodyMatch ? bodyMatch[1] : content;
            return { filePath, content, fm, body };
          }
        } catch (_) {
          // Skip unreadable files
        }
      }
    }
  }
  return null;
}

function mdToHtml(text) {
  const lines = text.split('\n');
  const output = [];
  let inUl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Headings
    if (/^### /.test(line)) {
      if (inUl) { output.push('</ul>'); inUl = false; }
      output.push('<h3>' + escHtml(line.slice(4).trim()) + '</h3>');
      continue;
    }
    if (/^## /.test(line)) {
      if (inUl) { output.push('</ul>'); inUl = false; }
      output.push('<h2>' + escHtml(line.slice(3).trim()) + '</h2>');
      continue;
    }
    if (/^# /.test(line)) {
      if (inUl) { output.push('</ul>'); inUl = false; }
      output.push('<h1>' + escHtml(line.slice(2).trim()) + '</h1>');
      continue;
    }

    // List items (- or *)
    if (/^[-*] /.test(line)) {
      if (!inUl) { output.push('<ul>'); inUl = true; }
      let itemText = line.slice(2).trim();
      // Checkboxes
      if (/^\[x\] /i.test(itemText)) {
        itemText = '<span class="cb cb--checked">&#x2713;</span> ' + escHtml(itemText.slice(4));
      } else if (/^\[ \] /.test(itemText)) {
        itemText = '<span class="cb cb--unchecked">&#x25a1;</span> ' + escHtml(itemText.slice(4));
      } else {
        itemText = applyInline(itemText);
      }
      output.push('<li>' + itemText + '</li>');
      continue;
    }

    // Non-list line: close ul if open
    if (inUl) { output.push('</ul>'); inUl = false; }

    // Blank line
    if (line.trim() === '') {
      output.push('');
      continue;
    }

    // Regular paragraph line
    output.push('<p>' + applyInline(line) + '</p>');
  }

  if (inUl) { output.push('</ul>'); }

  return output.join('\n');
}

function applyInline(text) {
  // Bold: **text**
  let result = escHtml(text);
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return result;
}

function parseDependsOn(raw) {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed === '[]' || trimmed === '') return [];
  // Strip surrounding brackets
  const inner = trimmed.replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!inner) return [];
  return inner.split(',').map(s => s.trim()).filter(Boolean);
}

function buildMetaSection(fm) {
  const parts = { badges: [], rows: [] };

  // type badge
  const type = fm.type ? fm.type.trim() : '';
  if (type) {
    const badgeClass = type === 'spike'    ? 'badge--spike'
                     : type === 'decision' ? 'badge--decision'
                     : type === 'bug'      ? 'badge--bug'
                     : type === 'chore'    ? 'badge--chore'
                     : type === 'refactor' ? 'badge--refactor'
                     : 'badge--feature';
    parts.badges.push(`<span class="badge ${badgeClass}">${escHtml(type)}</span>`);
  }

  // status badge
  const status = fm.status ? fm.status.trim() : '';
  if (status) {
    const laneClass = ['backlog', 'todo', 'doing', 'done'].includes(status) ? status : 'backlog';
    parts.badges.push(`<span class="status-badge status-badge--${laneClass}">${escHtml(status)}</span>`);
  }

  // context row
  const context = fm.context ? fm.context.trim() : '';
  if (context) {
    parts.rows.push(['context', `<span>${escHtml(context)}</span>`]);
  }

  // depends_on row
  const deps = parseDependsOn(fm.depends_on);
  if (deps.length > 0) {
    const links = deps.map(id =>
      `<a class="detail-meta-link" href="/task/${encodeURIComponent(id)}">${escHtml(id)}</a>`
    ).join('');
    parts.rows.push(['depends on', `<span class="detail-meta-links">${links}</span>`]);
  }

  // created row
  const created = fm.created ? fm.created.trim() : '';
  if (created) {
    parts.rows.push(['created', `<span>${escHtml(created)}</span>`]);
  }

  // completed row
  const completed = fm.completed ? fm.completed.trim() : '';
  if (completed) {
    parts.rows.push(['completed', `<span>${escHtml(completed)}</span>`]);
  }

  // If nothing to show, return empty string
  if (parts.badges.length === 0 && parts.rows.length === 0) return '';

  const badgesHtml = parts.badges.length > 0
    ? `<div class="detail-meta-badges">${parts.badges.join('')}</div>`
    : '';

  const rowsHtml = parts.rows.length > 0
    ? `<div class="detail-meta-grid">${parts.rows.map(([label, value]) =>
        `<span class="detail-meta-label">${escHtml(label)}</span><div class="detail-meta-value">${value}</div>`
      ).join('')}</div>`
    : '';

  return `<div class="detail-meta">${badgesHtml}${rowsHtml}</div>`;
}

function buildDetailPage(task) {
  const fm = task.fm;
  const titleRaw = fm.title ? fm.title.replace(/^["']|["']$/g, '') : (task.body.match(/^#\s+(.+)$/m) || [])[1] || fm.id || 'Task';
  const title = escHtml(titleRaw);
  const bodyHtml = mdToHtml(task.body);
  const metaHtml = buildMetaSection(fm);

  const CSS_TOKENS = `
/* ── Design Tokens ─────────────────────────────────────────────────────── */
:root{
  --color-bg:#0f0f11;
  --color-surface:#1c1c1f;
  --color-surface-hover:#242428;
  --color-border:#27272a;
  --color-border-subtle:#202023;
  --color-text-primary:#fafafa;
  --color-text-secondary:#a1a1aa;
  --color-text-muted:#52525b;
  --color-todo:#2563eb;
  --color-doing:#d97706;
  --color-done:#16a34a;
  --font-family:ui-monospace,'Cascadia Code','Fira Code','JetBrains Mono',Menlo,Monaco,'Courier New',monospace;
  --font-size-xs:0.65rem;
  --font-size-sm:0.75rem;
  --font-size-base:0.875rem;
  --font-size-lg:1rem;
  --font-size-xl:1.25rem;
  --line-height-tight:1.2;
  --line-height-normal:1.5;
  --space-xs:0.25rem;
  --space-sm:0.5rem;
  --space-md:0.75rem;
  --space-lg:1rem;
  --space-xl:1.5rem;
  --space-2xl:2rem;
  --radius-sm:0.25rem;
  --radius-md:0.375rem;
  --radius-lg:0.5rem;
  --shadow-card:0 1px 3px 0 rgba(0,0,0,.4),0 1px 2px -1px rgba(0,0,0,.4);
}
/* ── Reset ─────────────────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
/* ── Base ──────────────────────────────────────────────────────────────── */
body{font-family:var(--font-family);font-size:var(--font-size-base);background:var(--color-bg);color:var(--color-text-primary);line-height:var(--line-height-normal);-webkit-font-smoothing:antialiased;max-width:48rem;margin:0 auto;padding:var(--space-2xl) var(--space-lg)}
/* ── Back link ─────────────────────────────────────────────────────────── */
.back-link{display:inline-flex;align-items:center;gap:var(--space-xs);font-size:var(--font-size-sm);color:var(--color-text-secondary);text-decoration:none;margin-bottom:var(--space-xl)}
.back-link:hover{color:var(--color-text-primary)}
/* ── Detail header ─────────────────────────────────────────────────────── */
.detail-header{margin-bottom:var(--space-xl);padding-bottom:var(--space-lg);border-bottom:1px solid var(--color-border)}
.detail-title{font-size:var(--font-size-xl);font-weight:600;color:var(--color-text-primary);line-height:var(--line-height-tight);margin-bottom:var(--space-sm)}
.detail-id{font-size:var(--font-size-xs);color:var(--color-text-muted)}
/* ── Body content ──────────────────────────────────────────────────────── */
.detail-body{color:var(--color-text-primary)}
.detail-body h1,.detail-body h2,.detail-body h3{color:var(--color-text-primary);line-height:var(--line-height-tight);margin:var(--space-xl) 0 var(--space-md)}
.detail-body h1{font-size:var(--font-size-xl);font-weight:600}
.detail-body h2{font-size:var(--font-size-lg);font-weight:600;color:var(--color-text-secondary)}
.detail-body h3{font-size:var(--font-size-base);font-weight:600;color:var(--color-text-secondary)}
.detail-body p{margin-bottom:var(--space-md);color:var(--color-text-secondary)}
.detail-body ul{margin:var(--space-md) 0 var(--space-md) var(--space-xl);display:flex;flex-direction:column;gap:var(--space-xs)}
.detail-body li{color:var(--color-text-secondary)}
.detail-body strong{color:var(--color-text-primary);font-weight:600}
/* ── Checkboxes ────────────────────────────────────────────────────────── */
.cb{display:inline-block;width:1em;text-align:center;font-size:var(--font-size-sm)}
.cb--checked{color:var(--color-done)}
.cb--unchecked{color:var(--color-text-muted)}
/* ── Badge variants (detail page) ──────────────────────────────────────── */
.badge--chore   {background:#2a2a1a;color:#fde68a}
.badge--refactor{background:#1a2a2a;color:#6ee7b7}
/* ── Status badge ──────────────────────────────────────────────────────── */
.status-badge{display:inline-flex;align-items:center;font-size:var(--font-size-xs);font-weight:600;letter-spacing:.04em;padding:.1em .5em;border-radius:var(--radius-sm);white-space:nowrap}
.status-badge--backlog{background:#1c1c1f;color:var(--color-text-muted);border:1px solid var(--color-border)}
.status-badge--todo   {background:#1e2f5a;color:#93c5fd}
.status-badge--doing  {background:#3b2710;color:#fcd34d}
.status-badge--done   {background:#14291f;color:#86efac}
/* ── Detail meta section ────────────────────────────────────────────────── */
.detail-meta{margin-bottom:var(--space-xl);padding-bottom:var(--space-lg);border-bottom:1px solid var(--color-border)}
.detail-meta-badges{display:flex;align-items:center;flex-wrap:wrap;gap:var(--space-sm);margin-bottom:var(--space-md)}
.detail-meta-grid{display:grid;grid-template-columns:max-content 1fr;gap:var(--space-xs) var(--space-lg);align-items:baseline}
.detail-meta-label{font-size:var(--font-size-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
.detail-meta-value{font-size:var(--font-size-sm);color:var(--color-text-secondary)}
.detail-meta-links{display:flex;flex-wrap:wrap;gap:var(--space-sm)}
.detail-meta-link{color:#93c5fd;text-decoration:none;font-size:var(--font-size-sm)}
.detail-meta-link:hover{text-decoration:underline}
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Kanban Board</title>
<style>${CSS_TOKENS}</style>
</head>
<body>
<a class="back-link" href="/">&#x2190; Zurück zum Board</a>
<div class="detail-header">
  <div class="detail-title">${title}</div>
  <div class="detail-id">${escHtml(fm.id || '')}</div>
</div>
${metaHtml}
<div class="detail-body">
${bodyHtml}
</div>
</body>
</html>`;
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
    const typeClass = lane === 'backlog' ? 'badge--feature'
                    : lane === 'todo'    ? 'badge--feature'
                    : lane === 'doing'   ? 'badge--spike'
                    : 'badge--decision';

    const cards = laneTasks.length === 0
      ? `<div class="empty-state">
           <span class="empty-state-icon">&#x25a1;</span>
           <span class="empty-state-label">No tasks</span>
         </div>`
      : laneTasks.map(t => {
          const badgeClass = t.type === 'spike'    ? 'badge--spike'
                           : t.type === 'decision' ? 'badge--decision'
                           : t.type === 'bug'      ? 'badge--bug'
                           : 'badge--feature';
          return `<a class="card" href="/task/${encodeURIComponent(t.id)}">
  <div class="card-meta">
    <span class="card-context">${escHtml(t.context)}</span>
    ${t.type ? `<span class="badge ${badgeClass}">${escHtml(t.type)}</span>` : ''}
  </div>
  <span class="card-title">${escHtml(t.title)}</span>
  <span class="card-id">${escHtml(t.id)}</span>
</a>`;
        }).join('\n');

    return `<div class="column column--${lane}">
  <div class="column-header">
    <span class="column-title">${lane}</span>
    <span class="column-count">${laneTasks.length}</span>
  </div>
  <div class="column-body">
${cards}
  </div>
</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kanban Board</title>
<style>
/* ── Design Tokens ─────────────────────────────────────────────────────── */
:root{
  --color-bg:#0f0f11;
  --color-surface:#1c1c1f;
  --color-surface-hover:#242428;
  --color-border:#27272a;
  --color-border-subtle:#202023;
  --color-text-primary:#fafafa;
  --color-text-secondary:#a1a1aa;
  --color-text-muted:#52525b;
  --color-backlog:#52525b;
  --color-todo:#2563eb;
  --color-doing:#d97706;
  --color-done:#16a34a;
  --font-family:ui-monospace,'Cascadia Code','Fira Code','JetBrains Mono',Menlo,Monaco,'Courier New',monospace;
  --font-size-xs:0.65rem;
  --font-size-sm:0.75rem;
  --font-size-base:0.875rem;
  --font-size-lg:1rem;
  --font-size-xl:1.25rem;
  --line-height-tight:1.2;
  --line-height-normal:1.5;
  --space-xs:0.25rem;
  --space-sm:0.5rem;
  --space-md:0.75rem;
  --space-lg:1rem;
  --space-xl:1.5rem;
  --space-2xl:2rem;
  --radius-sm:0.25rem;
  --radius-md:0.375rem;
  --radius-lg:0.5rem;
  --shadow-card:0 1px 3px 0 rgba(0,0,0,.4),0 1px 2px -1px rgba(0,0,0,.4);
  --shadow-column:0 2px 8px 0 rgba(0,0,0,.5);
  --transition-fast:120ms ease;
}
/* ── Reset ─────────────────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
/* ── Base ──────────────────────────────────────────────────────────────── */
body{font-family:var(--font-family);font-size:var(--font-size-base);background:var(--color-bg);color:var(--color-text-primary);line-height:var(--line-height-normal);-webkit-font-smoothing:antialiased}
/* ── Page header ───────────────────────────────────────────────────────── */
.page-header{padding:var(--space-lg) var(--space-lg) 0;display:flex;align-items:baseline;gap:var(--space-md)}
.page-header h1{font-size:var(--font-size-xl);font-weight:600;color:var(--color-text-primary);letter-spacing:-.02em}
.task-count{font-size:var(--font-size-sm);color:var(--color-text-muted)}
/* ── Board ─────────────────────────────────────────────────────────────── */
.board{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);padding:var(--space-lg);align-items:start}
/* ── Column ────────────────────────────────────────────────────────────── */
.column{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);display:flex;flex-direction:column;min-height:8rem;box-shadow:var(--shadow-column);overflow:hidden}
.column-header{display:flex;align-items:center;justify-content:space-between;padding:var(--space-md) var(--space-md) var(--space-sm);border-bottom:1px solid var(--color-border-subtle)}
.column-title{font-size:var(--font-size-sm);font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-secondary)}
.column-count{font-size:var(--font-size-xs);font-weight:500;color:var(--color-text-muted);background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:0 var(--space-xs);line-height:1.6;min-width:1.5em;text-align:center}
.column-body{padding:var(--space-sm);display:flex;flex-direction:column;gap:var(--space-sm);flex:1}
.column--backlog .column-header{border-top:2px solid var(--color-backlog)}
.column--todo    .column-header{border-top:2px solid var(--color-todo)}
.column--doing   .column-header{border-top:2px solid var(--color-doing)}
.column--done    .column-header{border-top:2px solid var(--color-done)}
.column--backlog .column-title{color:var(--color-backlog)}
.column--todo    .column-title{color:var(--color-todo)}
.column--doing   .column-title{color:var(--color-doing)}
.column--done    .column-title{color:var(--color-done)}
/* ── Card ──────────────────────────────────────────────────────────────── */
.card{background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-sm) var(--space-md);box-shadow:var(--shadow-card);display:flex;flex-direction:column;gap:var(--space-xs);text-decoration:none;color:inherit;cursor:pointer;transition:background var(--transition-fast),border-color var(--transition-fast)}
.card:hover{background:var(--color-surface-hover);border-color:#3f3f46}
.card-meta{display:flex;align-items:center;justify-content:space-between;gap:var(--space-xs)}
.card-context{font-size:var(--font-size-xs);color:var(--color-text-muted);text-transform:lowercase;letter-spacing:.03em}
.card-title{font-size:var(--font-size-base);font-weight:500;color:var(--color-text-primary);line-height:var(--line-height-tight);overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.card-id{font-size:var(--font-size-xs);color:var(--color-text-muted);font-variant-numeric:tabular-nums}
/* ── Badge ─────────────────────────────────────────────────────────────── */
.badge{display:inline-flex;align-items:center;font-size:var(--font-size-xs);font-weight:600;letter-spacing:.04em;padding:.1em .5em;border-radius:var(--radius-sm);white-space:nowrap;flex-shrink:0}
.badge--feature {background:#1e3a5f;color:#93c5fd}
.badge--spike   {background:#3b1f5a;color:#c4b5fd}
.badge--decision{background:#1f3a2a;color:#86efac}
.badge--bug     {background:#3f1d1d;color:#fca5a5}
/* ── Empty state ───────────────────────────────────────────────────────── */
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--space-xl) var(--space-lg);gap:var(--space-xs);color:var(--color-text-muted);text-align:center;flex:1}
.empty-state-icon{font-size:1.5rem;line-height:1;opacity:.4}
.empty-state-label{font-size:var(--font-size-sm);color:var(--color-text-muted)}
</style>
</head>
<body>
<header class="page-header">
  <h1>Kanban Board</h1>
  <span class="task-count">${count} task${count === 1 ? '' : 's'}</span>
</header>
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

  const taskMatch = url.match(/^\/task\/([^/]+)$/);
  if (req.method === 'GET' && taskMatch) {
    const id = decodeURIComponent(taskMatch[1]);
    const task = findTaskById(id);
    if (!task) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Not found</title></head><body style="font-family:monospace;background:#0f0f11;color:#fafafa;padding:2rem"><h1>404</h1><p>Task <code>${escHtml(id)}</code> not found.</p><a href="/" style="color:#a1a1aa">&#x2190; Zurück zum Board</a></body></html>`);
      return;
    }
    const html = buildDetailPage(task);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
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
