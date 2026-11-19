# 806 — a clean server install with a live terminal

State: PLAN — waits the owner's «да». Asked 2026-11-19 ~19:40 UTC (terminal).

## The owner's words (verbatim)

- 19:2x: «Мне нужен другой процесс установки сервера это никуда не годится ты можешь создать какой-то внешний чтец и показывать этот
  процесс установки сервера так как ты показываешь все процессы когда например собирается наш проект что-то вроде терминала? Я хочу
  видеть что что-то происходит».
- 19:3x: «Когда я нажимаю кнопку очистить разве ты не должно предполагать очистку диска … Fractera Easy стартер всегда без проблем по 1000
  раз устанавливался на этот сервер».
- 19:4x: «сейчас останавливаю разработку и переделывай установщик … должна быть нормальная чистая установка после удаления полная очистка
  памяти это во-первых во-вторых мне нужен реальный живой процесс я должен видеть что происходит установка подними терминал и пусть
  отдельный чтец тебе возвращает живой файлы».

## Measured (2026-11-19 19:27–19:40, the server through his Chrome)

- The install of 18:55 (after «clear» at 18:52): prepare ✓, source ✓, install «running» since 18:56:16 with NO line in
  `install.progress.jsonl`; RAM 6 of 8 GB free (nothing builds); nginx not listening (80/443 closed — the site down); disk free 7 GB of
  /home (the probe measures only free space).
- `clear.sh` (737-7, 744-4) MOVES the old node whole into `/root/fractera-cleared-<ts>` — never erases. His 744-4 word was «удалить»; I
  built «set aside». Three clears on this server (11-18 15:15, 11-19 08:14, 11-19 18:52) → three full copies.
- The door `/api/node/launch` gives stages only (`state.sh`); no action reads a log, so the page cannot show what runs.
- The Easy Starter (Fractera/fractera-easy-starter): `lib/wipe-script.ts` erases EVERYTHING its installer created (pm2 kill, the app
  trees, caches, configs, its nginx sites, the install logs) and keeps apt packages, /root/.ssh, /var/log and /etc/letsencrypt (the
  certificate limits); `lib/bootstrap.sh` reports every step with its percent and elapsed time.

## Substeps

- 806-1 **A full clean.** «Очистить» and «Установить с нуля» ERASE, the Easy Starter's way: the node user's pm2 killed, the node's
  folder, every `/root/fractera-cleared-*` and `*.before-*` copy, the node's nginx sites, the launch records, the node user's caches
  (npm, Playwright). Kept: apt packages, /root/.ssh, /var/log, /etc/letsencrypt, foreign sites (as today). The dialog says «навсегда» and
  shows the gigabytes it frees (measured before), the page — the gigabytes free after.
- 806-2 **The disk whole.** The probe: total · used · free and the largest Fractera folders; the verdict before install names them.
- 806-3 **The reader.** The door gets `log`: over SSH, by the visit key, the new bytes of the running stage's own log (launch, prepare,
  install, every element of `services:install`, start) from an offset — no port opened on the server, it works while the server's node
  is down (the build reader's idea, through SSH).
- 806-4 **The terminal on the page.** The core's «Build log» part (LiveLog, the same look as the core build) under the install step from
  the first second to the end, polled every 2 s, the last line in view.
- 806-5 **The checklist.** 20–25 lines: the launch's stages, the install's sub-stages, one line per element — each with its start, how
  long it runs and how long it took last time; a red «молчит N мин» when the log has not grown for 3 minutes.
- 806-6 **The site during an install.** Measure why nginx stops listening and keep the «идёт обновление» page up.
- 806-7 **Today's hang.** With the reader: why install.sh writes nothing (runuser -l, a prompt, a lock) — fixed at its cause.
- 806-8 Delivery: prebuild, one core build (the panel and agents quiet ~10–15 min), the push (his paste), then on this server: «Очистить»
  → the GB freed → install with the live terminal → the node live (/api/health = the pushed commit).

## Proofs (two planes)

- Wire: the wipe's dry run lists what it erases and keeps; on the server — free GB before/after, no `fractera-cleared-*` left,
  /etc/letsencrypt and /root/.ssh untouched (negative control).
- Eye: the page during the real install — the terminal moving, the checklist with times; a stopped log turns red (a negative made by a
  paused stage in the dry run).

## Not in it

- An update of a living server through the computer (stage 0) — unchanged except its terminal.
