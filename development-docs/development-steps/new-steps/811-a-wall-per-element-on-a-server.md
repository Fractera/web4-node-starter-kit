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

## 811-1 measured by code (2026-11-20 ~12:00 UTC; sent to him, Telegram 121)

- `claude` on a server lives in the node user's home (`install.sh` ensure-claude → ~/.local/bin/claude) → element users cannot run it →
  the installer puts it in a shared read-only place.
- The element agent's hooks are the CORE's files (`lib/agent-kit/limits.cjs`, `pulse.cjs`, `modes.cjs`, `scripts/element-boundary-hook.mjs`)
  and write into the core's `data/services/<id>` (context, pulse, autoMemoryDirectory) → read-only access to exactly these hook files;
  `data/services/<id>` owned by the element's user.
- An element's server is started by its watcher («сторож», `lib/web4-items/elements-watch.cjs`, under the node's pm2), not by pm2 directly
  → the watcher starts it through the fixed launcher as `fe-<id>`: no pm2 per user, no systemd (my pick).
- npm cache and home per element user: `/var/lib/fractera-el/<id>` (disk measured live).
- Live later (after the fresh install): the element's bot, its build under its user, «Permission denied» on the neighbours.

## 811-2 the installer — CODED (2026-11-20 ~12:50 UTC), dry tests green

- `scripts/dedicated-server/fractera-element.sh` → /usr/local/sbin/fractera-element (root helper, same sudoers line as fractera-root):
  `add <id> <folder>` (user fe-<id>, home /var/lib/fractera-el/<id>, root's record /etc/fractera/elements/<id>, POSIX ACLs on the
  folder and data/services/<id>: fe-<id> + the node's group rwX, other nothing, the same as defaults; setfacl -P) · `remove` (kill,
  chown back -P -h, ACLs off, userdel) · `run <id> [K=V…] -- prog` (setpriv --no-new-privs as fe-<id>, env -i, umask 007, its folder;
  LD_*/PATH/HOME/NODE_OPTIONS/BASH_ENV refused) · `signal` (by uid) · `stop` · `claude-share` (the node's claude → /usr/local/lib/fractera/bin,
  only from ~/.local/share/claude, only ELF) · `walls` (node folder 0711, every core file o-rwx — natives included — except folders of
  elements with a record; `element-readable.txt` opened; .env* 0600) · `list`.
- Chosen over the plan: ACLs instead of chown to fe-<id> (the core keeps building and deploying through its group, no ownership dance;
  files the element creates stay reachable by the core by the default ACL). Root never walks a tree an element user can write while it runs.
- prepare.sh: apt `acl`, stage `element-group` (group fractera-el, /var/lib/fractera-el 0711, /usr/local/lib/fractera/bin), helper +
  /etc/fractera/elements 0700 + one sudoers line for both helpers. start.sh: soft `claude-share`, `walls` before `serve`. launch.mjs
  uploads the helper. clear.sh: fe-* users, their homes and records erased with the node.
- Tests: `npm run test:element-wall` 19 ✓ (negatives: ids, folders with .., absolute, symlinked folder and data folder, env keys,
  pid not the element's, allow-list .., absolute, missing, symlink; claude outside the store, not ELF); hosting 76 ✓ (stage list +
  element-group), hosting-launch 27 ✓, server-install-live 16 ✓.
- 🔴 FOUND for 811-5: the hooks' closure is wider than 811-1 said — progress.cjs reads the element's bot token AND, when the main agent
  leads the element, the main bot's chat; pulse.cjs reads data/node/limits; plus node-line, lending, permission, window, memory/record.cjs.
  So hooks can NOT run as fe-<id> with read rights: 811-5 = a relay (one readable file in element-readable.txt) that posts the hook
  event to a core door with the element's own key; the core runs the real hook as the node's user.
- 🔴 FOUND for 810/811-5 (his decision): an element agent on the NODE's subscription would need the node's ~/.claude credentials —
  copying them to fe-<id> hands the node's token to the element. On a server an element agent runs on its own Claude account
  (memory one-element-one-claude-account) — or the core lends work through itself, never the token.

## 811-3 birth and deletion — CODED (2026-11-20 ~13:15 UTC)

- `lib/hosting/element-wall.cjs`: the wall is on where the helper is installed and /etc/fractera/node.env names THIS node (Linux only);
  custom elements (registry kind `user`, root among them — §3: equal to every custom one; the plan's «root stays the node's» corrected)
  get `add`, natives never. `services-install.mjs` ensures the user after packages and build (birth goes through it, so do install
  and update); the delete door removes it async right after pm2 (step «wall»).
- The helper's repeat `add` no longer walks the folder (a found hole: root's setfacl -R over a tree a running fe-<id> can write).
- Test: element-wall 27 ✓ (+ the node side: native refused, no wall without helper / other node / non-Linux, a bad folder never reaches
  the helper, repeat add only the two top folders).

## 811-4 the element's code as its own user — CODED (2026-11-20 ~13:50 UTC)

- Found: the node runs element code in more places than its server — `npm ci` (install scripts), `npm run build` (next.config), the
  warm-up and the preview server (services-install.mjs, element-preview.mjs). As the node's user that code could read .env.local.
- Short programs (npm ci, build, git in its folder) → `wall.asElement` → the helper's `run` as fe-<id>, ONLY the given env (never the
  node's), `--in <sub>` checked inside its folder. The installer ensures the user BEFORE npm ci (moved up from 811-3).
- Long programs → transient systemd units `fractera-el-<id>-<tag>` (User=fe-<id>, KillMode=control-group, UMask 0007, NoNewPrivileges,
  log in root's /var/log/fractera-el): the server under pm2 through `scripts/dedicated-server/element-shim.sh` (the node's own bash: starts
  the unit, tails its log, stops it on TERM/INT/HUP, ends 1 when the unit dies → pm2 restarts); the warm-up (tag warm) and the preview
  (tag preview; preview.json keeps `unit`, its readers ask `systemctl is-active`). Chosen over «pm2 → sudo → element»: whether the node's
  user may signal a root sudo is NOT measured (no Linux here) — the unit design works either way. Memory: a bash shim ~3 MB per element.
- Git: a fresh fe-<id> gets `safe.directory` of its folder, written as that user (git refuses a repository of another owner).
- paths.cjs: `itemDirAt(root, id, kind)` (itemDir unchanged); the wall maps a folder to its element through it.
- Tests: element-wall 36 ✓ (units, --in/tag negatives, the shim, serveApp/asElement/unitOf with a test registry, env never leaks);
  hosting 76, hosting-launch 27, server-install-live 16, delete-agents 5, node-remove 5 ✓; tsc rc 0.
- 🔴 To measure live (811-7): pm2 stop/restart of a walled element frees its port; spawnSync timeouts of `run` (a sudo the node may not
  kill); node-side git in element folders as the node's user still trusts the element's .git/config (core.fsmonitor, hooks) — next.

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
