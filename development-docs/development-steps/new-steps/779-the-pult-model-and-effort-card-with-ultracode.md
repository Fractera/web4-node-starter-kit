# 779 — «Пульт»: the main agent's card opens into a model list and an effort list, Ultracode with its warning

The owner, 2026-11-17 17:55, Telegram 462, verbatim: «Одновременно давай внесём изменения в пульт твоя верхняя карточка которая сообщает
модель и усилия давай сделаем так при нажатии на эту карточку она раскрывается вниз и там два попадающих списка левый список модели правый
список усилий. Помнишь что у тебя также есть модель ультраКод. Выпадающем списке выдели её сияющая обводкой. При выборе нужно показать
информационное окно сообщающее что этот режим может быть экстремально дорогой ему разрешается создавать любое количество агентов для
решения задачи от начала и до конца. Нажимайте если вы готовы работать с бюджетом от 200 $.»

Status: the decision card sent (18:0x), waits his «да»; no code.

## Facts (measured 18:00)
- The card: `lib/node/tg-app/page.cjs` `mainAgent(a)` — «Главный агент», `modelLine` («Opus · усилие max»), account line, the state tag;
  words `lib/node/tg-app/words.cjs`; state `lib/node/tg-app/state.ts`; the door `app/api/node/tg-app/route.ts` (actions state · done ·
  secret · power; the signature of the main bot + its allowed chats, 771-1). Plain HTML + a little JS in Telegram's theme (771's decision).
- My mode now: `data/services/build/session-mode.json` — opus · max · ultracode false (after the 17:52 switch) — the Pult reads it.
- The live switch: bridge `action === 'model'` (opus|sonnet|haiku, effort low|medium|high|xhigh|max, `continue`; one pending switch per
  session, waits for the turn's end — `whenIdle`) — NO ultracode on a live switch today. Ultracode exists only on WAKE in the bot (666:
  Opus → «Ultracode — рабочие процессы с субагентами» → `ultraWarn` → «Продолжить»; `spawnAgent(..., { ultracode })`, always Opus · max,
  workflows on, bridge checks in 30 s that Claude Code shows it, `ultraMissing` otherwise).
- The bot gives Sonnet and Haiku effort medium; Opus — the chosen effort (666, the owner 2026-11-06).

## The decision card (sent)
- Focal: the top card, CLOSED by default; a tap unfolds it downward, a tap folds it.
- Inside: two lists side by side, 50/50, 8 px apart — «Модель» (Opus, Sonnet, Haiku, Ultracode) · «Усилие» (low … max). Own lists, not
  the system `<select>` (a phone's system list cannot carry a glowing outline).
- Ultracode: a glowing outline in Telegram's button colour, a soft pulse; `prefers-reduced-motion` — the outline without the pulse.
- Effort chosen for Opus only; Sonnet/Haiku — grey «medium», Ultracode — grey «max» (as the bot).
- «Переключить» appears only when the choice differs from the current; then «Переключусь, когда закончу текущий ход», then the new model;
  the conversation continues (`continue`). Leaving Ultracode — another model in the same list.
- Choosing Ultracode opens Telegram's own popup with his words; «Отмена» + red «Включить Ultracode»; cancel restores the previous choice.
  The window in the Pult is the confirmation in Telegram that §6 requires for subagents.
- The same words replace the bot's `ultraWarn` (one truth).

## Substeps (after «да»)
- 779-1 Bridge: the live `model` switch takes `ultracode: true` (forces opus · max) → `spawnAgent(..., { ultracode })`; a switch to any
  other model turns it off.
- 779-2 Door: `POST /api/node/tg-app` action `model` {model, effort, ultracode, confirmed} → the bridge's session command for `build`;
  ultracode without `confirmed: true` → 400.
- 779-3 Page: the card, the two lists, the glow, the popup (`web_app_open_popup`, its limits read from core.telegram.org/bots/webapps
  before the code), words ru/en; the bot's `ultraWarn` = his words.
- 779-4 Tests (`scripts/tg-app.test.mjs`), prebuild RC=0, one core build, eyes, live.

## Tests
- P1 door: forged signature 401 · another person 403 · bad model/effort 400 · ultracode without confirmation 400.
- P2 eyes 390 px, light and dark: the card closed, opens, the glow seen, console clean.
- P3 live: Pult → Sonnet — the session restarts, the card reads Sonnet; back to Opus · max.
- P4 live (his tap): Ultracode → the popup; «Отмена» changes nothing; «Включить» → «Opus · max · ultracode», Claude Code shows it.
- P5 the switch waits for the end of the turn and never cuts it.
Price: one core build.
