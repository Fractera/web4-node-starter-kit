# 686 — where development stands, and development that survives a limit

**State: SUBSTEPS AGREED IN WORDS 2026-11-08** (the owner: «y» to «Вношу в план 686 вместе со строкой руководителя в §1?»); the substep
files are written before the first line of code, the owner sees them first. His words — the workshop's `current-steps.md` NOW-50…53 and
the node's `current-steps.md` (2026-11-08: «у нас 1000 компонентов в 565-м компоненте … закончились токены», the passport fragment, the
quick wake, «руководитель должен завершить её сам», «сохранится хотя бы15%»).

Facts measured 2026-11-08: Claude Code 2.1.319 has the hook `StopFailure` (matcher `rate_limit` …, input `error`, `error_details`,
`last_assistant_message`); its status line gets `rate_limits.five_hour|seven_day.used_percentage|resets_at` («present only while the API
reports it»); Anthropic: the limits «are shared across Claude and Claude Code»; the bridge already gives Stop, SessionEnd, SessionStart,
UserPromptSubmit (never to work sessions); 689 gives an element its own Claude Code folder.

| Substep | What | Proof |
|---|---|---|
| 686-1 | Measure first: a status-line command of a node session writes `rate_limits`; what `StopFailure` gives on a real limit (`error_details` — the reset time?) | the written file; a hook record of a real stop |
| 686-2 | The pulse by code: every session (work too) — turn started, ended, ended by error, session end, its login — `data/services/<id>/pulse.json`; the limits per login — `data/node/limits/` | records after a turn; a negative control without the hooks |
| 686-3 | The model's writer: the passport fragment `development` (steps, current step, state) on every event; the element skill to answer the leader fast; both templates and the rollout | an element's fragment after its step event |
| 686-4 | The reader `npm run where`: every element by exception since the person's last exchange — finished, stopped by a limit mid-step, cut off, waiting; one line in §4 «Know yourself» | the digest on the owner's node, a killed scratch session named |
| 686-5 | Pause and resume: a stop by the limit wakes the element at `resets_at` by the core's clock, «continue from your record» (the owner's standing yes in this plan) | a wake at a set time |
| 686-6 | Lending: the leader runs a waiting element's session on the node's login only while the forecast keeps ≥15% of the limit, every lending counted, recorded, returned at the job's end, paused below 15% (§1, 2026-11-08) | a lending record and its return; a refusal at a low forecast |
| 686-7 | How it works 7.3 says it works | the page |
