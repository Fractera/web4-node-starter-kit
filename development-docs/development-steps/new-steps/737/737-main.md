# Step 737 — the node moves to a dedicated server

## 1. Retelling and decisions

The owner, 2026-11-13 ~06:20 UTC, verbatim: «У нас есть вкладка выделенный сервер наша задача заключается в том, чтобы текущий проект мог
переехать на выделенный сервер. То есть нужно собрать инструмент который перенесёт полностью настроенный проект по в vps на убунту. То здесь
должна быть настройка которая принимает IP-адрес сервера и которая принимает пароль с сервера а затем создают процесс при котором шаг за
шагом автоматически и по возможности без искусственного интеллекта весь проект переносится на сервер и запускается там сначала по
IP-адресу. Позже если пользователь предоставит домик доброй получает сертификаты на каждый из существующих Суб доменов . Значит этой
вкладка будет также позже отвечать за выпуску сертификатов. Это означает что после того как проект обнаружит себя что он тоже работает на
удалённом сервере он соответствующем образом переключить режим в режим выделенный сервер. Внизу появится требования прописать о записи ко
всем существующим доменом на регистраторе. После этого ты вызываешь кнопку проверки в наличии сертификатов если нет дополнение ших и после
этого весь проект должен работать. Скажу тебе о том что в истории Старых версий примерно апрель или май весь этот процесс существовал то
что касается настройки а то что касается установки то он и сейчас существует в Fractera easy starter можешь посмотреть репозитории.
Создавай один огромный шаг в результате которого наш проект сможет переезжать на выделенный сервер.»

Then (~06:40): «…была вкладка домен которая имела пять шагов и определяла процесс миграции с IP-адреса на домен. Все было построено и все
работало» and «Собираем максимально информации создавай интерфейсы заливай готовь все что ты можешь сделать без меня я все ещё сплю
продолжай без остановки из сессии сессию пока не закончишь не будешь готов тестирование чтобы я дал тебе тесто доступ к серверу».

**The goal behind the words:** a node that lives on the person's computer moves — whole, with its elements, data, bots and memory — to
an Ubuntu VPS, without a model doing the work; it answers there by IP first; later the person's domain gets DNS records for every name
of the node and a certificate for each, and the node works on the server around the clock, managed from Telegram.

I assume that:
- the VPS gives SSH as `root` with a password (Contabo, Hetzner, Timeweb — the common case; the easy starter assumed the same);
- the node being moved is the node the tool runs on (no «copy someone else's node»);
- «по IP-адресу» is plain HTTP on port 80 at the server's address, the panel read-only there (the same law as the temporary address);
- the domain stage is the old five-step wizard reborn for the new architecture (the owner's second message).

## 2. Measured state (2026-11-13, this node; details in `737-research.md`)

- The tab «Выделенный сервер» = `app/[lang]/(architectLayer)/architect/hosting/hosting/` — only words + the widget «where is the project»
  (`components/node-state/node-place.client.tsx`, door `app/api/node/place`, file `data/node/place.json`, «declared, not measured»).
- The node: core `fractera-web4` + 5 helper processes + 11 elements, **17 pm2 processes, ≈2.3 GB resident** (embeddings 471 MB, core 300
  MB, each element ≈130 MB), Claude Code sessions and builds on top. Temporary address only; **no own domain** (`logs/domain.json` absent).
- The domain layout of the node (`app/api/domain/activate/route.ts`): apex → `root`, `architect.<zone>` → core, `auth.<zone>` → auth,
  `<address>.<zone>` → every other element; elements' own domains; extra node domains (`data/node/domains.json`). Today only through a
  Cloudflare named tunnel.
- **The owner rule is a hole behind a proxy:** `lib/auth/owner-at-machine.ts` grants the architect layer without sign-in to `Host:
  localhost` with no `cf-*` headers. Behind nginx on a server a stranger sending `Host: localhost` to `http://<IP>/` would get the terminal.
  Must be closed before the first start by IP.
- Telegram: all bot pollers start in `lib/agent-kit/mount.cjs` at the core's start; two readers of one bot = 409 (`telegram.cjs:349` yields
  quietly) — two live copies would split the person's messages.
- The install chain is Linux-ready: `ensure-claude.mjs` (official `install.sh` → `~/.local/bin/claude`), `ensure-cloudflared`, `ensure-pty`,
  `ensure-eyes` (Linux needs `playwright install-deps` as root), `services:install` (npm ci + build of every element whose build is
  missing; born elements' code untouched; element env files regenerated with this machine's paths), `serve:start`, `serve:autostart`
  (systemd via `pm2 startup`). `fresh-project.mjs` must never run on a moved node — its mark `logs/fresh-project.json` travels.
- The graph keeps Python in `.uv/` + `.venv/` inside its folder (macOS binaries) — excluded, its prebuild reinstalls on Linux.
- Absolute Mac paths live only in history (agent prompts, logs, diary) — nothing functional to rewrite.
- `ssh2` is not in the core's dependencies; macOS ships OpenSSH 8.6 and rsync 2.6.9.

## 3. Reused (paths that open)

- The five-step wizard, last living version core `999b2f9d` (2026-08-07): `bridges/app/_components/coding-workspace/domain-wizard.client.tsx`,
  doors `bridges/app/app/api/config/domain/{route,wizard-state,dns-check,health-check,activate,deactivate}/route.ts`, `bridges/app/lib/
  {server-ip,firewall,cert-info,runtime-urls}.ts`; certbot lock wait `b5641206` (origin/new-step-330). Its laws: every step's state is
  MEASURED (DNS through a public resolver, the certificate file, the env), never remembered; a per-host list for DNS and for the certificate;
  the issue button locked with a countdown; the last error shown with its likely cause; an own certificate may be uploaded (RU МинЦифры RSA
  yes, GOST no); the switch is atomic with a 30 s rollback watcher; «Change domain» before activation; «back to IP».
- The installer: github.com/Fractera/fractera-easy-starter `lib/deploy.ts` (ssh2: password → sftp the script → `setsid bash … &`) and
  `lib/bootstrap.sh` (hardware probe first — a warning, not a refusal; swap under 2 GB; apt lock wait; Node 22; pm2; resolver pin 1.1.1.1;
  ufw; `git config http.version HTTP/1.1`; clone with retries; nginx IP config with `client_max_body_size 200m`; a health loop).
- The node: `components/domain/domain-ladder.client.tsx` (the ladder law: a rung opens after the previous one; a locked rung names what
  appears and after what; the state is asked from the node), `scripts/spawn-free.mjs` (a detached runner that survives the core),
  `_agent-kit/core/client/terminal-auth.mjs` (the Claude login link out of a terminal), `lib/domain/*` (DoH checks, zone layout),
  `scripts/serve.mjs` (`unpublish` mark, `autostart`), `scripts/services-install.mjs`.

## 4. Known limits (the laws this step must not break)

- One node per computer — and never two live copies of one node: before the server's bots and clocks run, the Mac's are stopped.
- Never read `.env.local`; never print or keep the server password; the key never leaves the computer that made it, never enters git.
- Elements are not edited by the core; the core's own code only. Doors only asynchronous; long work detached (`spawn-free`), child
  environment cleaned of `NEXT_*`/`PORT` (ANTI-PATTERNS «All systems»).
- No copy of `.ts` inside the project (a backup or a test target lives outside it). A test of an installer never touches the live pm2.
- The temporary address and the server's bare IP are read-only; sign-in never over plain HTTP.
- A claim about Let's Encrypt, Claude Code, Ubuntu — only from the primary source (`737-research.md` names each).
- Texts through translations (`_data`, `.i18n.ts`), `data-block` on every container, components ≤ 250 lines, every door `// @api`,
  `parts_find` before every interface file, shadcn primitives first.

## 5. Design (my picks; the owner decides the marked ones)

1. **Transport.** `ssh2` (npm; the easy starter's choice; pure JS on all three systems): the password once → the node makes an ed25519 key
   in `data/node/server/` (0600, outside git), installs its public half for `root`, pins the host key; every later call by the key. Files:
   `rsync` over the system `ssh` with that key where both ends have it (macOS, Linux), `tar` over ssh2 otherwise (Windows).
2. **Who runs the node on the server:** a user `fractera` (Claude Code refuses bypass mode as root — code.claude.com/docs/en/permission-modes;
   the browser terminal must not be a root shell). Root only for the system layer, through one root-owned helper with fixed verbs
   (`/usr/local/sbin/fractera-root`: nginx apply, cert issue/list/delete, firewall status) allowed by one sudoers line.
3. **Front:** nginx. IP stage — one `default_server` on :80 → the core; every proxied request carries `X-Fractera-Edge: 1` (set by nginx,
   a client cannot remove it); loopback `Host` names → 444. Domain stage — one server block per name from the name table, HTTP→HTTPS, the
   ACME path from a webroot. No `ssl_stapling` (Let's Encrypt certificates carry CRL only — letsencrypt.org/docs/profiles, 2026-10-04).
4. **Certificates:** certbot (`certonly --webroot`, one lineage per name, `--keep-until-expiring`, `--register-unsafely-without-email` —
   Let's Encrypt ended expiry e-mails on 2025-06-04). One name failing does not block the others; the button «check and add missing» maps
   one-to-one; renewals are exempt from the 50-per-week limit. An own certificate may be uploaded instead (the old Step 2B).
5. **One table of names** (`lib/hosting/hostnames.mjs`) — the DNS list, nginx, certificates and the end-to-end check read it; nothing keeps
   its own list (the old wizard's 197.1 desync: the checks wanted 9 names while certbot issued 7).
6. **The move is a ladder of rungs**, each measured, resumable, model-free: 1 address and password → 2 the server is checked (OS, CPU,
   RAM vs the node's measured 2.3 GB, disk vs the copy's size, ports 80/443) → 3 the server is prepared → 4 the copy and the build →
   5 Claude Code signed in on the server (its login link shown here, the code pasted here) → 6 a rehearsal: the server's node starts
   **silent** (no bots, no tunnel, no clocks; panel read-only by IP) and is checked from outside → 7 **the move**: the Mac's agents and
   node stop, the last changes are copied, the server starts whole, its bots take Telegram, the checks run again; failure → the Mac comes
   back by itself → 8 done: «your node lives at http://IP», with «return to this computer».
7. **The mode switch is detected, not declared:** the move writes `data/node/server.json` on the server (ip, user, when, from) and
   `data/node/moved.json` on the Mac. The place reads them: Linux + the marker + this machine owns that IP → «dedicated server (moved
   <date>)». The Mac's `serve:start` refuses while `moved.json` stands and names `npm run server -- return`.
8. **The domain on the server = the old five steps, in the server's tab** (shown when the mode is dedicated): 1 the domain → 2 the DNS
   records for every name (A to the server's IP; optional `*` shortcut) with «check DNS» (public DoH) → 3 certificates: check, add the
   missing, or upload your own → 4 the end-to-end HTTPS check per name → 5 switch on (nginx TLS, `logs/domain.json` with `via: "server"`,
   `APP-CONFIG` url, auth env, rebuild) with a 30 s rollback, and «back to IP». The main agent runs the same steps from Telegram:
   `npm run server -- dns|certs|check|activate`.
9. **The Cloudflare tunnel after the move:** the quick tunnel is off on the server (`logs/tunnel.json unpublished`), the Mac's stops with
   the Mac's node. A node already on a Cloudflare domain may instead move its named tunnel to the server (no DNS change, Cloudflare's
   certificates) — offered as an alternative, not built in this step.
10. **Rollback:** before the move rung nothing on the Mac changed; during it a failed check brings the Mac back by itself; after it
    `npm run server -- return` copies the server's data back and starts the Mac.
11. **What stays on the Mac:** the whole folder as a cold copy as of the move, the SSH key, `moved.json`; `npm run server -- window`
    opens the server's panel on this computer through SSH (owner rights without TLS, before the domain).

**Decisions for the owner (my pick first):** D1 the shortcut `*` record shown beside the explicit list — yes; D2 HTTPS by bare IP with a
6-day certificate (`shortlived` profile, certbot ≥ 5.4 `--ip-address`) — not now, later; D3 SSH password login turned off on the server
after the key works — offered as a button with his yes, never by itself; D4 test the whole ladder first in a disposable Ubuntu container
on this Mac (colima is installed; ≈2–3 GB RAM while it runs) — only with his word.

## 6. Substeps (vertical, each with its proof planned in advance)

| # | Result one can show | Proof (two planes, a negative control) |
|---|---|---|
| 737-1 | `npm run server -- names [--domain x]` prints every public name of this node with its port and DNS label | unit test on fixtures (root absent → apex to the core; an element without address → its id; a deleted element never appears) + the live table of this node |
| 737-2 | The edge law: behind nginx no request is «the owner at the keyboard»; the bare server IP is read-only; nginx configs generated | unit test of the generators (444 for loopback names, the edge header in every location, no stapling) + a live door call with `x-fractera-edge` refused while the same call without it passes |
| 737-3 | The SSH road: password once → key → key only; streamed commands; detached scripts | a local ssh2 test server: wrong password refused; after the key is installed the password is refused and the key works; the password never in a file |
| 737-4 | The server's own scripts: probe, prepare (packages, user, helper, firewall, swap, resolver), the root helper | `bash -n` + a dry run listing every command + (with access) a run on the test server |
| 737-5 | The copy: phase 1 live, phase 2 frozen, the exclusions, the size measured first | a local rsync into a scratch folder outside the project: no `node_modules`/`.next*`/`.venv`/key; `.git`, `data`, marks present |
| 737-6 | Install and start on the server: core, elements, eyes, Claude CLI; silent start; autostart | on the test server: `/api/health` of the core and every element on the server's loopback + `http://IP/` 200 read-only |
| 737-7 | The ladder in the tab «Выделенный сервер» (the Mac side) with its doors and the detached runner | eyes on every rung state (fixture) in both themes; doors refuse without the owner and on the temporary address |
| 737-8 | The domain on the server: the five steps, DNS list, certificates, end-to-end check, switch and back | unit tests (DNS list, cert coverage) + on the test server with a test domain |
| 737-9 | Detected mode and the Mac after the move: markers, place, refusing start, `return`, `window` | fixture tests of the place reader + `serve:start` refused with `moved.json` and passing without it |
| 737-10 | Words: skill `dedicated-server`, CLAUDE.md lines, README of the tab | `check:instruction`, `check:dev-docs`, the skill found by its words |

Order: 1 → 2 → 3 → 5 → 4 → 9 → 7 → 6 → 8 → 10. Repository: the working copy `~/fractera-dev/web4-node-starter-kit`, branch `main`, pushed to
Fractera; the node takes it by `node:update`. Everything that needs no server is built and proven before the owner's access; the rest
waits for it with its proof written in advance.

**Parts born here:** `components/hosting/ladder-step` (the rung of a ladder, taken out of the domain ladder — @part), the server ladder,
the DNS records table (@part, reused by the domain ladder later), the live stage log (@part).

**Not in this step:** moving the Cloudflare named tunnel to the server; HTTPS by bare IP; containers for elements; moving the Claude
session journals (agents start fresh on the server, their records carry the work); several servers; Windows as the source of a move
(tar fallback written, not proven).

## 7. State

- 2026-11-13 06:50 — plan written; research `737-research.md`. Building starts at 737-1 without waiting (the owner's word above).
- 2026-11-13 ~10:30 — built and pushed: 737-1…5, 737-7, 737-8 (`72c8f06e`), 737-9, 737-10 (the words). Summaries in `completed-steps/737-*.md`.
  OPEN, waiting for the owner's test server (IP + root password typed in the tab, never in chat) and a test domain: 737-6 (install and
  start on a real Ubuntu), the live proofs of 737-4 prepare, 737-7 rungs prepare → move, Claude's sign-in there, 737-8 certificates from
  Let's Encrypt. The plan stays until those proofs; decisions D1–D4 above wait for the owner.

## 8. Added 2026-11-13 ~14:00 — 737-11 Telegram on the server (the owner's words, verbatim)

«стоило бы подумать о том что если уже подключён Telegram то спросить: переносить этот Telegram на сервер или создать другой если
пользователь скажет перенести то значит переносим так если нет то значит вызываем процедуру создание нового телеграмм бота прямо в этом
окне как опциональное решение размещённое в аккордеоне. После подтверждения сервер сразу стартует установленный на него Telegram. О чем
приходит сообщение в Telegram приветствующие о готовности начать разработку но прежде знакомству … это же действие если пользователя до
сих пор нет на локальном компьютере Telegram на сервере он может понадобится. Также важно помнить что чаще всего … пользователи однажды
устанавливают на свой домашний компьютер Fractera и в будущем поднимает множество независящих от него серверов. … включим этот шаг чтобы
при последующем чистом прогоне мы все эти действия повторили».

**Design (my picks; D5, D6 for the owner):**
- A new rung **«Telegram»** after «Claude Code on the server» (the welcome is written by the server's main agent — it needs Claude).
- It reads this node's main bot (`data/services/build/channel/telegram/`): with a bot — the choice «move this bot to the server» or
  «a new bot for the server»; without one — only the new bot. The new bot's steps (BotFather → /newbot → name → the token pasted in the
  tab, never in chat) live in an accordion of the rung; the token goes to the server over SSH into the same file the server's poller reads.
- **A new bot = the server is independent:** it starts its Telegram at once (no 409: this computer keeps its own bot); the server's main
  agent writes the first message — a welcome and the first contact (skill `know-the-architect`) before any development. Elements' bots
  never travel to an independent server (the silent copy already carries no token).
- **The same bot = the move:** the bot starts on the server only at the «Move» rung, when this computer stops (two readers of one bot split
  the person's messages — telegram.cjs 409).
- **D5 — what an independent server receives:** (a) a clone of this node — elements, data, memory, without bots and the domain; (b) a fresh
  node — the core and the native elements from the person's fork, nothing personal. My pick: (b) for «many independent servers» (each is
  its own project and owner boundary), (a) only for the move. Changes the copy rung: (b) clones the fork on the server instead of rsync.
- **D6 — the ladder's name:** «Выделенный сервер» keeps the move; the independent server becomes the second road of the same tab
  («Новый сервер»), sharing connect · probe · prepare · claude · telegram.
- Proof: the clean run on a fresh Ubuntu repeats every rung with both Telegram choices; a welcome message arrives from the server's bot.

## 9. The live test of 2026-11-13 — what it found, the clean-run rule, and the plan to finish (written at max effort, for execution)

**The owner's rule, ~14:15 UTC, verbatim:** «again and again you try start not from scratch, and we have a lot of problem from this
idea. will beterr stop all and as rule create process always from scratch?» — **Yes.** A test run starts from a freshly reinstalled OS,
I only observe and measure; a defect → stop, fix the code, reinstall, run every rung again. Every rung also cleans its own leftovers
when re-run (a person's network does break). Memory: `feedback-test-from-scratch`. The run on 213.199.61.7 was stopped at 14:15 and
counts as contaminated (an earlier Fractera install, swap added by hand up to 15 GiB, processes killed by hand).

**D5 decided by the owner (~14:10):** «both variant for choose. and if it will clon need second question - replace data or not».

### 9.1 Defects found live, with their state

| # | Defect (measured) | State |
|---|---|---|
| 1 | probe said «ok» on a server running another install (nginx sites fractera, fractera-custom; 14 pm2 of root) | fixed `882fd6f5`, on the node; free-or-cancel dialog seen live |
| 2 | the core's Turbopack build killed for memory (8 GB + 4 GB swap); peaks measured 13.6 GiB and ≈14.8 GiB | swap rule memory+swap ≥ 24 GiB — working copy (16 GiB was pushed in `7d7b8996`) |
| 3 | `experimental.turbopackMemoryLimit` tried: killed at the same 7.7 GB | rejected, reverted |
| 4 | Claude sign-in link stored as `{how,url}` → the tab opened `/[object Object]` | fixed `9f979cc6`, on the node, test |
| 5 | «same version» failed on a records-only commit made after the copy | fixed `9f979cc6`, on the node |
| 6 | no way to re-run a done copy after this node updated | «Скопировать заново» — working copy |
| 7 | a copy after a rehearsal built beside the rehearsal's 16 running processes → OOM | copy stops the server's earlier copy first — working copy |
| 8 | two installers on one build (`Another next build still in progress`, stale `.next/lock`) | copy clears the previous installer, build and lock — working copy |
| 9 | a rung could run after the move (a copy would stop the live server) | `mayStart` refuses after the move + test — working copy |
| 10 | one unanswered request stopped the tab's polling for good («Идёт работа…» of a finished rung) | both islands keep polling — working copy |
| 11 | a core rebuild on the server would answer visitors a bare 502 for ~12 min | nginx 503 page «updating» + Retry-After, `nginx -t` passed on the server — working copy |
| 12 | `s8y6x`, `bd5ln` installed on the server without OPENAI_API_KEY | OPEN — compare the services-install warnings on this computer with the server's before deciding |
| 13 | fork sync for a node that lives on a server (no Chrome there) | OPEN — D9 |

### 9.2 Measured facts the remaining design stands on (this node, 2026-11-13)

- Accounts, the architect included: `data/services/auth/auth.db` (+ WAL). Node identity: `data/node-code.json`. Wallets:
  `data/services/<id>/wallet/wallet.json` (`lib/web4-items/node-wallet.ts:47`).
- Stores: the data element's SQLite under `WEB4-ITEMS/core/data/data` (1.1 MB), storage files (376 KB), vectors (20 MB), the graph
  `data/services/graph` (14 MB); `data/services/embeddings` 240 MB is the model cache, not personal data; `data/workshop` 971 MB is the
  owner's template workshop — never for an independent server.
- Saving a bot token through `build/agent-api/channel` starts the poller only for a BORN element (`INSTALLED === "__BORN__"`), not for
  the core's main agent → on the server the poller must be started after the token (a core restart, or a door that calls
  `startIdlePoller`). Measure on the clean run before choosing.
- `lib/agent-kit/mount.cjs:122` refuses every agent wake in phase `silent` → a server that gets its OWN bot is phase `live` from its first
  start (it is independent: this computer keeps its bot, no 409).
- Durations measured: connect 4 s, probe 4 s, prepare 27 s (a server that already had the packages), copy+build 36:35 on 8 GB (core
  10:51–12:31, 13 elements 25:26), Claude sign-in 12:48 (the person's own pace), rehearsal 1:17. The move — not measured yet.

### 9.3 What remains — substeps (each with a model-free proof that reading code cannot pass)

| # | Result | Proof |
|---|---|---|
| 737-12 | commit the working-copy fixes 6–11 + the 24 GiB rule + README numbers; chain; push; CI | `test:hosting` ≥ 53 green incl. the new cases; CI three systems |
| 737-11a | rung **«Telegram»** after «Claude Code on the server», road «Переезд»: the node's bot found → «перенести этот бот» (it starts on the server only at the move rung) or «новый бот» (accordion = the core's own `TelegramChannel` with an optional `door` prop pointing at a new door `/api/node/server/telegram` that forwards each action over SSH to the server's `build/agent-api/channel` on loopback) | clean run: the token is accepted on the server (`getMe` there), START admits the owner, the server's main agent sends the welcome + first contact (`know-the-architect`) — the owner sees it in Telegram and the server's diary has it; negative: the moved bot never answers from the server before the move rung |
| 737-11b | road **«Новый сервер»** in the same tab (shares connect · probe · prepare · claude · telegram): **fresh** (the person's fork cloned on the server + the server installer, nothing personal) or **clone** (this node's silent copy) with the second question **«перенести данные этого узла?»** — yes: accounts, stores, memory travel; no: those paths are excluded and the server starts empty (its first registration through `npm run server -- window` is its architect). Re-deploy to the same server: yes = replace the server's data, no = code only. Never travels to an independent server: bot tokens, `data/node-code.json` (a new one is made), wallets, `data/workshop`, `logs/domain.json`, `data/node/server/` | clean run of each: fresh → the server has no `auth.db` from here and a new node code; clone without data → same elements, empty accounts (negative: this computer's accounts absent); clone with data → the same user count; this computer keeps working throughout |
| 737-13 | the clean runs: the owner reinstalls Ubuntu 24.04 in the provider's panel; the cancel road here (`node scripts/dedicated-server/move.mjs cancel`, or the tab's «Отменить установку») forgets the old server key — it resets even when the reinstalled server refuses the old key; road «Переезд» from zero (measure the move rung's time, then `return`), then road «Новый сервер» fresh with a new bot | every rung from zero with no hand on the server; durations recorded into the rung texts |
| 737-14 | the owner's Windows reinstall (6–8 GB) — the core's build time and whether it finished | his report: finished / minutes |

**Decisions waiting for the owner (my pick first):** D6 — one tab, two roads «Переезд» · «Новый сервер» (yes); D9 — fork sync for a
node on a server: a GitHub token with write to the fork kept by the node (yes), or the owner taps «Sync fork» on the phone; D10 — the
architect of an empty server = the first registration through `npm run server -- window` (the SSH window is «this computer» by the
law of §2), yes.

## 10. The domain in parallel with the move, and the place detected — the owner's message of ~14:40 UTC (verbatim) and the design

«Процесс идёт очень долго и было бы неплохо чтобы параллельно в этом процессе пользователя была возможность настроить свой домен то есть
подключить к нему необходимые записи “a” для каждого существующего субдомена а также разместить информацию о том что при создании каждого
нового элемента придётся вновь создавать новые записи. Также это скорее всего требует создания дополнительного шага … когда в
существующем процессе подключения собственных доменов мы должны подтверждать что в случае если это решение которое работает на сервере
предварительно мы должны добавить запись на регистратор. Также важно давать возможность проверить подключился регистратор или нет. Также
важно доводить информацию о том что если раньше этот домен использовался вами на другом сервере то переключение может занять до 24
часов, в то время как новые домены подключаются чаще всего мгновенно. … очень важно теперь найти способ нативно отслеживать является ли
данное состояние локальным или это выделенный сервер потому что до сих пор у нас существует вкладка где мы все это переключали руками.
Больше этого быть не должно согласен?» — **Agreed.**

**Measured (2026-11-13):** public DoH answers carry `TTL` (`example.org` A → TTL 152 s) — the waiting time is measured, not promised.
Element birth looks for the tunnel (`scripts/item-birth.mjs:349` `!domain?.tunnelId` → «address only on this machine») and `POST
/api/node/reach` creates a tunnel route + a Cloudflare record + a Workers copy — wrong on a server node. Place-dependent code today:
103 files ask «temporary address», 19 the Workers copy, 12 the tunnels, 11 `trycloudflare`, 5 the declared place, 6 the server phase.

| # | Result | Proof |
|---|---|---|
| 737-15 | **The domain opens right after «Подключение»** (the IP is known): the records table per domain with the `*` line, «Проверить DNS», and per name: points here · nowhere yet · elsewhere (IP shown) with the **measured TTL** — «the old answer lives in caches up to N min» instead of «24 hours»; a new name → «now». Two cases: a **new domain** — written now, certificates right after «Подготовка» (nginx serves the ACME path from then), so they are ready when the copy ends; a **domain this node already serves** (tunnel) — its records switch at the move rung (earlier would send the live site to an empty server), with the TTL shown beforehand | clean run: DNS written during the copy → the certificates are issued before the rehearsal; a changed record shows the measured TTL; negative: a domain in use is never switched before the move |
| 737-16 | **New elements on a server node** — birth asks the place: with the `*` record the node itself adds the name to nginx, issues its certificate and checks https from outside (nothing for the person to do); without it the birth names the one A record to add and waits for DNS; the tab says this once, beside the records table | a born element on the server answers by https within minutes with `*`; without `*` the birth line names the record; negative: no Cloudflare call on a server node |
| 737-17 | **Every domain flow asks the place first:** «Активация домена» (tunnel), an element's own domain, the node's extra domains — on a server each starts with «add the A record at the registrar → check» and ends with the certificate; on the computer they stay as they are | each flow driven on the server by the CLI/door and on the computer; the same door refuses the tunnel road on a server |
| 737-18 | **The place is detected, never declared:** the manual switch «Где размещён ваш проект?» and `data/node/place.json` go (its return under the ladder in `2d42766d` is undone). The place = the record written by the act that put the node there (the move, the «Новый сервер» road, the server installer); a node set up on a Linux server by hand is recorded by `launch` itself when the machine holds a public IPv4 on its own interface or a cloud metadata service answers; macOS and Windows — the computer. Per request the edge mark says whether it came through the server's nginx. One function `nodePlace()` — every place-dependent behaviour reads it (the 103/19/12/11 files above are the audit list) | fixtures: a server record → server; macOS → computer; Linux with a private IP and no record → computer; negative: no file and no switch can make this computer «server» |

**Decisions (my pick first):** D11 — the `*` record recommended by default (new elements need nothing at the registrar); D12 — a domain the
node already serves switches at the move rung, never earlier; D13 — the manual place switch removed now (the owner agreed).

### 10.1 Correction by the owner (~14:55 and ~15:05 UTC, verbatim) — D12 reversed, and simplified

«Одна из причин почему я тебя попросил перенести эти записи сразу заключается в том … чаще всего даже старой записи переезжают в
течение 20 минут. Как раз это времени нужно нам для того чтобы к моменту начало и завершения переезда домен уже проснулся. Хотя и
отработать сценарий при котором он ещё не проснулся тоже надо чтобы не получилось так что после переезда у нас чёрный экран».
Then: «Ты все ещё продолжаешь все усложнять. До завершения переезда у нас CloudFlare поддерживает статическую видимость этих страниц
поэтому нам не надо об этом вообще думать не так ли?» — **Yes.** Checked in code: the Worker of the static copy stands in front of every
address with «home first, the copy as the spare» (`scripts/static-copy.mjs` header, 458-10): an origin that is silent or answers 5xx →
the page from the copy, the rest → «the owner is offline» (503). A domain served through a tunnel is on Cloudflare and proxied, so its
visitors resolve to Cloudflare's addresses before and after the switch — the switch takes effect at Cloudflare's edge at once; stale DNS
caches play no part. My bridge (before the move) and relay (after it) are dropped.

| # | Result | Proof |
|---|---|---|
| 737-15 | The records switch right after «Подключение», kept proxied by Cloudflare (for a zone on Cloudflare the node writes them with its token; elsewhere the person does, «Проверить DNS» confirms). **Until the move, the server's nginx answers 503 to every name of the node** (the ACME path open) — Cloudflare then shows the copy, never the server's silent rehearsal; the move flips nginx to the live node | clean run: during the copy a public page answers from the Cloudflare copy; after the move the same address answers from the server; negative: before the move no request reaches the server's rehearsal node |
| 737-15c | The move stops this computer only when the rehearsal is green and every name that already points to the server has its certificate (the origin side of Cloudflare); otherwise it names what waits | negative: a missing certificate holds the move with the name in the message |

To verify on the clean run, not assume: how Cloudflare connects to the server (the zone's SSL mode) and that Let's Encrypt reaches the
server through the proxy; if it does not, the server takes Cloudflare's own origin certificate instead. A domain outside Cloudflare has no
copy, but it also serves no live node (a tunnel needs Cloudflare) — only a fresh domain, nothing to protect.

**D12 (reversed by the owner):** the records switch right after «Подключение». **D14 (my pick):** for a zone on Cloudflare the node
writes the records itself through the API and keeps them proxied; the person confirms once.

### 10.2 2026-11-13 ~15:10 UTC — the owner: «your choose go non stop»

All open decisions take my pick: D6 one tab, two roads; D9 a GitHub token with write to the fork kept by the node; D10 the architect of an
empty server = the first registration through `npm run server -- window`; D11 the `*` record recommended; D12 records switch right after
«Подключение» (the owner's reversal); D13 the manual place switch removed; D14 a zone on Cloudflare — the node writes the records itself,
proxied. Execution order: 737-18 → 737-15/15c → 737-17 → 737-16 → 737-11a → 737-11b; each committed after the chain; the clean runs
(737-13) need the owner's OS reinstall at the end.

### 10.3 737-11a as built (2026-11-13 ~15:30 UTC) — measured in the session that built it

- **Measured:** the core starts the main agent's bot poller at its own start (`lib/agent-kit/mount.cjs` walks every kit copy, `build`
  included) and the poller reads the token at every 3-s tick → a token saved on the server is read with no restart (the letter's
  `pm2 restart` dropped). The bot's «Запустить» button and «/on» reach `bridge.wake` through `telegram.setStarter`, NOT through
  `__web4AgentWake` → mount.cjs's silent gate never covered them: harmless while the silent copy carried no token, open the moment a
  server holds its own bot → the poller's own gate (`telegram.cjs` `silentServer()`): admits by the link, answers one line, buttons only
  acknowledged.
- **Built:** rung `telegram` between `rehearse` and `move`; the choice `move | later | reset` in the ladder's door, `new` recorded by
  `/api/node/server/telegram` when the person is admitted there (relay `scripts/dedicated-server/telegram.mjs`: browser → door → relay
  stdin → SSH stdin → `curl --data-binary @-` on the server's loopback channel door; the suggested handle gets `_srv`); the kit's
  `TelegramChannel` takes `remote` (12 copies synced, byte-identical); `serverKeeps` → the silent copy, the move and the road home leave
  a server's own bot folder untouched; after the live start the node wakes the server's main agent to greet (`greet` →
  `wakeMainByNode`, recorded in `move.json` → `welcome`).
- **Proofs:** `test:hosting` 63 (6 new: the order, the rules file, real rsync with its negative control, the poller's gate on the real
  module with Telegram replaced — mutation check: the gate disabled → 2 red); `test:hosting-move` 13 (the relay over the in-process SSH
  server — the token never in a command line, the server silent → `server-silent`; the move refused before the choice).
- **Left for the clean run (737-13):** a new bot admitted through the tab on a real server and its greeting after the move; the minutes
  of the new bot's three steps; whether the server's `session-lost` also wakes the main agent after the move (its session record travels
  with the copy, its Claude conversation does not).
