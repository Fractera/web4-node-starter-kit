# 636 — Only agents talk to agents: the elements' side (clock → own agent → orchestrator → person)

## 1. Retelling and decisions

The owner, 2026-11-03, verbatim (also in `current-steps.md`, «The owner's latest decisions»):

- 16:28 UTC: «Я подозреваю что наша инструкция и возможно навык созданный не настолько идеально как нужно раз ты пропустил весь этот
  процесс фокуса своего внимания? Перепроверю нужны ли обновления инструкции и навыков для работы календарей во всех элементах и в том
  числе для нашего кейса память». Choices: where personal reminders said to an element's bot live — «В календаре того элемента»; a clock
  and a calendar for every native element (a native template release and its rollout) and the instruction lines — «Да, оба (Рекомендую)».
- «Ты мне говоришь где должны жить напоминания. Но вопрос глупый каждый элемент хранит свои Krohn события, сейчас мы говорим о памяти у
  которой напоминания являются её собственной сутью проблема в том что видимо ты не понимаешь о том что напоминание которое всплывает
  должно создавать техническое решение при котором элемент вызывает тебя главного агента и передает тебе сообщение которые ты
  транслируешь понимаешь?У нас это работает?»
- 16:37 UTC, the law: «Нашей архитектуре никто не может взаимодействовать с какими-либо агентами кроме самих агентов. Если ты пытаешься
  создать какое-то решение которое позволит обойти это правило то это катастрофическая ошибка которую нужно немедленно зафиксировать в
  том числе и инструкции чтобы такое больше никогда не приходило никому в голову. Если тебе что-то нужно сделать внутри элемента то это
  взаимодействие где это что-то общается с агентом этого элемента а уже агент элемента вызывает процессы для взаимодействия с другими
  агентами. Первая коммуникации всегда только через Гента оркестра то есть это ему он может сказать: привет у меня тут будильник сработал
  кстати говоря если ты общаешься с кем-то можешь сказать бла-бла-бла. Или как мы раньше с тобой говорили агент элемента вызывает агента
  оркестра тараф – говорит у меня тут задача написать пост и мне нужны картинки, если у нас есть кто-то для этого скажи кто я хочу с ним
  договориться вызывает процесс диалога по протоколу i2i запускает разработку API и в дальнейшем взаимодействуют напрямую. Понимаешь? Как
  ты это понимаешь? Была ли у тебя проблема или ты изначально правильно понял? Нужно ли обновить инструкцию и какие-то навыки? Исследуй
  добавляю тебя усилия размышления это важно»
- 16:41 UTC, choices: the elements' part by this plan (template release and rollout, the memory, `tell-core`) — «Да, делай
  (Рекомендую)»; no Telegram question «Запустить агента?» when a clock wakes its own agent and that agent tells the main agent — «Не
  спрашивать (Рекомендую)».

Retold: code — a clock, a door, a script — speaks only to its own element's agent. The memory's reminder fires: the memory's clock
wakes the memory's agent; that agent tells the orchestrator (`npm run tell-core`); the main agent passes the words to the person in
Telegram. A neighbour's help is asked of the orchestrator (`ask-core`), who names the neighbour; the two agents agree an API by i2i;
only that agreed API is then called by code directly. The core's half (the law in section 6, the Cron line) is `c6f91d6`.

I assume that:
- a reminder said to the main agent is the memory's when the memory is on (its essence); the main agent's own calendar
  (`npm run reminder`, 630) stays for its own automations and for a reminder while the memory is off;
- 551-1 («у нативного элемента нет рабочего процесса») stands for the working process: the native clock wakes the build session
  (`Build process:`), a custom element's clock its working session (`Working process:`);
- a clock that cannot wake its agent (too little free memory) writes the failure into its run log and the calendar shows it; no
  retry (the clock law of 465 «без повторов при ошибке»).

## 2. What is reused
- The custom template's clock (`lib/cron/`: once a minute, `data/cron.json` outside git, the run log, the calendar of the core) and its
  skill `schedule-cron-automations-calendar-reminders-recurring-and-one-time-tasks`.
- The wake door `/api/agents/wake` (node key; `confirmed` skips the Telegram question; `from` marks a node task).
- `scripts/ask-core.mjs` of every element (the way to the orchestrator); the core skill `answer-element`.
- The memory's table `messages_that_came_into_memory`: `event_starts_at`, `event_repeats`, `remind_at` — written by no code until now.
- The core's calendar `cron-calendar.client.tsx` and the passport view `cron` (custom: «Working process → Process → Cron automations»;
  data, storage, vectors, graph: «Backup → Cron events»).

## 3. Known limits — what must not break
- The core's sections 1–8 and the elements' sections 1–12 are sealed: the new lines are the owner's law (given above) and are resealed.
- The wake door: an alarm wakes only the caller's own agent or the orchestrator — never another element's agent (the law).
- A clock never sends to another agent's channel; the template's `telegram-message` (own bot) stays.
- Templates: a tag is never moved; guards after `git add`; the rollout touches only the named paths; `services:install` never runs in a
  clone on this Mac (ANTI-PATTERNS).

## 4. Observable results
- «Напомни мне через 2 минуты выпить воды» to the main agent → the receipt names the time in words and the memory's calendar link; in
  two minutes the person gets the words from the main agent's bot, naming the memory; the memory's calendar shows the run.
- The wake door refuses `reason: "alarm"` for another element's agent (403).
- Every element's instruction carries the law; 5.2 sends a first contact through the orchestrator.

## 5. Substeps
- **636-1 — the core.** The wake door: `reason: "alarm"` → confirmed, only `service === from` or `service === "build"`. The skill
  `answer-element`: «Element <id> tells the architect: «…»» → the words to the person where they read you now, naming the element.
  CLAUDE.md: the Cron line names `tell-core`; `core-schedule`: personal reminders → the memory; resealed.
- **636-2 — the elements' instruction** (`lib/instructions/element/element-instruction.src.md`): the law in section 7; 5.2 — first
  contact through the orchestrator (`ask-core`), not `a2a -- find`; `tell-core`; the native lines on the clock.
- **636-3 — the templates.** `npm run tell-core` (`ask-core.mjs --tell`); the clock's built-in event `agent-task` (wakes its own agent,
  reason alarm); `yearly`; the native template gets the clock, `CRON.json`, the start in `instrumentation.ts` and the calendar skill in
  `own-service-props-skills`. Release, pin, rollout.
- **636-4 — the core's menu:** a native element's calendar page «Cron events» (not for data, storage, vectors, graph — theirs is under
  «Backup»).
- **636-5 — the memory:** a reminder is a memory row with `remind_at` and an entry in the memory's own calendar (event `agent-task`);
  the memory's agent on the alarm — `npm run tell-core`; the receipt with the calendar's link; «напомни мне <когда>» is not `recall`.
- **636-6 — live proof** on the owner's node after «Sync fork» and the update; at most three test questions.

## 6. Self-check
Each substep is closed by its summary in `completed-steps/` with the commit, the proof and the mistakes.
