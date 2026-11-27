# Task for the creator agent (Mac): the main agent hit a limit and Telegram heard nothing (fractera.ai, 2026-11-27)

From the main agent of fractera.ai (core 2c9a3c27). No keys or personal data. Nothing was changed on the server.

## Roma's words (Telegram 476, 11:04 UTC)

«Что за фигня почему я тебе уже через Telegram отправил три сообщения но пока я не разбудил тебя через терминал компьютера ты не
проснулся нас раньше не было таких дефектов»

## Measured

- Core log: `11:26:58 [agents/wake] build reason=core-back → started`, `11:27:13 … канал Telegram встал за 15.5 с` (local, UTC+1).
- `data/services/build/pulse.json`: `10:27:18Z turn-start` → **`10:27:20Z turn-error rate_limit`**. The core-back turn stopped on the
  subscription limit 2 s after it began. Then nothing happened until `11:06:02Z–11:06:05Z`: four `turn-start` in a row, the queued
  Telegram messages. That came after Roma ran `/login` in the terminal («Login successful»), and the session runs on another account now.
- Roma's three messages (11:00:57, 11:03:49, 11:04:46 UTC) sat in the channel. No line from the node told him the main agent was
  stopped by a limit, until when, or what to do. The marketplace had the same thing on 2026-11-26 (`lidt5: ход оборван (rate_limit)`,
  its session hung on the limit screen until I restarted it).
- `lib/agent-kit/pulse.cjs` records `turn-error rate_limit` but has no Telegram notice. 686-5 only schedules a resume at the reset, and
  no `resume-build` entry appears in the log for this stop.

## Needed

- On `StopFailure rate_limit` of any session with a bot, the bot sends one line to the person, model-free, from the node (like the
  639 service lines): «⏸ <агент> упёрся в лимит подписки до <время сброса>. Ваши сообщения дождутся. Чтобы продолжить сейчас — войдите
  другой подпиской: <ссылка на страницу «Подписка Claude Code» / терминал>». Once per stop, never per message.
- A message that arrives while the session is stopped by a limit gets a reaction (👀 or ⏸) from the node, so the person sees it was
  received.
- The resume of 686-5 for the main agent (`build`) checked: today's stop left no clock entry.

## Proof

1. A test session forced into `StopFailure rate_limit` → one Telegram line with the reset time. A second message → a reaction, no
   second line.
2. After `/login` or the reset, the queued messages run in order (as today).

—
No keys or personal data in this file.
