# 815 — the node's update from the banner in one road, with a visible state at every press

State: AGREED — the owner (Telegram 241, 17:33): «Поддерживаю твой шаг надо все исследовать и исправить» (to the proposal, Telegram 240).

## The owner's words (verbatim, Telegram 236, 237, 239)

«Нажал кнопку обновить сборку ядра которое было в баннере. Смотри какая проблема: я сейчас не понимаю идёт процесс или не идёт процесс у
меня до сих пор горит этот баннер проверь» · «даже если процесс идёт нужно ведь чтобы была правильная индикация? … до сих пор горит кнопка
синхронизировать Fork почему я давно синхронизировал, горит кнопка обновить сборку ядра? Почему я же нажал её» · «эта кнопка открыла
страницу … очень непонятно … я вижу модельный окно обновить узел из Fork. И по идее я должен нажать кнопку развернуть. Первые три раза
кнопка не на жалось спустя 1 минуту я смог её нажать … дашборд развёрнуты не показывают активность нужно протестировать и сделать
нормальный поток в этом месте»

## Measured (2026-11-20, the server 109.199.105.213, core 1f7b36ae, through the SSH window)

- 17:28 GET /api/node/update: fork synced (behindBy 0), nodeBehind 16, update null — the banner's press started NOTHING: «Обновить сборку
  ядра» (`origin-notice.client.tsx`) is a link to the deployments tab; the banner stays word for word the same over that tab.
- The start lives on the tab: the core card «Обновить узел из форка (16)» → AppDialog → «Развернуть» (`core-deploy.client.tsx` start());
  start() shows nothing until the door answers — no busy state, no spinner.
- The banner asks the trial merge (POST preflight: fetch, a worktree, a merge — up to 120 s) by itself on EVERY page open while the node
  is behind; the deployments tab opened by the banner fires one more. I ran one by hand 17:30–17:31 — the minute of the dead button.
- 17:31:44 the update started at his fourth press; the door's `update` spawnSync blocks the Next process up to 10 s.
- «Синхронизировать форк» stays on the banner after the sync (an underline link, still there).

## 815-1 measured (2026-11-20 17:52 UTC, the server after the update to ada53203, through the SSH window; and the Mac)

- Server: GET /api/node/update 0.27 s · GET /api/node/deploy 10.8 s, 9.4 s (during a preflight), 8.7 s · POST preflight with nothing to
  merge 3.5 s · the deployments page itself 1.8 s.
- The cause of the dead minute: `elementCodeState` runs two SYNCHRONOUS git calls per element (11 elements) inside GET /api/node/deploy
  — the core process is frozen for the whole read; the board asks it on open, 0.8 s after every action and every 3 s while deploying.
- Mac (fccfbd29, before 815-8): GET /api/node/deploy 6.7 s; /api/health sent DURING it waited 6.4 s (the freeze, the negative control).

## Substeps

- 815-1 measure on the server after the release lands: GET /api/node/update, GET /api/node/deploy, POST preflight — each alone and the
  GETs while a preflight runs; how many preflights one walk banner → tab → dialog fires. Numbers into this plan.
- 815-2 the trial merge once per target: the door keeps its verdict by (HEAD, origin/main) and answers it again without a merge; a page
  open never starts a second one while one runs (the door says «checking»).
- 815-3 the banner's «Обновить сборку ядра» starts the update itself (POST update), no tab and no dialog; the press shows «Запускаю…» with
  a spinner and locks at once; a refusal is named in words.
- 815-4 while the update runs the banner on every page says «Идёт обновление · <этап> · <N мин>» (its state asked every 5 s only while
  running, as the board already does) and hides «Синхронизировать форк» and the rebuild button; the board's core card says the same.
- 815-5 «Синхронизировать форк» only while the fork is behind Fractera (or unknown); a synced fork shows no sync button.
- 815-6 the board's start: the same busy state on «Развернуть» (the dialog's button) and the update door answers without spawnSync.
- 815-8 the deployments door reads every element at once with async git (`elementCodeStateAsync`); the sync helper stays for the
  single-element callers (rollback, the element page).
- 815-7 proof: tests of the banner states (DOM probe as in final-check: behind / synced / running / failed), eyes of the banner on the Mac
  and on the server through the SSH window; the owner's live walk on the next release.

## Test checklist (shown to the owner before code)

1. Synced fork, node behind → the banner has ONE action «Обновить сборку ядра», no «Синхронизировать форк».
2. Press → at once «Запускаю…» + spinner, the button locked; within ≤ 15 s the banner says «Идёт обновление · этап».
3. Open another page while it runs → the banner still says «Идёт обновление», no new trial merge started.
4. A refusal (an element deploying) → the banner names the reason, the button comes back.
5. Fork behind Fractera → «Синхронизировать форк» is the main button, the update button locked with its hint.
6. Negative: a second press during the run starts nothing (409 named), no second update.
7. The board's dialog «Развернуть» shows «Запускаю…» at the press.
