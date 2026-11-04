# 642 — The deploy board shows the work live: a terminal under each element and under the core, and a failure that says what happens next

## 1. Retelling and decisions
The owner, 2026-11-04 ~14:05 UTC, verbatim: «Сейчас развёртывание проходит совершенно вслепую … некоторое время назад раньше, мы делали
эту задачу несколько иначе: прибор открывалось вниз около терминала высотой например в 400 пикселей в котором проходила процедура
развёртывания с фокусировкой на последнюю строчку таким образом пользователь видел чтобы компьютер не завис. Можем ли мы сейчас дашь борт
развёртывания изменить таким образом чтобы от каждого элементом и в том числе ребро в случае запуска развёртывания вниз открывалось
подобное решение? А также … скажи если процессе этого какая-то ошибка что должно произойти в идеальном сценарии так чтобы пользователю
было понятно что прямо сейчас процесс в режиме отладки будет перезапущен? Очень продумает кейс мы вернёмся к тестированию навыков после
того как закроем эту временную задачу».

Found while reading (2026-11-04):
- The terminal exists: `LiveLog` (353-3, «контейнер который увеличивается максимум до 400 пикселей»), on an element's own page
  (`element-deploy.client.tsx`). The door already gives each element's live log (`GET /api/node/deploy?progress=1&log=<id>`,
  `lib/deploy/live-log.cjs`, written by `deploy-elements.mjs`). The deploy board never asks for it — so the board is blind.
- The core is harder: its build runs with the lid closed (553) — every process of the node stops, the core too, so the page that would
  show the log does not answer for 8–12 minutes. The log is written (`logs/core-deploy.log`), nobody can show it. `serve.mjs rebuild`
  builds with `spawnSync` (its own event loop is blocked), so a reader must be a separate small process.
- On a failure today: the previous build comes back by itself, the node starts again, the line «Сборка НЕ УДАЛАСЬ — возвращена прежняя
  сборка» lands in the log, and the board shows «последняя сборка упала» with 12 lines. No retry, no one is asked to look.

I assume that:
- the core's terminal is for this computer (localhost), where the owner works; through the internet the pages keep answering with
  Cloudflare's copies during the build exactly as now (the reader does not answer on the core's port — that would replace the copies);
- the reader is a plain Node HTTP process of a few tens of MB, started after the lid closes and stopped before it opens; it answers
  only 127.0.0.1 and serves only the tail of the build log and the stage;
- «перезапущен в режиме отладки» is shown as states, never as an endless loop: one automatic retry only for a known passing cause, and
  only after the person sees why; a fault in code goes to an agent, with the person watching.

## 2. What is reused
`app/[lang]/(architectLayer)/_components/live-log.client.tsx` (`LiveLog`), `lib/deploy/live-log.cjs` (`logPath`, `tail`, `runLive`),
`app/api/node/deploy/route.ts` (`?progress=1&log=`), `scripts/deploy-elements.mjs`, `scripts/core-deploy.mjs` (`logs/core-deploy.log`,
`data/node/core-deploy.json`), `scripts/serve.mjs rebuild`, `lib/deploy/quiet-build.cjs` (`closeLid`, `openLid`), `scripts/node-update.mjs`
(its stages and log in `GET /api/node/update`), `components/deploy/deploy-board.client.tsx`, `core-deploy.client.tsx`.

## 3. Known limits — what must not break
- The lid (553): all memory to the build; the reader is the only new process and is small; it never holds the core's port.
- The tunnel is not restarted and the internet sees the copies, as now (decision 2026-09-19, 344/385).
- One deployment at a time (409); the previous build returns on any failure (ANTI-PATTERNS «Оборванная сборка ядра…»).
- The core never reads or edits an element's code: a fix in an element's code is its own agent's work.
- No endless retries; nothing is retried silently.
- Typography and dialogs through the primitives (`check:typography`, `check:dialogs`).

## 4. Observable results
- An element's «Развернуть» → a terminal opens under its row, grows to 400 px, holds the last line, the lines move every second.
- The core's «Развернуть» or «Обновить узел из форка» → a terminal under the core card; when the core stops, the same terminal keeps
  moving (lines from the reader); when the core is back, the page shows the result without a reload by hand.
- A failure → the terminal ends with a line in plain words: what fell, at which step, that the previous version is back and working, and
  what happens next (a retry with its reason, or «передать агенту»).

## 5–6. Substeps, order, address (core `Fractera/web4-node-starter-kit`, `main`)
| # | Result | Rests on |
|---|---|---|
| 642-1 | elements: the terminal under the row on the board, live, and the result line kept after the end | — |
| 642-2 | the core: the build reader on a local port while the lid is closed; the board's core terminal through the whole build | 642-1 |
| 642-3 | the node update (fork → elements → core → skills): one terminal through all stages, the core's part through the reader | 642-2 |
| 642-4 | a failure in plain words: what, where, «прежняя версия работает», then the next state — one retry for a passing cause (memory) or «передать агенту» | 642-1, 642-2 |

## 7. Substeps
`642-1.md` … `642-4.md`.

## 8. Acceptance of the plan
Stages 1–7 present; every substep names what is built, done, two proofs from different planes with a negative control, what it rests on
and what is not in it.

## 9. The owner's approval
— (waiting)

## Not in this step
A core build without downtime; showing the core's terminal through the internet during the build; an agent that fixes the core's own
code (the core is fixed upstream, in Fractera).
