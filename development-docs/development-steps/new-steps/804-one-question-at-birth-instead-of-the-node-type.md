# 804 — one question at an element's birth instead of the node's type

State: PLAN — waits the owner's «да» (phrases included). Asked 2026-11-19 16:37 (terminal): «no first separate logic, go to plan».

## The owner's words (verbatim, 2026-11-19 16:26)

«я имею переключатель проекта то есть он предназначен для одного хозяина или для многих этот переключатель живёт в ядре, но при создании
элементы не повторно спрашивают какой я хочу элемент для одного хозяина или для нескольких то есть дублируется вопрос мне кажется это
конфликт логики? Может быть тогда на уровне ядра имеет смысл вообще все это убрать и просто хранить в общем реестре ядра перечисления
элементов какие являются связанными с ядром а какие нет?» — then «no first separate logic, go to plan».
- 16:40, the rule: «по дефолту все нативные шаблоны идущие по умолчанию и руут являются связанными с одним хозяином».

## Measured (2026-11-19)

- The node switch (`nodeType` in WEB4-ITEMS-REGISTRY/web4-items.json: project | factory; the Passport card «Режим работы приложения»,
  POST /api/node/type, `npm run node-type`) silently decides an element's PEOPLE: on a factory node every custom element is born with
  its own app in the sign-in (`scripts/item-birth.mjs:338`, 554-1).
- The birth window asks only the LOOK: «Как весь проект» (CONFIG link) or «Самостоятельный проект» (own settings) — preselected by the
  node type (`birthLook`); on a factory node it still offers «Как весь проект» while the people are separate anyway. One decision is
  cut in two halves.
- The sign-in already separates people per element (an organization per element, 554) — it needs no change.
- Readers of the node type in the core (17): the birth (item-birth.mjs, birth-button), the wallet (`oneWallet`), the browser
  (`elementMay`), the parts index and `/api/node/tools/take` (neighbours' tools only on a single project), the element tree
  (`effectiveMessengers`, `project: false` — only the hidden Messenger), `/api/node/projects`, the Passport card and `/api/node/type`,
  `scripts/node-type.mjs`, `main-agent-cli`, `services-install`/`node-update`/`check-microservices` (keep the registry field). The
  custom template does not read it.
- CLAUDE.md speaks of node modes in §1, §3, §5 and §7 (the owner's word changes them).

## The shape

Every element answers ONE question at its birth, kept in its registry entry `app: "project" | "own"`:
- **part of the project** — the project's people and sign-in, the look and settings follow CONFIG (the link can still be cut later on
  its settings page, as today);
- **an app of its own** — its own people and accounts (its organization in the sign-in), its own look and settings; fixed at birth
  (people do not move between apps).
By default every preinstalled native element and root is «part of the project» — linked to the one owner (the owner's rule, 16:40). «A
factory» stops being a mode: it is simply a node holding apps of their own.

## The words (to agree before code)

- Question: «Чем будет этот элемент?» / «What will this element be?»
- «Частью вашего проекта» — «Те же люди и вход, что у всего проекта. Облик и настройки берёт из CONFIG и меняется вместе с ними; отвязать
  можно позже.» / «Part of your project» — «The same people and sign-in as the whole project. Its look and settings follow CONFIG and
  change with it; you can unlink it later.»
- «Самостоятельным приложением» — «Свои люди и учётные записи, свой облик и настройки: например, сайт клиента или отдельный продукт.
  Выбирается один раз: люди приложения живут отдельно.» / «An app of its own» — «Its own people and accounts, its own look and settings:
  a client's site or a separate product, for example. Chosen once: the app's people live apart.»
- The own app keeps today's sub-choice of where its code comes from (the starter / a repository).

## Substeps

- 804-1 The element's app: `lib/web4-items/element-app.cjs` — `appOf(id)` reads the registry entry `app`; the preinstalled native
  elements and root → `project` by default (the owner's rule); an entry without the field → `own` when the sign-in has its organization, else `project` (the migration rule, measured
  once per element and written into the registry by `services-install`).
- 804-2 The birth: the window asks the one question (the words above); `item-birth --app project|own` → the CONFIG link (look), the
  sign-in organization (own only) and the registry field; `birthLook`/node type gone from the birth.
- 804-3 The readers become per element: the wallet (a project element uses the node's wallet only; an own app may have its own), the
  browser (an own app does not drive the architect's browser), the parts index and tools/take (tools pass only between project
  elements; an own app takes the core's), the tree context (h2a/h2h off for a project element), `/api/node/projects` (each row's app).
- 804-4 The switch goes: the Passport card «Режим работы приложения», POST /api/node/type, `npm run node-type` and its skill, the
  main agent's node-type line; the registry field `nodeType` dropped by `services-install`/`node-update`, `check-microservices` refuses
  it back.
- 804-5 The instruction: CLAUDE.md §1, §3, §5, §7 — «node mode» replaced by the element's app (the owner's word; seal), the skills
  that name the node type (node-type removed; create-element, design-and-settings-of-elements, integrator checked).
- 804-6 Delivery: prebuild, one core build, eyes of the birth window; the push (his paste), ONE server update; then the Marina test
  (born «an app of its own»: its admin in its app, the «Домен» page, the delete window).

## Proofs (two planes each)

- Tests: birth `--app own` → an organization in the sign-in and `app: own`; `--app project` → none and `app: project`; negative — an
  entry without the field and with an organization reads `own`. Wallet / browser / tools / tree per element with negative controls.
- Eyes: the birth window with the one question; the Passport without the mode card. Live on the server: Marina born as an own app.

## Not in it

- Moving an existing element between «part of the project» and «an app of its own» (its people would have to move).
- Lagrix, Messenger (hidden until Lagrix).
