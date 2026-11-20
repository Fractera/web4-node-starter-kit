# 811 — a wall per element on a dedicated server (its own Linux user)

State: PLAN — waits the owner's «да». Order agreed 2026-11-20 (Telegram 81/82): 809 → core build → 811 → 810.

## The owner's words (verbatim, Telegram 2026-11-20)

- 76: «Прежде всего давай определимся на сервере это реально на Mac нет. На Mac это в принципе не может быть нужно потому что на Mac всегда
  один пользователь.»
- 81: «… сделать новую сборку и потом приступить к изменению бутстрап чтобы мы могли вернуться к процессу установки терминалов для
  элементов»

## Measured (the core's own scripts)

- One OS user `fractera` holds the whole node on a server (`prepare.sh` stage user; pm2 startup -u fractera); the node lives in
  `/home/fractera/<folder>`, elements inside it (`WEB4-ITEMS/<kind>/<address>`); root's acts only through the fixed helper
  `/usr/local/sbin/fractera-root` (one sudoers line).
- Element processes run under the node's pm2 (`lib/web4-items/element-power.cjs`, `elements-watch.cjs`, `paths.cjs`); element agents are
  `claude` children of the core (`_agent-kit/server/bridge.cjs`, `claude-cli.cjs`; `CLAUDE_CONFIG_DIR` per element, 689); the boundary
  is a hook (`elements:isolate`) — Claude Code's `!` runs a shell past it.
- The node's keys: `.env.local` of the core; elements reach data only through doors with their own key (`X-Element-Key`).

## The shape (on a dedicated server only; a home computer is unchanged — one person)

- Every CUSTOM element gets its own Linux user `fe-<id>` (no shell login, no sudo) at its birth on a server, removed at its deletion;
  native elements and root stay the node's (the project's own, no other people's admins).
- Files: the element's folder owned `fe-<id>:fractera`, mode 2770 (the core still builds and deploys it through the group); the node's
  folder and home 0711 (pass-through only), the core's files without «other» rights, `.env.local` 0600 — `fe-<id>` reads its own
  folder and nothing else.
- Processes: an element's server runs as `fe-<id>` (the helper's fixed verbs start/stop/restart/status, or a systemd template unit
  `fractera-element@<id>` with User=fe-<id> — chosen by 811-1's measurement); the core and the natives keep pm2.
- Agents: the element's `claude` starts as `fe-<id>` through one fixed launcher (`/usr/local/sbin/fractera-agent <id>`, sudoers for the
  group of element users only), cwd its folder, `CLAUDE_CONFIG_DIR` inside it — then `!` in its terminal sees only its folder.
- `claude` and Node.js reachable for every element user (system-wide, read-only).
- No migration (the owner, Telegram 119, 2026-11-20: «миграции нам не нужна мы можем заново установить сервер»): the test server is
  installed again from zero (its data — Marina a8ifp, throughsongs.com — goes; re-created for the proofs).

## Substeps

- 811-1 measure on the server: what an element's process and agent read outside their folder today (hooks, shared scripts, caches,
  `claude` path); pick pm2-per-uid vs systemd units by memory and restart behaviour; the list goes to the owner.
- 811-2 the installer: the element users' group, the launcher and the sudoers lines, permissions of the node folder (`prepare.sh`,
  `fractera-root.sh`); tests (dry) with negatives.
- 811-3 birth/deletion on a server: `fe-<id>` created/removed through the helper; folder ownership.
- 811-4 processes as `fe-<id>`: start, stop, restart, status, logs; serve:status reads them.
- 811-5 the element agent as `fe-<id>` (terminal, work sessions, Telegram bot of the element).
- 811-6 a fresh install of the test server from zero («Установить с нуля»), Marina and throughsongs.com again.
- 811-7 proofs on the server: as `fe-a8ifp` — `cat` of the node's `.env.local` and `ls` of another element → Permission denied (the
  negative), its own folder works; Marina's site, sign-in, agent and bot work as before.

## Price named aloud

- Memory: a user costs nothing; systemd units nothing; an extra pm2 daemon per element would be ~50 MB each (why 811-1 measures).
- Disk: npm caches per user — measured in 811-1.
