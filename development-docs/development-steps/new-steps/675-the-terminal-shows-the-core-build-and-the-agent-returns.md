# 675 — the terminal shows the core build, and the main agent comes back by itself

## 1. Retelling and decisions

The owner, 2026-11-07 ~17:30 UTC, verbatim: «Давай подумаем о том, чтобы когда ты запускаешь сборку и у нас выключается терминал ядра
чтобы вместо кнопки запустить агента, была бы индикация того что идёт сборка проекта. Мы уже реализовывали такой интерфейс который
показывает процесс сборки через удалённого чтеца и он у нас живёт в Даш борде развёртывании. Можем ли мы его перенести сюда на вкладку
терминали отображать чтобы не было иллюзия повторно нажать запуска агента? Также было бы прекрасно если бы можно было решить следующую
проблему после того как завершается работа по обновлению ядра в случае если нет ошибки то вводится кнопка закрыть и запустить агента и
кнопка просто закрыть, в самом идеальным вариантом было бы авто пробуждение после успешного завершения … То есть это и есть твоё
задание». Before it, on doing it alone: «чтобы ты не искал меня и сам полностью от начало до конца его выполнил при необходимости один
или несколько раз сделал синхронизацию» — read as the approval of this plan and of the pushes to Fractera and the fork syncs it needs.

I assume that: the indication belongs to every terminal of the agent kit in the core (the master, so all 14 copies) — every one of them
dies at the core build; «auto wake» means the agent that WAS running when the build stopped it comes back, in the SAME conversation
(`claude --continue`), only after a build that succeeded; an agent that was asleep stays asleep and the page offers the two buttons.

## 2. Reused

- `components/deploy/core-terminal.client.tsx` — the core terminal of the Deployments board (642-2/3): core door, then the build reader
  `http://127.0.0.1:25680/status` (`lib/deploy/build-reader.cjs`, `scripts/build-reader.mjs`), then «the core is starting».
- Its words — `sections/blocks/deploy-board.server.tsx` (`TERMINAL`, `FAILURE`) → moved to one shared file.
- Records: `data/node/node-update.json` (door `/api/node/update?tail=1`), `data/node/core-deploy.json` (door `/api/node/deploy?progress=1&core=1`).
- The wake door `/api/agents/wake` → bridge `wake` → `spawnAgent(…, { continueLast })` (620 already continues a conversation).
- The live sessions map `globalThis.__web4TerminalSessions` (`_agent-kit/server/session.cjs`).
- `scripts/spawn-free.mjs` — a process outside the core's tree.

## 3. Known limits

- The main agent dies at `closeLid` (its `claude` is a child of the core) — the return is recorded BEFORE `closeLid`.
- `node-update.mjs` that delivers this step is the OLD one already in memory; `serve.mjs rebuild` it spawns is the NEW one — so the
  return after an update is done by a waiter that `serve.mjs` starts (it waits for `node-update.json` done), not by `node-update.mjs`.
- No unordered behaviour: the waiter is one-shot (an event, 60 min at most), a wake happens only if the agent was running.
- Kit copies are never edited by hand: the master, then `npm run agent-kit:update -- <group>` (`check:agent-kits`).
- Components ≤ 250 lines, texts through words, every door `// @api`, a container carries `data-block`.

## 4. Observable results

1. A sleeping or dropped terminal during an update or a core build shows the build (stage, live lines, «from the reader») and no
   «Start agent» button; after it — «Close and start the agent» and «Close» (or «Close» and the failure note when it failed).
2. A main agent running when the build began is running again after a successful build, in the same conversation, with a line from the node.

## 5–6. Substeps, order, address

All in Fractera/web4-node-starter-kit `main` (workshop `~/fractera-dev/web4-node-starter-kit`), then the owner's node via the fork.

- **675-1 — the agent returns.** `lib/deploy/agent-return.cjs` (note before `closeLid`, wake after success, the waiter for an update),
  `scripts/agent-return.mjs` (the waiter), `serve.mjs rebuild` calls it; `/api/agents/session` action `status`; `/api/agents/wake`
  reason `core-back` (only `build`, confirmed, `continueLast`); bridge `wake` passes `continueLast`.
  Done: a running main agent comes back after a good build, an asleep one does not. Proof: (a) a script over a fake core — running →
  one wake with `core-back`; asleep → none; failed build → none (negative); (b) live on the node: after the update this session
  continues by itself (the diary shows the node's line, `session-mode.json` running with a new `at`).
- **675-2 — the terminal shows the build.** `components/deploy/core-terminal.i18n.ts` (shared words), `CoreTerminal` gets `onEnd` and
  `noReload`; kit master `core/client/core-build-watch.client.tsx`; `agent-terminal.client.tsx` wraps its sleeping card and reads
  `?start=1`; the 14 copies updated. Done: a terminal of a sleeping agent shows the build instead of the button and the two buttons at the
  end. Proof: (a) `npm run eyes` on a sleeping element's terminal with a running update record and the reader up — the build view, no
  `[data-agent-start]`; (b) negative: without the record — the start card; then the record done — both buttons.

Not in it: element processes' own terminals (in element repositories), a bare `npm run serve:rebuild` gets the reader's lines and «the
core is back» without a verdict (it writes no record).
