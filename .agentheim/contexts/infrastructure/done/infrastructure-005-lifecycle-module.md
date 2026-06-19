---
id: infrastructure-005
title: "Extract lifecycle module (lib/lifecycle.js)"
status: done
type: refactor
context: infrastructure
created: 2026-06-19
completed: 2026-06-19
commit: b0cba5f
depends_on: []
blocks: [infrastructure-006, plugin-002]
tags: [refactor, lifecycle, lock-file, cross-platform]
related_adrs: [0003, 0005, 0007]
related_research: []
prior_art: [infrastructure-002]
---

## Why
Heute liegt die Lifecycle-Logik (Lock-File lesen/schreiben, PID-Liveness-Check, Port-Discovery, Browser-Open, Server-Spawn) als Bash-Snippets verteilt in den vier `SKILL.md`-Dateien. Der CLI-Entry-Point ([[infrastructure-006]]) braucht dieselbe Logik in Node-Code. Statt zu duplizieren wird sie einmal extrahiert; sowohl Skills (über [[plugin-002]]) als auch CLI rufen denselben Code.

Nebeneffekt: `open` ist heute macOS-only. Beim Extrahieren wird gleich Cross-Platform-Browser-Dispatch (`open` / `xdg-open` / `start`) eingebaut.

## What
Neues Modul `lib/lifecycle.js` im Projekt-Root mit folgender exportierten API:

- `start({ root, serverPath })` — startet den Server falls noch nicht laufend; liest Lock; öffnet Browser. Idempotent.
- `stop({ root })` — beendet den laufenden Server falls vorhanden; räumt Lock.
- `status({ root })` — gibt `{ running, pid, port, lockPath }` zurück (oder schreibt strukturiert in stdout/Exit-Code, je nach Vereinbarung mit -006).
- `open({ root })` — öffnet Browser-Tab auf laufenden Server; Fehler falls nicht laufend.
- Intern: Lock-Read/Write/Validate (`kill -0`-Äquivalent in Node: `process.kill(pid, 0)`), Port-Discovery (3131 + Inkrement), Cross-Platform-Open-Dispatch über `process.platform`.

`server.js` konsumiert künftig den Lock-Write-Helper aus diesem Modul (Eliminierung kleiner Duplikate dort).

## Acceptance criteria
- [ ] `lib/lifecycle.js` existiert mit den vier exportierten Funktionen `start / stop / status / open`
- [ ] Modul nutzt ausschließlich Node-Built-ins (`node:fs`, `node:path`, `node:child_process`, `node:os`) — keine externen Dependencies
- [ ] Cross-Platform-Browser-Open funktioniert auf macOS (`open`), Linux (`xdg-open`), Windows (`start`)
- [ ] `server.js` benutzt den Lock-Write-Helper aus `lib/lifecycle.js` (keine doppelte Lock-Schreib-Logik mehr)
- [ ] Lock-File-Format und Liveness-Check verhalten sich identisch zu ADR-0003 (gleicher Pfad, gleiche Felder, `kill -0`-Semantik)
- [ ] Modul ist pur (keine direkte Bindung an Prozess-Args oder stdout-Format) — CLI- und Skill-spezifische Formatierung passiert beim Aufrufer

## Notes

### Nicht in Scope
- CLI-Binary selbst — das macht [[infrastructure-006]]
- Skill-Bodies umstellen — das macht [[plugin-002]]
- Tests-Framework einführen — Modul muss aber gut von Hand testbar bleiben

### Designentscheidungen für den Worker

- **`process.kill(pid, 0)`** statt Shell-out zu `kill -0` — funktioniert plattformunabhängig in Node.
- **Server-Spawn:** `child_process.spawn('node', [serverPath], { cwd: root, detached: true, stdio: 'ignore' }).unref()` — damit der Eltern-Prozess (CLI / Skill-Aufruf) terminieren kann.
- **Lock-Schreib-Verantwortung bleibt bei `server.js`**: der Server schreibt den Lock beim Listen, nicht der Spawner. Das macht den Lock atomar zur tatsächlichen Listen-Bindung. `lifecycle.start()` wartet kurz (Polling auf Lock-Datei-Existenz, Timeout ~3s) bevor es als „gestartet" gilt.

### ADR-Pflicht beim Implementieren
Beim Umsetzen ist ADR-0007 zu schreiben: **"Lifecycle module location and contract"** — fixiert `lib/lifecycle.js` als Ort, die exportierte API, die Cross-Platform-Open-Dispatch-Tabelle. Scope: global (BC: infrastructure).

## Outcome

`lib/lifecycle.js` ist live und end-to-end smoke-getestet (start spawned auf Port 3134, idempotenter Re-Start hat identische pid wiederverwendet, stop hat per SIGTERM sauber heruntergefahren, stale-lock-Erkennung greift).

- `lib/lifecycle.js` — exportiert `start / stop / status / open` plus Helpers (`lockPath`, `readLock`, `writeLock`, `deleteLock`, `isAlive`, `openBrowser`). Nur Node-Built-ins.
- `server.js` — konsumiert jetzt `lifecycle.writeLock` und `lifecycle.deleteLock`; keine doppelte Lock-Schreib-Logik mehr. Lock-Write bleibt bewusst beim Server (atomar zum Listen), Modul kümmert sich um Read/Spawn/Polling.
- Cross-Platform-Open: `open` (darwin) / `xdg-open` (linux) / `cmd /c start "" <url>` (win32), `spawn().unref()` damit der Aufrufer sofort terminieren kann.
- ADR-0007 dokumentiert Ort, Vertrag und Dispatch-Tabelle.
- BC README aktualisiert: "Key commands" zeigt jetzt auf die Lifecycle-API; "Ubiquitous language" hat Lifecycle module + Lock file ergänzt.

Bereit zur Konsumption durch [[infrastructure-006]] (CLI-Binary) und [[plugin-002]] (Skills → CLI delegieren).
