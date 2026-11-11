# 728 — the reset wake survives a long session: the node sees the screen move, the letter goes only into the new conversation, a test keeps it

## 1. Retelling and the owner's words (2026-11-11, WET = UTC)

- 18:23 «Только что сбросил сессию но не проснулся ещё одна проблема мы же вроде её решили»
- 18:24 «Добавлять тестирование этой проблемы: после сброса сессии не просыпается терминал для тебя или элементов»
- 18:40 «go to finish non stop , not call me , i am going out for 2 hour» — the plan is approved by this word: an autonomous run, my own
  choices, the push, the fork sync and the node update included (memory `feedback-autonomous-runs`).

Asked: why the main agent's fresh session did not wake after its own reset although 700-3 and 708-7 were proven; fix it for the main
agent and for the elements (the same bridge serves both); add a test of exactly this.

## 2. What happened — measured (the core log, `data/services/build/pulse.json`, the two transcripts)

| time (UTC) | event |
|---|---|
| 18:21:41.5 | the main agent (conversation bd70b093) runs `npm run session -- clear --continue`; its turn goes on (the final message) |
| 18:21:46.4 | the owner's message arrives in the middle of that turn — Claude Code queues it |
| 18:21:47.7 | the bridge types `/clear` — 4.75 s after the ask, the earliest moment `whenIdle` can answer; the turn still runs, Claude Code queues it |
| 18:21:48.9 | the turn ends; the owner's message runs as a new turn of the OLD conversation |
| 18:21:56.3 | the bridge pastes the letter `⟦node · context-reset⟧` — 3.5 s after its 5 s pause, again the earliest moment — into the running OLD turn |
| 18:22:17.1 | the OLD conversation (window 65 %) answers the letter: «Продолжаю после очистки окна, по письму…» |
| 18:22:17.4 | the queued `/clear` runs: pulse `session-end reason=clear`; the new conversation 57daaf7f is born (18:22:19) and gets nothing |
| 18:23:11 | the owner writes into the empty conversation: «…не проснулся…» |

The fresh conversation's first window line said 65 % (the old conversation's `context.json`); the real value was 7 %.

## 3. Root cause

`session.remember` keeps the last 256 KB of the screen; `whenIdle` and `pasteWhenReady` decide «the screen went quiet» by
`buffer.length`. A full buffer's length never changes, so every session that printed more than 256 KB looks idle 4 s after any request.
Reproduced without a model: a full buffer plus 40 spinner redraws — length 262144 → 262144, «the bridge sees new output: false»; a young
session — true. The 700-3 and 708-7 proofs ran on young sessions (today 14:28: the bridge waited 11 s for the real end of the turn) —
that is why it «worked».

The same blind measure also drives: the model switch (`session model …` stops and restarts the session — can cut a working turn), the
queued pass of 715 (closes a session it thinks idle — can close a WORKING one, against its own rule) and every paste into a live session
(wake, trust notice, channel task).

Second defect of the same incident: the window hook reads `data/services/<id>/context.json`, which names no conversation — a fresh
conversation is told the old window (65 %; from 85 % it would say «reset NOW» and cause a needless second reset).

## 4. What is reused

- the kit master `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server/session.cjs` and `bridge.cjs`; the copies by
  `npm run agent-kit:update`; the guard `npm run check:agent-kits`;
- the pulse `lib/agent-kit/pulse.cjs` (686-2): `session-end` with the SessionEnd hook's `reason` — observed `clear` at 18:22:17.352;
- the transcript watch of 708-7: `resume.ids`, `resume.bornSince`, `resume.journalDir`;
- the test pattern of `scripts/update-wake.test.mjs`: ✓/✗ lines, `===…_OK===`, the exit code.

## 5. Known limits

- the kit copies stay byte-identical to the master (`check:agent-kits`);
- a paste never answers a question on the screen (636-7, `questionOnScreen`);
- the test never touches the node's live records — `data/services/build/*` is the running main agent's own (pulse, session-mode): it runs
  in a temporary root and a temporary home;
- no model and no real `claude` in the test.

## 6. Observable results

- in a session with a full screen buffer the bridge types `/clear` only after the real end of the turn;
- the letter is pasted only after the clear happened (pulse `session-end reason=clear` after `/clear` was typed, or a transcript born
  after it) — it is the first message of the new conversation and never reaches the old one;
- a fresh conversation's first window line is silent instead of the old conversation's percentage;
- `npm run test:reset-wake` red on the old code, green on the new — for the main agent and for an element.

## 7. Substeps

| | result |
|---|---|
| 728-1 | the test `scripts/reset-wake.test.mjs` reproduces the 18:21 incident for the main agent and an element — red on the current code |
| 728-2 | the measure counts every byte; the letter waits for the clear and goes into the new conversation — the test green |
| 728-3 | the window line knows its conversation: `context.json` names it, the hook keeps silent for another one |

Delivery: the copies, the push, CI, the fork sync (Chrome), `npm run node:update`; the live proof — the main agent's own reset at the end
of this run (the core log and the pulse show `/clear` after the turn's end and the letter in the new conversation).

## 8. Order and address

Fractera/web4-node-starter-kit, branch main, working copy `~/fractera-dev/web4-node-starter-kit`. 728-1 → 728-2 → 728-3 → push → CI →
the fork aifa-agi synced → `npm run node:update` on the node → the live proof.

## 9. Not included

- a live reset of an element's agent — it costs that element's model turns; the same bridge code is tested with an element's session;
- moving «is a turn running» from the screen to the hooks: the pulse is ambiguous for queued messages (measured: UserPromptSubmit fires
  when a message is queued, and a queued message may then run as its own turn with no turn-start of its own).
