# 707 — The agents come back after ANY end of a core build: good, failed or cut off

## 1. Retelling and decisions

The owner 2026-11-09, verbatim: «можешь ли ты преподобных ситуациях с неудачным исходом автоматически поднимать себя так же как и
удачным?» and the test he asked for: «попытаться выполнить действия при котором возникнет аналогичная проблема но в этот раз чтобы ты
смог подняться». This replaces the lock of 675 «only after a GOOD build» (`lib/deploy/agent-return.cjs`).

What happened on his node at 13:06–13:10 WET (measured, not guessed):
- The main agent started `npm run node:update` as its OWN background child (`run_in_background`), against the skill
  `core-build-return` («detached, never as your own child — `node scripts/spawn-free.mjs scripts/node-update-run.mjs`»).
- The update merged the fork (HEAD `586e4b07`), installed the elements, wrote `agent-return.json` (13:09:02), closed the lid — and the lid
  killed the core, the agent's `claude` with it, and so the update itself, mid-build. Its output
  (`/tmp/claude-501/node-update.txt`) ends at «Работают агенты: build».
- Nobody wrote an end: `node-update.json` still says `running` (pid 46352, dead), `agent-return.json` and `quiet-build.json` stayed. The
  health watch restarted the core at 13:10:21 on the OLD build; no waiter, no return, no line to anyone.
- An earlier wrong diagnosis of mine (Google Fonts) read `logs/node-update.log` of 04:26 — another run. The fonts failure is real
  (that run) and goes into 707-4.
- Also on the way: `npm run node:update -- --help` started a REAL update (13:05:57 backup) — the script has no argument check.

## Substeps

**707-1 · A failed build returns its agents too.** `serve.mjs rebuild` (both failure branches: the build, the language signals) and
`afterUpdate` (update `failed` / `refused`, timeout) call `wakeAfter` with a failure summary instead of `drop` + `deliverHeld`. The main
agent's line names the failure, the cause (`build-failure.cjs` `causeOf`), «the previous build runs again», and «do not close yourself».
- Proof: a unit run on fixtures (record + failed state → the wake door called with `core-back`); negative: no record → nobody woken.

**707-2 · A build cut off returns its agents at the core's next start.** At the core's boot (beside `[main-agent-cron]`): a record
`agent-return.json` whose build is dead (no live pid of `node-update.json` `running`, or older than the build could last) → mark the
update `interrupted`, open the lid if `quiet-build.json` is left, and wake the listed agents with «the build was cut off; the previous
build runs». An event (the boot), not a timer.
- Proof: fixtures (dead pid + record → wake; live pid → nothing).

**707-3 · The update refuses to run inside an agent's process tree and on unknown arguments.** `node-update.mjs`: any argument it does
not know → refuse, nothing touched; started under a core session (the agent's environment marker) without `spawn-free` → refuse with the
right command.
- Proof: `--help` refuses with no backup folder written; negative: the right start passes the check.

**707-4 · The core's fonts from npm, never from Google at build time.** `lib/fonts.ts` → `next/font/local` over
`@fontsource-variable/geist` and `geist-mono` (OFL-1.1, the step-315 way). BUILT 2026-11-09: both pinned 5.3.0 in package.json (they
were extraneous), latin wght files, the same CSS variables; the node update's deps stage installs them. Proof: the dead-proxy rebuild
on the node must now SUCCEED.

## Verification, end to end (the owner's test)

On his node, release A (707-1..3 with 706-8) merged by `node:update` started the right way:
1. A real failing build like the Google Fonts one: `serve:rebuild` with a dead proxy for the build (`https_proxy=http://127.0.0.1:9`,
   `no_proxy=localhost,127.0.0.1`) — Geist cannot be fetched → the build fails twice → **the main agent comes back by itself** with the
   failure line (`logs/agent-return.log`). Negative control: the same run on the old code returned nobody (01:59 and 13:10 today).
2. A normal rebuild → good → the agent comes back; 706-8 live.
3. Release B (707-4) → the same dead-proxy rebuild now SUCCEEDS: the fonts need no network.

## 707-5 — the lid opens only what is down (defect of the 707 live run, 2026-11-09)

The owner: «такого раньше не было всегда ты просыпался автоматически что-то сломал». Found: the 13:09 cut-off update left
`quiet-build.json`; the health watch raised the core; the 13:43 update's `openLid` ran `pm2 start` on all 12 names — pm2 restarts a live
process — the core restarted 13:45:11, the main agent (its child) died before `noteBefore`, which then logged «Ни один агент не
запущен», so nobody was recorded and nobody came back. Fix: `openLid` starts only names not online and returns what it started.
Proof 1: fixture (stubbed pm2, scratchpad t7075/lid-test.cjs) — fixed: one start, PASS; old code: three starts incl. the core, FAIL.
Proof 2: the live update that carries this step must bring the main agent back by itself.

## 707-6 — Messenger of the main agent hidden until Lagrix

The owner 2026-11-09: «на вкладке глав агент есть вкладка Messenger. Её надо скрыть до появления lagrix». `MAIN_AGENT_HIDDEN`
(menu and the main agent's index), folders and addresses kept so the menu guard still matches the element tree; the main agent's
Telegram bot stands in «Строительство» while Messenger is hidden (`MAIN_AGENT_PLACE_WHILE_HIDDEN`, checked by the guard). Proof: guard
ok; eyes on the live menu after the update.
