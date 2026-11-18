# 783 — the day plan of 2026-11-18: steps 784–792 (+794), one plan for one day

Written in the morning of 2026-11-18 (13:00–13:50 UTC) at the owner's word. Steps 784–792 are conditionally independent, bound by this one
plan for one day; we move inside it until it is complete. Small defects found on the way are NOT fixed today: each goes as one line into
`793-finishing-the-small-defects-found-during-the-day.md` and is done in its own session only after this plan closes. Model: Opus, max.

Status: the detailed plan (this text) sent to the owner as a file for his «да»; no code before it. 13:06 (Telegram 617) he asked for a
detailed plan, not a summary, made «в режиме /plan»; 13:06 (618): «как этот режим включить через Telegram это возможно?» → proposed 794.

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

13:06 (Telegram 617): «Я так понимаю что я вижу очень короткое сжатое Самаре вот этого плана не так? Потому что планы сам должен быть
городской? И должен он быть создан в режиме /plan». 13:06 (618): «Я честно говоря даже не знаю как этот режим включить через Telegram
это возможно?»

## The rule of the day for small defects

- A defect that does NOT stop the current step's result → one line into plan 793 (what · where · the guessed cause · how found); no fix
  today; the step goes on.
- A defect that stops the result is not small: fixed inside the step and named in its summary.
- Every rewrite of `current-steps.md` today carries the block «Today's plan» (the steps, where we are, this rule).

## Measured 13:00–13:45 — do not measure again

- Server 109.199.105.213 / fractera.ai: 200, root build 2026-11-16 12:55 (`/api/health`), `data/node/server/launched.json` ready 11-16
  12:39, host key pinned 11-17 10:00 (`known-hosts.json`), the Let's Encrypt ledger `data/node/server/le-ledger.json` — 12 names issued
  11-16 12:37. The fresh launch 761-13 never ran. Fractera main = the fork (ce3e76d9) since 12:30 — a server installs today's core.
- In code already: 761-1 (the server agent's sign-in checked before the greeting, `scripts/dedicated-server/launch.mjs:248`), 761-2 and
  761-14 (the bot's lines in the page's language, each naming the site — `app/api/node/launch/route.ts:175`, `lib/hosting/server-telegram.mjs:50`),
  762 (cc9a4d8a). NOT in code: 761-17 (step 5 asks getMe on every read).
- A server node keeps ONE domain with its subdomains (`lib/hosting/server-domain.mjs` 737-8: the five steps, the names table
  `hostnames.mjs`, certificates `certs.mjs` through the root helper `fractera-root cert-list`). Additional domains of a server node —
  760-5, 760-6 open, not built.
- Pult: page `lib/node/tg-app/page.cjs` (plain HTML + JS, Telegram theme, 240 lines), words `lib/node/tg-app/words.cjs` (ru, en), state
  `lib/node/tg-app/state.ts` (asks, main agent, elements with `agent.bot` from `data/services/<id>/channel/telegram/bot.json`, limits),
  door `app/api/node/tg-app/route.ts` (actions state, done, secret, model, newElement, autostart, channel, power; Telegram's signed launch
  data on every call, `lib/node/telegram-webapp.cjs`). The element detail today: state, agent, account, model, «Telegram-бот агента»
  (greyed without a bot), step, last turn, on/off.
- Bot road: `kits/_agent-kit/core/server/telegram.cjs` `saveToken(service, token)` (shape, getMe, `.env` TELEGRAM_BOT_TOKEN + `bot.json`,
  allowlist), `activationLink(service)` (t.me/<bot>?start=<nonce>, 1 h); `lib/node/tg-menu.cjs` `refreshElement(root, id)` (the menu
  button → `<PROJECT_SITE_URL>/tg` per allowed chat); copies of the kit live in every `architect/<item>/_agent-kit` (`agent-kit:update`).
- Context: `scripts/main-agent-cli.mjs` 584–600 reads the session journal (last assistant usage: input + cache + output), `windowOf(model)`
  → 1 000 000 for Opus/Sonnet/Haiku 5.x.
- Custom template v0.3.215 (workshop `data/workshop/fractera-custom-item-starter`): the branch `app/[lang]/(protectedLayer)/tg/`
  (layout with the admin lock and chrome-less wrapper, `_components/tg-bridge.client.tsx`, start page, `[...slug]`, `_pages/`, `_widgets/`,
  README with «Назначение этого элемента»), `components/ui/sheet.tsx` present, the skill
  `.claude/skills/build-skills/skills/telegram-mini-app/SKILL.md`. No drawer, no menu.
- Element menu `lib/web4-items/item-tree.ts`: «Рабочий процесс» (`workflow`, 292–330: terminal and data screens), «Проектирование
  продукта» (`product-design`, 411: `quiz`, `reverse-engineering` — its page wiring in `architect/[item]/[[...page]]/page.tsx:545`).
- Roles elementAdmin001…980 per custom element (778-1, `lib/web4-items/element-admin-role.cjs`); the Users tab by element name (778-3).
- skills_find 13:15: no Telegram Mini App design skill in the base or the checked catalog; closest `mobile-app-ui-design`
  (ceorkm, 491★, 12 131 installs) — ideas only; `interface-design` (vendored); Telegram's guidelines as the primary source.
- `claude --help`: `--permission-mode` accepts `plan` (13:30).

## The order of the day and why

1. 784 → 785: the owner's hands (the provider's panel, the root password) and long model-free waits. **No core build on this computer
   while the launch runs** — the launch is driven by this computer's core door.
2. 794 (if he says yes) — small, and it changes how every later plan is made; checked first for its one risk.
3. 786, 787, 788 — the Pult; ONE core build for the three.
4. 789 → 790, with 791's template part in the SAME template release.
5. 792 — last: it leans on the roles (778) and the sign-in element's cabinet.

Each substep below names: what is built · done when · proofs (two planes, one negative) · rests on · not in it. Interface substeps name
the tasks asked of `parts_find` and the parts born.

---

## 784 — launch the Fractera server (the fresh launch 761-13)

Address of the work: the core (`main`) for any fix; the server itself through the launch page. Skill `dedicated-server`.

- **784-1 Readiness by code.** Built: nothing — a read of the eight launch steps against the 761 checklist (which items the fresh launch
  shows: 762, 761-1, 761-2, 761-14 built; 761-17 not) and of the ledger: Let's Encrypt allows 5 certificates for the same exact set of
  names per 7 days (letsencrypt.org/docs/rate-limits — read at the step, the primary source); 12 names issued 11-16 → one more set is fine.
  Done when: the list «what this launch proves» is written into 784's record. Proof: the list, each line with its code address.
- **784-2 The server's system reinstalled — his act.** Built: an `ask-person` window «Переустановите систему сервера 109.199.105.213 в
  панели провайдера (Ubuntu 24.04)» with the hint (the provider's own word for it, the root password he sets there). Done when: ssh
  answers with a NEW host key. Proofs: the launch page refuses the old pin with «ключ сервера изменился» (negative — the node never
  trusts a changed key silently), then accepts the new one after his confirm.
- **784-3 The eight steps, with him, from Telegram where possible.** Built: nothing new unless a step breaks (a break that stops the launch is
  fixed in the core, its own commit). The IP and the root password in the window on the computer (the decided exception). Each step reported
  in Telegram against the checklist. Done when: «Ваш сервер готов».
- **784-4 Proofs.** (a) From the internet: https://fractera.ai 200 and its `/api/health` commit equals Fractera main's; all 12 names
  HTTPS-valid. (b) In Telegram: the server's bot's first lines name https://fractera.ai in Russian; his /start admits him; the server's
  agent greets after its sign-in. Negative: a name not in the table (`foo.fractera.ai`) gets no certificate and is not served.
- Not in it: 761-3/4/5/6/7 and 760-x outside what the launch shows; 761-17 — a line in 793 if the stale step 5 shows.

## 785 — can the server add domains

Address: measurement on the server node; any build — the core (a server installs the core from Fractera, so a fix reaches it by a
node update of the server).

- **785-1 Measure.** On the server's own panel (https://architect.fractera.ai, signed in): «Активация домена» — is there an «add a
  domain» road; what the server's `/api/domain/list` answers; what nginx and the certificate runner do with a second zone. Done when: a yes
  or a no with the code addresses. Proof: the screenshot of the server's page + the door's answer.
- **785-2 If yes — add one.** The domain he names at the step (records at its registrar or Cloudflare through the node's key) → records →
  certificates → served. Proofs: from the internet the new name answers 200 with a valid certificate from 109.199.105.213; negative — a
  name that does not point to the server is refused with the reason, nothing written.
- **785-3 If no — the plan of the capability**, not today's code: `new-steps/<next>-a-server-node-keeps-several-domains-of-its-owner.md`
  (760-5, 760-6 folded in), sent to him. Done when: the plan is sent.
- Not in it: moving throughsongs.com off this computer.

## 786 — the Pult makes, connects and updates an element agent's Telegram bot

Address: the core (`main`): `lib/node/tg-app/{page.cjs,words.cjs,state.ts}`, `app/api/node/tg-app/route.ts`, a shared bot module.

- **786-1 Primary source.** Read core.telegram.org/bots/features#botfather and the Bot API changelog: can a bot be created by an API or a
  link other than a person's chat with @BotFather. Done when: the answer with its link is written here. If a managed-bot road exists — a
  substep for it; else the road is «@BotFather → token → the Pult».
- **786-2 One bot module for the core.** Built: `lib/node/element-bot.cjs` — `connect(root, id, token)` (shape, getMe, writes the
  element's channel files exactly as `saveToken` does — the kit's function moved here and the kit calls it, so the two never drift),
  `admissionLink(root, id)`, `refreshProfile(root, id)` (setMyName, setMyDescription, setMyShortDescription from the element's name and
  description; setChatMenuButton through `tg-menu.refreshElement`). Done when: the kit and the Pult use it. Proofs: `scripts/element-bot.test.mjs`
  with a stubbed Telegram (good token → files written, bad shape / rejected token → nothing written); `agent-kit:update` and the kit's
  connection page still saves a token (eyes of the page's form after the build).
- **786-3 «Подключить бота» in the Pult.** Built: door actions `botConnect {id, token}` and `botUpdate {id, token?}` (signed launch data,
  the architect only; the token is never echoed, never logged — only its last 4); in the element's open card: without a bot — a short
  guide (open @BotFather → /newbot → name → copy the token) with a button `https://t.me/BotFather`, a password-type field, «Подключить»;
  after — «Открыть бота» (the admission link) and the menu button set. Done when: a fresh bot connects from the phone. Proofs: the
  owner makes a real bot and connects it in the Pult; /start through the link admits him; his message reaches the element's agent;
  negative — a fake token: «Telegram не принял токен», no file under `channel/telegram` changed (checked by mtime).
- **786-4 «Обновить бота».** Built: in a card with a bot — «Обновить»: a new token (another bot, or the same after BotFather's /revoke)
  replaces the old one and the profile is written again; «Обновить описание» without a token re-writes the name and descriptions from the
  element's card. Done when: the bot's name and description in Telegram equal the element's. Proofs: getMe/getMyDescription after the
  press; negative — a token of ANOTHER element's bot is refused («этот бот уже подключён к …»), nothing changes.
- Tasks asked of `parts_find`: «token field with show/hide» (the Pult's secret field exists — reused), «guide steps list». Parts born:
  `@local` inside page.cjs (the Pult is plain HTML, no React parts).
- Not in it: the four extra slots (h2h, orders, work) — their bots stay where they are.

## 787 — the Pult's open element card: name, description, «Сайт элемента», «Бот элемента», a new design

Address: the core: `lib/node/tg-app/page.cjs`, `words.cjs`, `state.ts`.

- **787-1 Design decision before code.** Intent: the architect on the phone opens one element to understand it and act — «what is it,
  is it alive, open its site, open its bot». Built: a preview harness `scripts/tg-app-preview.mjs` — writes the real page with a stubbed
  state (three elements: with bot and site, without bot, off) to the scratchpad and `npm run eyes` it at 390×844 light and dark. The
  proposal: the open card as an inset grouped sheet like Telegram's own settings — the head (name 17/600, description 14/400 hint
  colour, two lines), a row of two buttons «Сайт» «Бот» (44 px, thumb zone), then grouped key-value rows (state, agent, account, model,
  step, last turn) with hairline dividers, the on/off action last and apart. Sent to him as two screenshots BEFORE the code of 787-3.
  Done when: his yes to the picture.
- **787-2 The data.** Built: `state.ts` `TgElement` + `description` (the element's passport/A2A card text, `lib/a2a/passport.mjs`, one
  sentence), `site` (the element's public HTTPS address — `PROJECT_SITE_URL` on the node's own domain; none → null, the button says
  why), `botLink` (t.me/<username>). Proof: the door's state for root and a native element (none of the three leaks a key or a port).
- **787-3 Built by the approved picture.** Proofs: eyes at 390 px light and dark from the harness (no overlap, 44 px buttons measured);
  negative — an element without site and bot shows both buttons disabled with the reason, never a dead link.
- **787-4 His phone.** Proof: his screenshot or his word.
- Tasks for `parts_find`: none (plain HTML page; its own classes). Parts born: `@local` — the Pult's own CSS.

## 788 — the third gauge: the context window

Address: the core: `lib/agent-kit/context-window.cjs` (new), `scripts/main-agent-cli.mjs` (uses it), `lib/node/tg-app/{state.ts,page.cjs,words.cjs}`.

- **788-1 One reading.** Built: `context-window.cjs` — `read(root, id='build')` → `{ used, window, percent, model, at }` (the CLI's code
  moved, the CLI calls it); `state.ts` adds `context` for the main agent. Proofs: `npm run session -- context` and the door's `context`
  give the same numbers at the same moment; negative — no journal → `null`, the gauge says «нет данных», never 0 %.
- **788-2 The gauge.** Built: above the two limits — «Контекстное окно · 1 000 000 токенов», the percent big, a bar; colour
  `color(p)`: from the calm accent at 0 % toward the brightest red at 75 % (interpolated in OKLCH), past 75 % dark bordeaux. Proofs: a
  test of `color()` at 0 / 10 / 74 / 75 / 76 / 100 % (75 → the red, 76 → bordeaux); the harness's eyes at 12 %, 60 %, 80 %.
- Not in it: the elements' context (their cards already show their agent; a gauge per element — later, if asked).

## 794 — /plan from Telegram (proposed 13:3x, waits his yes)

Address: the core: the session bridge (`architect/[item]/_agent-kit/server/bridge.cjs` → master kit), `scripts/main-agent-cli.mjs`,
`lib/agent-kit/commands.json`, the bot menu.

- **794-1 The risk first.** A test session started with `--permission-mode plan`: can it call the Telegram plugin's `reply`, run read-only
  Bash (`npm run where`), and how does it leave the mode. Done when: the facts are written. If `reply` is refused in plan mode — the step
  stops and he hears why (a plan mode he cannot read from the phone is useless).
- **794-2 The switch.** Built: `npm run session -- mode plan|normal [<id>]` → the bridge restarts the same conversation with
  `--permission-mode plan` (as `session model` does), the bot's /plan and «выйти из плана» words in `commands.json`. Proofs: from
  Telegram /plan → the next session's journal shows the mode; a file edit is refused in it (negative); «да» to the plan → back to normal.
- **794-3 The plan's file.** In plan mode I show the plan; after his «да» the session leaves the mode and writes it into `new-steps/`.

## 789 — the elements' Mini App template: a left drawer with a mega menu

Address: the custom template's workshop clone `data/workshop/fractera-custom-item-starter` (`main`), then a release tag, the core's pin,
the rollout (skill `release-template`).

- **789-1 The menu as data.** Built: `app/[lang]/(protectedLayer)/tg/_data/menu.json` — groups of items (`{ group, items: [{ slug,
  title{en,ru}, hint{en,ru}, icon }] }`), first items of every element: «Обзор», «Задачи», «Настройки элемента», «Помощь»; the element's
  agent adds its own (the skill says how); every item is a page `tg/<slug>` from `_pages/`. Proof: the template's guards accept the file.
- **789-2 The drawer.** Built: `tg/_components/tg-drawer.client.tsx` (`@part tg-drawer`) — shadcn `Sheet` side left, a burger in the
  app's top bar, the mega menu = groups with headings and two-line items, the current page marked; Telegram's BackButton closes it;
  safe-area insets. Tasks asked of `parts_find` in the template: «side drawer» (Sheet), «navigation list». Proofs: eyes at 390 px light
  and dark with the drawer open (the template's own preview); keyboard: Tab into it, Escape out.
- **789-3 The skill and the README.** `telegram-mini-app` SKILL: the menu file, how an item becomes a page, the thumb zone and 44 px.
- **789-4 Release and rollout.** Tag v0.3.216, the core's pin, rollout to every custom element (root first) with each element's guards;
  ONE core build if the core changed. Proofs: root's `https://throughsongs.com/ru/tg` (own domain on this computer) opens with the drawer
  in the owner's Telegram (his phone) and in eyes; negative — a guest still gets the sign-in form (the edge lock untouched).
- Not in it: each element's own menu items — its agent's work after the release.

## 790 — the Mini App is the element's working process: the core shows it on «Рабочий процесс»

Address: the core: `app/[lang]/(architectLayer)/architect/[item]/[[...page]]/page.tsx`, a route widget under `architect/[item]/_widgets/`.

- **790-1 The shape.** The tab «Рабочий процесс» of a custom element shows, first, a phone frame 390×780 with the element's own
  `<site>/tg` inside (an iframe of its own address; the architect passes the edge lock with his session — one sign-in domain for the
  zone). One source, never a copy of its code. The element without an own-domain address — one line why and how to get it.
  Risk measured first: the element's response headers for `/tg` (`X-Frame-Options`, CSP `frame-ancestors`) — if they forbid framing, the
  template (789's release) allows framing of `/tg` by the node's own architect origin only, never `*`.
- **790-2 Built** as a route widget (`use-widgets`: it suits only this route). Proofs: eyes of root's «Рабочий процесс» — the same menu
  as in Telegram; negative — a native element's tab has no frame.
- Not in it: editing the Mini App from the core.

## 791 — «Проектирование продукта»: the third function, moving from Claude's desktop app

Address: the core (`item-tree.ts`, the page wiring, a hand-over command), the custom template (the element's pass and skill, in 789's
release).

- **791-1 His answer** (asked with this plan): WHAT moves. My reading: a project the person built with Claude's app on the computer — its
  folder with code and its instructions (CLAUDE.md, skills) — is carried into this element and rebuilt there, like reverse engineering
  but from their own source. Without his answer the step does not start.
- **791-2 The page.** `product-design/claude-move` «Переезд из Claude»: a field for the folder path (on this computer) or a dropped
  archive, what will happen in three lines, «Передать агенту элемента»; the hand-over like `npm run study` — the path goes to the
  element's agent as a task of its «move» pass; the core never reads the folder itself.
- **791-3 The element's pass and skill** in the template (same release as 789): read the source's README and instructions, list its
  routes and data, rebuild inside the element's architecture (sections, routes, its own design), never a mirror copy of foreign
  mechanics.
- **791-4 Proof:** a small real project (a Claude-made folder he points to) moved into a test element; negative — a path outside the
  person's home or a missing folder is refused before anything is handed over.

## 792 — the main agent in both modes; Masha's three elements in one cabinet

Address: the core (checks, the node-type and integrator skills), the sign-in element (its own agent builds the cabinet), the core's
doors if needed.

- **792-1 The modes, checked.** A script `scripts/node-modes.check.mjs` on a scratch copy of the registry: project → a new element is
  born under CONFIG, one wallet, no Messenger; factory → own settings, own wallets allowed, Messenger shown, tools only from the core;
  the main agent's words in both (the first-contact paragraph of today). Proof: the script's ✓ lines; negative — switching back changes
  no earlier element.
- **792-2 The description.** Into skills `node-type` and `integrator` (and the elements' instruction source): in «Много пользователей»
  the elements of ONE owner know each other through the owner — the account that holds their `elementAdminNNN` roles; what they share
  is the owner's profile in the sign-in element (the name first), never each other's data.
- **792-3 The cabinet and «О Маше».** The sign-in element's agent builds (a task through `npm run task`, supervised): its personal page
  lists every element where the signed-in account is the admin (names and links from the core's registry door), and a section «О <имя>»
  — the profile (name, how to address, language) stored with the account; a door for an element to read its admin's profile with its
  element key. Proofs: a test account «Маша» (made in the Users tab with three element roles) sees three elements in one cabinet and her
  name on each element's admin page; negative — another account sees none of them and cannot read her profile.
- Not in it: payments between owners; Lagrix.

## Not today

- 793 — the finishing plan, after 792 closes.
- Older open plans stay: 761 leftovers outside the launch, 769, 773; 771-4..6 are covered by 789–790.
