# 728 — the reset wake survives a long session; the window line knows its conversation; a test keeps both — summary

**Commits (core `Fractera/web4-node-starter-kit`):** `e815bc03` plan · `0b014286` 728-1 the test · `610ca459` 728-2 the fix (master + all
twelve kit copies) · `9ab8cea1` 728-3 the window line. CI `three-os` of `9ab8cea1`: success (ubuntu, windows). On the node (fork aifa-agi
synced in Chrome, compare identical): the update `a4b1b048`, core built 18:49:19Z, started 18:51:37Z.
The plan, deleted in this commit: `git show <this commit>^:development-docs/development-steps/new-steps/728/728-main.md`.

## The owner's words (2026-11-11, WET)

18:23 «Только что сбросил сессию но не проснулся ещё одна проблема мы же вроде её решили» · 18:24 «Добавлять тестирование этой
проблемы: после сброса сессии не просыпается терминал для тебя или элементов» · 18:40 «go to finish non stop , not call me , i am going
out for 2 hour» (the plan approved by that word).

## What happened and why (measured)

The main agent ran `npm run session -- clear --continue` at 18:21:41 and went on with its final message; the owner's message came in the
middle. The bridge typed `/clear` at 18:21:47.7 — 4.75 s after the ask, the earliest moment its `whenIdle` can answer — into a turn that
was still running, so Claude Code queued it; it pasted the letter at 18:21:56.3 (again the earliest moment) into the OLD conversation,
which answered «Продолжаю после очистки окна» at 65 % of its window. The queued `/clear` ran at 18:22:17; the new conversation got
nothing. Cause: `session.remember` keeps the last 256 KB of the screen and `whenIdle` / `pasteWhenReady` measured «quiet» by
`buffer.length` — frozen once the buffer is full, i.e. in every long session. 700-3 and 708-7 had been proven on young sessions only.
The same blind measure also drove the model switch (restart of a session it thought idle), 715's queued pass (closing a session it
thought idle) and every paste into a live session. And the fresh conversation's first window line read the old conversation's
`context.json` (65 % at 7 %).

## What was done

- **728-1** `scripts/reset-wake.test.mjs`, `npm run test:reset-wake` (~45 s, no model): a fake Claude Code driven by the REAL bridge copies
  (`build` for the main agent, `[item]` for elements), a full screen buffer, Claude Code's queueing (a slash command waits for the turn's
  end, words go into the running turn), the pulse and the transcript on `/clear`; temporary root and home — the node's records untouched.
  Scenarios: A1 main agent / A2 element, the turn goes on 20 s after the ask; B the quick path; C `/clear` never takes effect; D the
  measure; E the window line.
- **728-2** `session.seen` counts every byte the screen printed; `printed(s)` is the measure of `whenIdle` and `pasteWhenReady`;
  `clearedSince()` — the letter is pasted only after the pulse's `session-end reason=clear` written after `/clear` was typed, or a
  transcript born after it; no evidence — nothing is pasted (the old conversation is not told it was cleared). Master → twelve copies
  (`[item]`, `build` by `agent-kit:update`; the ten native groups by file copy and version — the installer refuses in the working copy
  without `WEB4-ITEMS/core/<group>`); `check:agent-kits`: 12 legal, 0 debts.
- **728-3** `limits.cjs` writes the status line's `session_id` into `context.json` and rewrites it on a new conversation; `window.cjs`
  `lineFor()` keeps silent for a record of another conversation; a record without `session` is read as before.

## Proofs

PROOF 1 — plane the tree (the test)
  ran:        `node scripts/reset-wake.test.mjs` on the code before 728-2/728-3, then `npm run test:reset-wake` after
  output:     before — «A1 … messages: old/turn: the agent works … | old/injected: ⟦node · context-reset · build ·», the bridge logging
              «build: пробуждён письмом после сброса», `===RESET_WAKE_FAILED=== 11` (A1, A2 ×3, C, D, E ×3); B ✓ on the old code too.
              after — «A1 … 29 s; messages: old/turn: the agent works … | new/turn: ⟦node · context-reset · build ·», the same for
              A2 tst5k, «tst7c: письмо после сброса не вставлено — /clear не выполнился», `===RESET_WAKE_OK===`, RC=0.
  proves:     the letter reaches the new conversation only, for the main agent and an element, in a long session.
  without it: exactly the «before» run — the incident of 18:21 reproduced.
PROOF 2 — plane the data (live, on the node after the update)
  ran:        `cat data/services/build/context.json`; `curl /api/health`; grep of the running kit copies
  output:     `"session": "57daaf7f-94e5-4aaa-84ab-e77c68324182"` (the running conversation) · `"commit":"a4b1b048"` · `seen` in
              `build/` and `[item]/` `_agent-kit/server/session.cjs`
  proves:     the node runs the fix and its window record names its conversation.
  without it: `context.json` had no `session` (the record of 18:23: `{used: 7, size, tokens}` only).
NEGATIVE CONTROL
  case:       the same test on the old code; and the window hook fed the conversation of the record — must still print
  answer:     11 ✗ before; `same conversation: ⟦node · context-window · tstw1 …⟧ Your context window is 65 %`, fresh one — silent.
NOT PROVEN YET
  the live reset of the main agent on the new code — done as the last act of this run (`session clear --continue`); its result is
  written below by the woken session. An element's live reset is not run (it costs that element's model turns); the same bridge code is
  in the test with an element's session.

## Mistakes

- 700-3 and 708-7 were closed on proofs made in young sessions: the measure was right only while the buffer was not full. A proof of
  anything timing-based must include an aged session — the test now starts with a full buffer.
- The bridge logged «пробуждён письмом» for a letter that went to the wrong conversation: «pasted» was taken for «delivered».

## Evolution of skills

Nothing to change in the skills: the reset is still «letter, commit, `session clear --continue`»; the defect was in code and is now held
by `npm run test:reset-wake`.
