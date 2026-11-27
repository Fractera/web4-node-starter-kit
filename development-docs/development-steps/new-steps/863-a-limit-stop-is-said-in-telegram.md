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

## Widened 2026-11-27 13:3x UTC — the person always sees that the work is alive, for EVERY agent (Roma 1582)

Roma, Telegram 1582: «такая проблема … существует не только у агента оркестратор а, в равной степени может существовать у любого элемента
потому что у нас любой элемент в любую сторону может отправлять такие запросы верно?» — yes. Intake `pre-steps/2026-11-27-waiting-sign-of-life.md`
(fractera.ai, Roma's complaint 515: «последнее сообщение в чате должно быть с иконкой часики … через 15 минут ты повторяешь …»).

**Where it lives:** every hand-off between agents already passes one place — the core's doors: `task` (core → element), `need`,
`ask-core`, `tell-core` (element → core), the a2a relay (element ↔ element through the orchestrator). The node knows who waits for whom
there, with no model. So the line is written by the node into the WAITING agent's own bot, whoever it is — the main agent's or any
element's — never by a model:
1. «⏰ HH:MM — передал задание <имя по меню>. Жду, когда закончит» — at the hand-off, the last message of that chat (639 cleans it when the
   result comes).
2. Every 15 minutes while it runs — the same line with the new time and «ещё работает».
3. The callee's session ended with no result (a limit — this step's first part, a killed session, a «done» without `reply-core`) →
   «⏰ <имя> остановился: лимит до HH:MM / сессия оборвалась», and the waiting agent is woken with the cause. Read from `reply-core` and
   `where` — on a server the core cannot read an element's new session journal (fe-<id> 640, EACCES — the wall, step 811).
4. Dots or animation: only after checking the Telegram Bot API documentation (sendChatAction lasts seconds; edits have rate limits) —
   a static ⏰ unless an honest cheap way exists.
**Proof:** a 20-minute task core → element and one element → core: the ⏰ line at once, its repeat at 15 minutes, the result at the end
with the waiting lines gone; an element stopped by a limit → «остановился: лимит» within 15 minutes; zero model calls (the ledger).
