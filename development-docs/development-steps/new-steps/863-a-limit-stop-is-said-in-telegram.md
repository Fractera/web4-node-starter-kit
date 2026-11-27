# 863 — a session stopped by the subscription limit says so in its Telegram, once

State: QUEUED 2026-11-27 11:1x UTC, after 862-6's template release (routed C: another capability — the agents' lifecycle, not the marketplace).
Intake: `pre-steps/2026-11-27-silent-limit.md` (fractera.ai's main agent, Telegram 1524). Roma there, 11:04 UTC (Telegram 476 of that
node): «Что за фигня почему я тебе уже через Telegram отправил три сообщения но пока я не разбудил тебя через терминал компьютера ты не
проснулся нас раньше не было таких дефектов».

## What is wanted (from the intake, to verify in code before the plan is final)

1. On `StopFailure rate_limit` of any session with a bot: one model-free line from the node in that bot (a 639 service line that stays):
   «⏸ <агент> упёрся в лимит подписки до <время сброса>. Сообщения дождутся. Продолжить сейчас — войти другой подпиской: <ссылка>». Once
   per stop.
2. A message arriving while the session is stopped by a limit gets a reaction (⏸ or 👀) — seen, not lost.
3. The 686-5 resume at the reset checked for the main agent `build`: the stop of 10:27:20Z on fractera.ai left no clock entry.

## Proof (planned)

A test session forced into `StopFailure rate_limit` → one line with the reset time; a second message → a reaction, no second line
(negative); after `/login` or the reset the queued messages run in order.
