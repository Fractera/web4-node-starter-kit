# 806 — a clean server install with a live terminal (and 807 — the build's live log) — summary

Closed 2026-11-19. Repository: the core (`main`), commits e878aa8c, f22c10be, fec0535c, d48952d4, 0d70f5ac, 9fe57bfe, 1438f85f, c6bcaa44,
e56b73ad (807); builds f22c10be and 6526c80d live; the fork pushed (the server installs from it).

## The owner's words

- 19:2x: «ты можешь создать какой-то внешний чтец и показывать этот процесс установки сервера … что-то вроде терминала? Я хочу видеть
  что что-то происходит».
- 19:3x: «Когда я нажимаю кнопку очистить разве ты не должно предполагать очистку диска … Fractera Easy стартер … по 1000 раз
  устанавливался на этот сервер»; 19:4x: «полная очистка … подними терминал и пусть отдельный чтец тебе возвращает живой файлы».
- 19:3x (807): «живая лента … уже несколько дней не существует а вместо этого я вижу голубую экран с одной единственной палочкой».
- 20:2x: «yes of course 100%» to erasing the Easy Starter and Docker's unused; then «всегда стирать … очищаем сервер значит очищаем на 100%».

## What was built

- 806-1/806-8 `clear.sh`: a Fractera node is ERASED (no longer moved to `/root/fractera-cleared-*`), with every older copy, the node
  user's caches, root's npm cache and — always — `leftovers.sh` (the Easy Starter's trees `/opt/fractera*`, root's caches, `docker
  system prune`). Kept: ssh keys, the server's Claude sign-in, `/etc/fractera` (the node's own), `/etc/letsencrypt`, a stranger's
  set-aside sites, the bot token, the stopwatch. `--keep-site` on «с нуля» keeps the «updating» page. Runs detached, waited 25 min.
  A door action `leftovers` for a server already cleaned.
- 806-2 the probe: the disk whole (total, used), older copies, the largest folders (measured detached — a whole-disk du outlasts a probe).
- 806-3 `log.sh` + the door action `log`: the running stage's log tail, the checklist (stages, the install's steps, one line per element
  from the services:install header's time), seconds and «last time» (`timings.json`), quiet seconds, processor, memory, disk.
- 806-4/5 the page: step 4 = the checklist + the core's LiveLog part, polled every 3 s one question at a time; a quiet log ≥ 3 min is
  named — busy processor = a long step, idle = red «looks stuck». The clear dialog says «for good» and the disk.
- 806-7 the cause of one line for 41 minutes: `state.sh` took the «launch» row for the running stage.
- 807 a bare `serve:rebuild` writes its own `logs/core-build.log`; `rebuild-detached` passes its log to the reader.

## Proofs

- Tests: `scripts/server-install-live.test.mjs` 16 ✓ — real clear and leftovers on scratch trees with negatives (the keys, /etc/fractera,
  certificates, a stranger's site stay; «..» erases nothing), the reader, the state's steps; `hosting.test` 76 ✓ (the clear guard).
- On the server 109.199.105.213: the clear 20:07–20:16 freed 3 → 72 GB; leftovers 20:41 freed 35.4 GB → 99.3 GB free of 145; the fresh
  install from 20:19 shown live — the checklist with times and «last time», element lines (auth 173 s, data 154 s, …), the log tail
  (his Chrome, screenshots 20:25).
- 807: a watcher through two builds — 19:56 the reader gave 0 lines (the page «…»); 20:34 3 → 98 → 200 lines, the page showed the build
  (scratchpad watch807/shot-008.png).

## Mistakes on the way

- I called the 18:55 install hung (19:29) — it was not: the page simply could not show its steps.
- Clear's first wait (9 min) was too short for ~140 GB; the first disk «largest folders» (du in 30 s) said nothing.
- The clear had forgotten root's npm cache and the Easy Starter's trees (20 + 24 GB) — the owner had to say it.

## Left open

- The install's end and the server's ready check (steps 6–8), Marina re-created, then his 804/805 test.
- The push of the core to Fractera (his paste).
- What still holds ~46 GB on the server besides the node: swap ~16, the system, journals — measured after the install.
