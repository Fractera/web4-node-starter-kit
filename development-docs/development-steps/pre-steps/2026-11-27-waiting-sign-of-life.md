# For the creator agent (Mac): a sign of life while the main agent waits for an element

From the main agent of fractera.ai (109.199.105.213), 2026-11-27. Roma's complaint, Telegram 515, 13:31 UTC. Roma's request, in his words:
«когда главный агент отправляет задачу в элемент и ожидает что он закончит то последнее сообщение в чате должно быть с иконкой часики
… через 15 минут ты повторяешь это сообщение либо если закончилась сессия попробуй вернуть автоматически ответ … было бы хорошо чтобы в
конце была какая-нибудь анимированная эмоджи … три точки последовательно меняющиеся».

## What happened (facts)

- At 13:15 UTC Roma said (Telegram 507): «если ты передаешь задание элементу так ты от него и требую результат а мне возвращает итог». I took
  that to mean «write nothing until the result» (my memory `feedback-results-not-relay`).
- My last messages to him were 13:18 (510, after his 509) and the answer to his 511. After that the chat was silent.
- At 14:15 local time I had queued part 2 of a task to f2f-marketplace (lidt5) with `npm run task`: the two test starters into its
  catalogue. I was waiting on a background loop that polls `npm run state -- lidt5` until the line «Report to you» changes. That loop is
  invisible to the person.
- At 13:28 UTC Roma opened the chat, saw no sign of life and wrote (513): «А ты что уснул что ли не пойму».
- What the node does today: within 3 minutes of a task it says `⟦node · not-started⟧` if the task did not start (step 736). It says this
  to me, not to the person. Nothing tells the person that a started task is still running, and nothing repeats while it runs.
- Step 639: earlier replies of one turn disappear 30 s after a later one. A waiting line sent before the result disappears by itself once
  the result arrives. That is the desired behaviour here.

## The request

1. **A waiting line is the last message in the chat** whenever the main agent has handed an element a task and waits for it. Model-free:
   the node writes it when `npm run task` / `template offer` is queued from a session whose person is in Telegram.
   Form: «⏰ 13:29 — я отправил задание элементу «<menu name>». Жду, когда он закончит. Если не закончит за 15 минут — спрошу его.»
   Name the element by its menu name, never by its id (instruction §1).
2. **Every 15 minutes** while the task runs, the line is repeated in the same form with the new time and «ещё работает». The old copy
   is deleted (step 639 cleaning) or edited in place. Edits do not ping the phone; a fresh message does.
3. **The session ended but the result did not come** (a limit screen, a killed session, a «done» without `reply-core`): the node reads
   what it can without a model (the element's `reply-core` report, `npm run where` «how the last turn ended»). It posts a standard line:
   «⏰ <element> закончил ход в HH:MM: <its report in one line>» or «⏰ <element> остановился: лимит / сессия оборвалась — я возвращаю
   его». Then it wakes the main agent, so the agent acts on the cause.
4. **Animated dots at the end.** Roma would like a «working» animation, such as three dots changing in turn. Please check the Bot API
   documentation before building anything; I did not check it. What I believe, from memory:
   - `sendChatAction` («typing») shows «печатает…» for about 5 s and must be re-sent.
   - Editing one message every few seconds cycles «.», «..», «...». That costs Bot API calls and has rate limits.
   - Animated custom emoji in bot messages may have special conditions.
   Pick the cheapest honest option. A static ⏰ is better than a costly loop.

## A related defect met today (same pipeline)

`npm run session -- tail lidt5` fails with `EACCES` on the element's new session journal. The file
`data/services/lidt5/claude/projects/…/38c79915-….jsonl` is owned by `fe-lidt5:fractera-el`, mode 640 (the server wall, step 811). The
core cannot read the element's replies there. Older journals of the same folder are readable. The core only sees «Report to you» through
`npm run state`, so point 3 above must rely on `reply-core` and `where`, not on the journal, or the wall must give the core read access.

## How to prove it

- A task to an element takes 20 minutes. The person's chat shows the ⏰ line at once, a repeated line at 15 minutes, and the result at
  the end, with the waiting lines gone. Screenshot of the chat.
- An element stopped by a 5-hour limit mid-task. Within 15 minutes the chat shows «остановился: лимит», and the main agent is woken
  with the cause. Log line and screenshot.
- Zero model tokens for points 1–3. The session meter or the node's ledger shows no call.
