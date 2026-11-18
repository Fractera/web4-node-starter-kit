# 783 — the day plan of 2026-11-18: steps 784–792, one plan for one day

Written in the morning of 2026-11-18 (13:00–13:20 UTC) at the owner's word. Steps 784–792 are conditionally independent, bound by this one
plan for one day; we move inside it until it is complete. Small defects found on the way are NOT fixed today: each goes as one line into
`793-finishing-the-small-defects-found-during-the-day.md` and is done in its own session only after this plan closes. Model: Opus, max effort.

Status: SENT to the owner for his «да» (Telegram, 13:2x). No code before it.

## The owner's words (2026-11-18 13:00 UTC, Telegram 612, verbatim)

«Задачи на сегодня:
– Запустить Fractera сервер
– проверить может ли сервер добавлять домены
– в пульте реализовать создание и подключения Telegram бот для агентов для их элементов, также функция обновления существующего Telegram бот.
– у каждой карточки элементов пульте при раскрытии показать его название и описание добавить в интерфейс кнопка сайт элемента и кнопка Bot элемента. Переработать дизайн с использованием возможно навыка дизайна создания Telegram потому что в общем состоянии закрытых карточек дизайн красивый но каждая открытая карточка это дикий ужас.
– Добавь третий индикатор в панель которая показывает расход токенов наверно поставь его выше и он должен показывать расход контекстного окна который также будет краснеть от начала и до конца максимально красный цвет достигается на отметке 75% если вдруг по какой-то причине переходит дальше то становится тёмно бордовым нужно написать общий контекстный окно модели 1 000 000 токенов. И процент заполнения окон
– У элементов создай шаблон приложении Telegram mini appкоторый имеет левое выдвижной ящик в котором реализовано Мега меню где пользователь может реализовать свои задачи управления элементом
– считать работу в Телеграм приложении рабочими процессами а значить дублировать интерфейс из Telegram мини app на вкладке рабочие процессы.
– В элементах, в строительстве продукта реализовать третью функцию переезд нативного приложения Claude для компьютера.
– Проверить работу главного агента в режимах разделения приложения на один пользователь много элементов || много пользователей по одному или несколько элементов. Описать что во втором режиме один элемент знает другой элемент который принадлежит одному хозяину и использует для этого общее хранилище памяти прежде всего о имени владельца. Другими словами если Маша держит три элемента то во все три она входит как администратор, имеет один кабинет в котором отображается все три элемента. Можно прямо в этом кабинете добавить раздел условно говоря о Маше.

/// как создай последовательность шагов в каждом из которых будут предварительные под шаги которые мы должны будем реализовать за сегодня. В плане можешь указать что это план составленный утром включающий в себя шаги от икс икс до игрек игрек, условно независимые но связанные единым планом на один день. Движемся в рамках этого плана до полного завершения. Особенность этого плана заключается в том что если появляются незначительные проблемы то мы их не решаем сегодня а собираем все эти проблемы в один план по до делы ванию и будем реализовывать в рамках ходильных сессии только после завершения текущего плана. Каждый раз когда будешь составлять current-step прикидывай сжатый информацию о том что мы сегодня должны сделать и о том что делать с незначительными поломками которыми мы обнаружим. Движемся на модели с максимальным усилием размышлений»

## The rule of the day for small defects

- A defect that does NOT stop the current step's result — one line into plan 793 (what, where, the guessed cause, how found), no fix
  today, the step goes on.
- A defect that stops the result — it is not small: fixed inside the step, named in its summary.
- Every rewrite of `current-steps.md` today carries the block «Today's plan» (the steps, where we are, the rule above).

## What is already there (measured 13:00–13:20 — do not measure again)

- Server 109.199.105.213 / fractera.ai answers 200 (root build of 2026-11-16 12:55); `data/node/server/launched.json` ready 11-16 12:39;
  host key pinned 11-17 10:00. Fresh launch 761-13 never ran. Fractera main = the fork (ce3e76d9) since 12:30 today — a server installs
  today's core. Let's Encrypt: the ledger `data/node/server/le-ledger.json` holds 12 names issued 11-16.
- Pult (`lib/node/tg-app/page.cjs` + `words.cjs`, door `app/api/node/tg-app/route.ts`): waiting requests with fields for keys
  (env, openai, element-admin), «Готово», model/effort with Ultracode, the fuel gauge (5 h, 7 days), elements with a detail row (state,
  agent, account, model, «Telegram-бот агента» greyed when none), «+ Новый элемент».
- Bot connection today: `kits/_agent-kit/core/server/telegram.cjs` `saveToken` (getMe check, `.env` + `bot.json`, allowlist),
  `activationLink` (t.me/<bot>?start=<nonce>, one hour); `lib/node/tg-menu.cjs` `refreshElement` sets an element bot's menu button to its
  `/tg` (778-6).
- Custom template v0.3.215 (workshop `data/workshop/fractera-custom-item-starter`): the branch `/tg` (Mini App, edge lock by the element's
  admin role, no site chrome, Telegram header in the element's colour) and the skill `telegram-mini-app` — no drawer, no menu yet.
- The element menu «Проектирование продукта» (`lib/web4-items/item-tree.ts`): «Продуктовый квиз», «Реверс-инжиниринг».
- Roles elementAdmin001…980 per custom element (778-1), the Users tab by element name (778-3).
- The context window: `npm run session -- context` reads it from the session journal (window 1 000 000 for Opus 5.5).
- skills_find (13:15): no Telegram Mini App design skill in the base or the checked catalog; closest `mobile-app-ui-design`
  (ceorkm, 491★, 12 131 installs — thumb zone, 8-pt grid, 60/30/10) for ideas; our `interface-design`; Telegram's own Mini App
  guidelines (core.telegram.org/bots/webapps) as the primary source.

## The order of the day and why

1. 784 → 785 first: they need the owner's hands (the provider's panel, the root password) and long model-free waits. No core build on this
   computer while the launch runs — the launch is driven by this computer's core door.
2. 786, 787, 788 — the Pult, one core build for the three.
3. 789 → 790 — the template's Mini App drawer, then the core's «Рабочий процесс» tab showing it; 791's template part rides the same
   template release.
4. 792 — the modes and Masha's cabinet, last: it leans on the roles and the cabinet of the sign-in element.
Each step unfolds its substeps into `<N>-k.md` when it starts (stage 7 of planning); the lines below are the preliminary substeps.

## 784 — launch the Fractera server (the fresh launch 761-13)

- 784-1 Before: the 761 items the launch tests (762 «!», 761-1 greeting, 761-2 language, 761-14 the site link, 761-17 step 5 asks getMe)
  — built or not, by code; Let's Encrypt limits against the ledger (the same 12 names again this week).
- 784-2 The owner reinstalls the server's system in the provider's panel — an ask-person window with the hint; the new host key expected.
- 784-3 «Активация выделенного сервера» with him, step by step: IP and root password in the window (computer only), the records, the
  install from the fork, the server's bot, certificates, ready — each step reported against the 761 checklist.
- 784-4 Proofs: https://fractera.ai 200 with today's commit in its /api/health; the server's bot greets with the site link; negative — the
  old pin refused before the new key is accepted.

## 785 — the server adds domains

- 785-1 Read what the server's own «Активация домена» does (760-5, 760-6 open); the domain to test — the owner names it at the step.
- 785-2 Add it on the server's node: records → certificates → an element on it.
- 785-3 Proofs from the internet: the new name 200 with a valid certificate from the server; negative — a name that does not point to the
  server is refused with the reason, nothing written.

## 786 — the Pult makes, connects and updates an element agent's Telegram bot

- 786-1 Research from the primary source (core.telegram.org): whether a bot can be created other than through @BotFather; the existing road
  (saveToken, activationLink, refreshElement).
- 786-2 «Подключить бота» in an element's card: a guide button to @BotFather, a token field (the token goes only through the signed door,
  never the chat) → getMe → saved → «Открыть бота» with the admission link → the person is admitted → the menu button set.
- 786-3 «Обновить бота»: a new token replaces the old (BotFather /revoke or another bot) and the bot's name, description and short
  description are written from the element's card (setMyName, setMyDescription, setMyShortDescription).
- 786-4 Proofs: a real bot made by the owner, connected from the phone, /start admits him, the element's agent answers; negative — a fake
  token refused, nothing written.

## 787 — the Pult's open element card: name, description, «Сайт», «Бот», a new design

- 787-1 A design decision first: interface-design + Telegram's guidelines + the ideas of mobile-app-ui-design; a rendered proposal at
  390 px in both themes sent to the owner before the code.
- 787-2 The data: the element's name and description (its card), its site address (own domain, else said why none), its bot's link.
- 787-3 Built; the open card the way the closed one already is.
- 787-4 Proofs: eyes at 390 px light and dark; the owner's phone.

## 788 — the third gauge in the Pult: the context window

- 788-1 The door gives the main agent's context: used, the window (1 000 000), the percent — the same reading as `session context`.
- 788-2 The gauge above the two limits: «Контекстное окно · 1 000 000 токенов» and the percent; the colour reddens from the start, the
  fullest red at 75 %, past 75 % dark bordeaux.
- 788-3 Proofs: the colour function at 10 / 74 / 75 / 80 % (a test); the live value equals `npm run session -- context`.

## 789 — the elements' Mini App template: a left drawer with a mega menu

- 789-1 Read the template's `/tg` branch and the skill telegram-mini-app; the drawer (shadcn Sheet, left) with a mega menu — groups and
  items of the element's management tasks, from one list in the template its agent fills.
- 789-2 Built in the workshop clone, the template's prebuild green.
- 789-3 Released (tag), pinned, rolled out to the elements (root first) — skill release-template; the owner's word for the release is
  his task of today.
- 789-4 Proofs: root's `/tg` at 390 px with the drawer open, both themes; negative — a guest still meets the edge lock.

## 790 — the Mini App is the element's working process: the core's «Рабочий процесс» shows it

- 790-1 The shape: the core's element tab «Рабочий процесс» shows the element's own `/tg` in a phone frame (390 px) — one source, never a
  copy of its code.
- 790-2 Built in the core (a route widget or a section kind — decided by use-sections).
- 790-3 Proofs: the same menu as in Telegram on the tab; negative — an element without `/tg` says so.

## 791 — «Проектирование продукта»: the third function, moving from Claude's desktop app

- 791-1 The owner's answer (asked with this plan): WHAT moves. My reading: a project the person built with Claude's app on the computer
  (its folder, its instructions) is carried into this element and rebuilt there, like reverse engineering but from their own source.
- 791-2 The menu item and its page in the core; the hand-over to the element's agent (as `npm run study` does).
- 791-3 The element's pass and skill — in the same template release as 789.
- 791-4 Proof: a small real project moved into an element.

## 792 — the main agent in both modes; Masha's three elements in one cabinet

- 792-1 Check the main agent in «Один пользователь» and «Много пользователей»: birth, look, wallet, Messenger, tools — scripted, with
  proofs.
- 792-2 Describe (node-type, integrator): in «Много пользователей» the elements of ONE owner know each other through the owner's shared
  memory — first of all the owner's name.
- 792-3 The cabinet: the sign-in element's personal page lists every element where the person is the admin, and a section «О <имя>» —
  built by the sign-in element's own agent; the core's doors where needed.
- 792-4 Proofs: a test account «Маша» with three element roles sees three elements in one cabinet and her name in each; negative —
  another account sees none of them.

## Not today

- 793 — the finishing plan, after 792 closes.
- The older open plans (761 leftovers outside the launch, 769, 771-4..6 now covered by 789/790, 773) stay where they are.
