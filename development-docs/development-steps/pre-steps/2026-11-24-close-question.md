# Task for the creator agent (Mac): an element's «Выключить его?» comes after every answer (Roma, Telegram 319, 2026-11-24 13:36 UTC)

From the main agent of the server node fractera.ai (core build bf75a3ef). Roma's words, condensed: the main agent used to send
«Выключить его?» after every answer. That was changed: one short message at the start of the session, and if the person ignores it, it
is never shown again. The Fractera marketplace element, born from the native template, still gets the question after every answer.
Roma recalls that the custom template was fixed too. On this node the custom element gets the same repeated question (proof 2), so the
fix seems to cover only the main agent.

## 1. What the person sees

The element's bot (F2F-Marketplace, element lidt5, native template v0.1.81, registered custom, walled) sends after almost every answer:
«Агент f2f-marketplace закончил. Выключить его? Ответьте «выключить» … «разбор» … «команды»». Roma's screenshot: 13:32 UTC, right after
the agent sent its file `kviz-magazina-3-urovnya.txt`.

## 2. Evidence (this node, `logs/web4-out.log`, the core's own log lines, local time UTC+1)

- lidt5 today: `[agents/done] lidt5 close=false → asked 1` at 13:22:27, 13:27:13, 13:34:41, 13:42:06, 13:52:36, 14:12:04, 14:23:19,
  14:32:20. That is 8 questions in 70 minutes, one per finished answer. 14:32:20 local = 13:32 UTC, the message in the screenshot.
- z8asv (custom template v0.3.238), so the custom template does it too: `asked 1` at 2026-11-23 02:49:25 and again at 02:50:02 (37 s
  apart), then 14:44:05, 15:05:29, 2026-11-24 11:10:26.
- Totals in the log since 2026-11-21: lidt5 `asked 1` ×9, z8asv `asked 1` ×5.

## 3. Cause in the code (core, agent kit, the same in all 13 copies)

- `app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/bridge.cjs`, `done()` lines 1243–1246: step 603-3 returns
  `asked: false` only when `modes.baseOf(service) === 'build'`, meaning only the main agent. Commit ab24fc1f says it plainly: «Other
  elements keep their behaviour».
- Line 1274: every other element goes to `telegram.askToClose(service, 'done', …)` on every `done` without `close`.
- `telegram.cjs` `askToClose()` (line 1394) has no once-per-session memory. It only replaces the previous question of the session (639).
- The once-per-session hint (step 615-4, commit 3f150454) is `lib/agent-kit/progress.cjs` `hintOnce()` (line 365). It is called only
  `if (element === 'build')` (line 357) and remembers sessions in `data/node/progress/hinted.json`.
- The element instruction (`lib/instructions/element/element-instruction.src.md` line 214) tells every element to report
  `/api/agents/done` after it prints the answer. In a Telegram conversation that means one `done`, and so one question, per answer.

## 4. What is needed (Roma's rule extended to every element agent: native, custom, root)

- In a person's conversation with an element (its bot or its terminal), no «Выключить его?» after an answer. One hint per session after
  the first answer: the 615-4 text «Вы можете управлять мной при помощи команд: – выключить – разбор – команды». It disappears like
  any hint (639). If the person ignores it, it never comes again in that session.
- Keep what already works: the 60-minute reminder (409-5), the closing of a session the main agent woke for an element without a bot
  (592-3), the silence under supervision (548-20), the `close` path and `tellClosed` (666).
- The likely shape: remove the `build` condition, so `hintOnce` runs for an element's reply in its own chat (with the element's bot
  token and language), and `done()` without `close` returns `{ asked: false, conversation: true }` for a session the person started.
  A session a node task woke (`npm run task`, a clock) keeps its current behaviour. To decide: does an element with no bot (terminal
  only) get the hint in the terminal, or nothing?

## 5. How to prove the fix

1. Probe: one element session with a bot. Three answers in its chat give exactly one hint message and zero «Выключить его?». The
   core's log shows `asked false` ×3 and `hinted.json` has the session once.
2. The same probe on a native element (lidt5-like, walled on a server) and a custom one: the same result. The wall must not block the
   bot token or the progress file (skill `server-wall`).
3. Regression: the 60-minute reminder still comes, «выключить» still closes with the closing words, and a task woken by the main agent
   for an element with no bot still closes itself.
4. Release: the 13 kit copies in the core plus the element instruction line if the wording of «report done» changes (custom, native,
   root templates, then rollout).

—
No keys or personal data in this file. The source is the node's own log and the core's code at bf75a3ef.
