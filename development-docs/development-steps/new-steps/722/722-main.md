# 722 — the left and the top menu for a thousand elements: state, pages of 12, two searches, «only active» (PLAN — approved 2026-11-11: «да, порядок подтверждаю, revalidate оставь»; after 721 and its node update)

Opened 2026-11-11 by the owner (tandem). His words, verbatim:

> Доработаем меню левое и меню верхняя для кастомных элементов смотри в чем идея если мы говорим о том что у нас есть 1000 элементов в
> нашем проекте то нам нужно показывать следующее: текущее состояние спит или активная? В контексте нашего текущего обновления как мы
> можем получить эти данные они должны быть готовы максимально мгновенно чтобы меню отрисовывать молниеносно.
> – Для левого меню а также для верхнего меню в режиме мобильной загрузки необходимо ленивые загрузка то есть ты подгружает по 12
> элементов предварительно отрисовывает сначала скелетрон, а затем запрашиваем очередные 12 элементов.
> – И в левом меню и верхнем меню должно быть два поиска это одно поле ввода и две кнопки кнопка найти и кнопка искусственный интеллект.
> Кнопка найти ищет по совпадению в названии. Кнопка искусственный интеллект выводит: Если модель OpenAI отсутствует переадресация на
> добавление ключа. Если ключ присутствует то интерфейс для голосового ввода с комментарием расскажите какой компонент вы ищете. Человек
> голосом может надиктовать что-то вроде например а есть у нас что-то что помогает создавать клипы. После получения результата модель в
> этом окне показывает результаты какие совпадают может быть дают комментарии может быть оставляют просто кнопки. Запланируй это
> отдельный шаг
> – И ещё задача для пользователя который находится в режиме архитектора нам нужно сделать переключатель CheckBox рядом с поиском
> показывать только активные элементы или все. Обычно пользователи мы этот переключатель не показываем и показываем всегда все элементы

> …в случае архитектора это правильный сценарий, но в случае обычного пользователя может быть их будут миллионы мы не можем позволить
> себе такую нагрузку предпочтительно показать последнюю Билл версию но абсолютно статически … все должно работать с выключенным
> JavaScript вот меню это именно то что нужно тестировать оно должно быть статическим и в приоритете это быстрое бесплатное отдача а
> можно пренебрегать это актуальность данных for public users

> да, активный — процесс работает

## Two laws, two readers

- **The architect (one person):** fresh data from the server, pages of 12 through a door, the state, both searches, «only active».
- **Everyone else (maybe millions):** the menu of the last build, in the static HTML, works with JavaScript OFF; no request to the server
  per visitor; freshness is given up on purpose. No state (a stale «active» would be untrue), no AI search, no checkbox.

## What exists today (measured 2026-11-11)

- The left menu is built on the server (`app/[lang]/(architectLayer)/_lib/draft-menu.tsx`), all elements at once; the top menu is the
  island «Все проекты» (`components/architect/all-projects.client.tsx`), its names already in the prerendered HTML.
- The core's `/ru` answers from the cache (`x-nextjs-cache: HIT`), but the layout is ISR: `app/[lang]/layout.tsx` `revalidate = 600` —
  the server re-renders at most once per 10 minutes; not per visitor, and not «only the last build» either.
- «Active» = the element's process runs. The state is already in one file, the node's registry: `off` (turned off by the person),
  `off.byRule` (asleep by the load rule), none — running (`lib/web4-items/element-power.cjs`). Reading it asks no process and no model.
- `npm run eyes` has no «JavaScript off» mode yet.

## Substeps (each proven on two planes; a fixture of 1000 synthetic elements in a scratch registry for the measures)

- **722-1 The state, instantly.** One reader: registry + name files → `{ id, label, address, state: running | asleep | off }`; measured
  for 1000 elements (target: under 20 ms, no process asked).
- **722-2 The architect's lists of 12.** A door `GET /api/architect/menu/elements?from=&q=&active=` (architect only, `// @api`); an
  island in the left menu and in the mobile top menu: a skeleton of 12 rows, then 12 more when the end comes into view; a state dot on
  each row; the checkbox «только активные» next to the search — architect only.
- **722-3 «Найти»** — a match in the name: the architect — through the door; everyone else — over a static index file of the build,
  filtered in the browser; with JavaScript off the search field is not shown.
- **722-4 «ИИ»** (architect): no OpenAI key → a link to the key (`/architect/build/environment#OPENAI_API_KEY`); a key → a window with
  voice input (the core's tool «voice input»), «Расскажите, какой компонент вы ищете» → the words → elements found by meaning with the
  node's own vectors (`embeddings`, no key) over names and descriptions → the result as buttons, with one line of comment each from the
  model (OpenAI, its price named). Nothing found — said plainly.
- **722-5 The static menu for everyone else.** The first 12 in the HTML; the build writes the rest as static files of 12; with
  JavaScript an island takes them from the cache, without JavaScript a plain link «Ещё 12» opens a prebuilt page. The owner 2026-11-11: `revalidate = 600` of the public layout stays («revalidate оставь»).
- **722-6 Eyes without JavaScript.** `npm run eyes -- <url> --no-js`; every menu is proven twice: JS off (links present and lead where
  they should, «Ещё 12» works) and JS on (pages of 12, searches).

Skills looked at (checked catalog): `wshobson/agents@interaction-design` (★42k, 16.6k installs) — skeletons and feedback states, the idea
taken; `deckardger/tanstack-agent-skills@tanstack-query-best-practices` (★228, 13k) — infinite pages, the idea taken, the library not
brought into the core. Nothing checked for voice search by meaning — built from the node's own parts.

## 722-1 built (2026-11-11)

- `lib/web4-items/menu-state.cjs`: `menuRows` (the registry and the drafts, one read each — the state of every element), `menuPage`
  (a portion of 12; `active`, `custom`, `q`), `menuElements` (all with names, for the static list of 722-5). Names are read only for the
  rows shown: ✗ measured first with names for all — 96 ms for 1000 (three small files each), over the 20 ms target.
- Proof 1: `npm run test:menu-state` — 1000 synthetic elements: a portion of 12 in 4.2 ms, «only active» 3.0 ms, a name search over all
  102 ms (a button press); negative controls: asleep and draft are never «running», an unknown name finds nothing.
- Proof 2: on the owner's node — root and «Клип» «running», cache and stripe «off», the same as the live processes in `serve:status`
  (online / не запущен); 1.9 ms.
- Said aloud: «running» = the node keeps the process running (the registry), not a live poll; a crashed process is raised by the health
  watcher.

## 722-2 built in the working copy (2026-11-11) — live proof waits for the build at the end of 722

- The server builds trees for the native drafts and only the first 12 custom elements, plus the one whose page is open
  (`draft-menu.tsx`); below them the island `MenuMore` (`_components/menu-more.client.tsx`): without JavaScript a link «Все проекты (N)»
  to the projects page, with JavaScript 12 skeleton rows when the end comes into view, then the door's 12, until the end.
- The door `GET /api/architect/menu/elements` (architect, admin; `lib/web4-items/menu-page.ts` over `menu-state.cjs`).
- The state dot on every element row (`components/workspace/menu-state-dot.tsx`, theme tokens: success, warning, muted), `data-state` on
  the row; the checkbox «Только работающие» (`_components/only-active.tsx`) hides every row not running with plain CSS — no JavaScript.
- ✗ on the way: `check:sections` read the state union inside `lib/content/sections/types.ts` as section kinds — the type moved to
  `menu-state-dot.tsx`; `check:api` wanted a door name of 6–12 words.
- Proof 1: tsc clean, the prebuild chain green. Proof 2 (after the node update): eyes with JavaScript on and off on the owner's node.

## 722-2 (the top menu) and 722-3 built in the working copy (2026-11-11)

- ✗ Found: every architect page asked `/api/node/catalog`, which probes the home page of EVERY running element over HTTP (3–10 s
  timeouts) — a thousand requests per page view at a thousand elements. Now the header takes natives from the catalog (`?native=1`,
  `catalogEntries({ nativeOnly })`) and the custom tab from the fast door: the first 12 with their passport description
  (`?description=1&root=1`) and a card «Все проекты (N)». Portions inside the dropdown itself would need the shell kit's mega-menu
  (`components/shell/`, a byte copy of the site) — a release of the site's shell together with the core, not this step.
- 722-3 «Найти»: `components/architect/menu-search.client.tsx` — one field and the button «Найти» (the slot for «ИИ» is 722-4); in the
  left menu above «Только работающие», in the header a magnifier that opens the same panel; results with the state dot and `data-state`;
  without JavaScript the field is not drawn. Words `menu-search.i18n.ts`. The static search for visitors goes with 722-5.
- Proof 1: tsc clean, the prebuild chain green, `test:menu-state` (the name search over 1000 and its negative control).

## 722-4 built in the working copy (2026-11-11)

- «ИИ» (`components/architect/menu-ai.client.tsx`) beside «Найти» in the left menu and the header: a press asks the node whether an
  OpenAI key is set (`GET /api/architect/menu/ai`) — none → the key's page (`/architect/build/environment#OPENAI_API_KEY`); a key → the
  project's one dialog with «Расскажите, какой компонент вы ищете», a text field and the core's voice input (`_tools/voice-input`, its
  transcription is the only model call), and the found elements as buttons: name, state dot, why it matched (skill · area · name ·
  description) with the matched words.
- The search by meaning is the main agent's own `find` (`scripts/main-agent-cli.mjs find --json`, the node's vectors, no key), run by
  the door as a separate process with the words as an argument — one code, one threshold (FIND_MIN 0.25). ✗ Not imported into the Next
  server: `self-description.cjs` finds the node by `__dirname`, which a server bundle may move.
- Measured on the owner's node with his own words «есть у нас что-то что помогает создавать клипы»: «Клип» first (0.59), storage 0.38,
  root 0.26 — 1.2 s, no OpenAI key used.
- Proof 1: tsc clean, the prebuild chain green. Proof 2 after the node update: the dialog by eyes, the door with and without a key.

## 722-4 changed by the owner's word (2026-11-11)

> Твой подход с исключением OpenAI является слишком узким. Во всех случаях когда модель доступна и возвращает ответ вместо ошибки нужно
> использовать OpenAI в противном случае возвращайся к использованию вектора

- The door now: `find --json --shortlist 30` (the node's vectors give the 30 nearest — a thousand descriptions are never sent) → with a
  key the OpenAI model (`textModelId()` — `lib/openai-text-model.ts`, the setting `OPENAI_TEXT_MODEL`, the old default named once; AI SDK
  `generateText` + `Output.object`) picks up to five and comments each in the person's language; ids outside the list are dropped by the
  core → on no key, an error or an empty answer the vectors' own matches with their reason. The answer says who picked (`by`), the dialog
  shows it. Price: one text call per search, about 2–4 thousand input tokens.
- Proof 1: tsc clean, the prebuild chain green. Proof 2 after the node update: the door answers `by: model` with the key, `by: vectors`
  with the model unreachable.

## 722-5 → step 723 (the owner: «да, 723 отдельно»); 722-6 built

- 722-5 moved to its own step 723 (`new-steps/723/723-main.md`, variant A, not built).
- 722-6: `npm run eyes -- <url> --no-js` (a browser context without JavaScript; the line says «без JavaScript»). First use on the owner's
  node (core 81149042): without scripts the element page shows its heading and breadcrumb as the address «s8y6x» — the fix `d35c5009`
  rides this update; the full menu is there without JavaScript (zones, «ГЛАВНЫЙ САЙТ», «КЛИП» and its sections).

## Live on the owner's node (core b1e9882a, 2026-11-11 ~17:20) — 15 temporary drafts added, then the file restored byte for byte

- Without JavaScript (the HTML): «Все проекты (16)» (`data-menu-more="static"`), 12 draft rows and the running root and «Клип» with
  `data-state`, «Только работающие» present.
- With JavaScript (a live browser): after the scroll the island brought exactly the rest — 3 rows (16 − 12 drawn − «Клип» drawn as the
  open page), the skeleton was seen, «Все проекты (16)» at the end; «Только работающие» left 2 of 17 rows, both running; «Найти» «клип»
  → «Клип», negative control «нет такого элемента» → «Элемента с таким названием нет»; no console errors.
- The header: «Главный сайт» with its description, 11 more and «Все проекты (17)»; the magnifier beside the tabs.
- «ИИ»: `GET` → `key: true`; `POST` the owner's words → `by: vectors` («Клип» · совпало название, «Хранилище», «Главный сайт»): OpenAI
  answers the node 429 (the translate door says `rate-limit` too) — the fallback did what the owner ordered, but after 20.9 s.
- The drafts file restored: the same sha `b3fdbdf290d7`, the menu shows no TST row.
- ✗ Found and fixed in the working copy (722-7, rides the next build): the search panel in the 240 px menu squeezed the field to a few
  letters — the field now has its own row; the model call retried 429 with pauses — now one retry within 12 s.

## 722-8 — the AI window rebuilt from ready parts (2026-11-11, after the owner's verdict and the register `reports/errors-2026-11-11-…`)

- Loaded first this time: `interface-design`, `use-tools`, `use-chat`. Ready parts taken: `AppDialog` (the one modal), `VoiceControl
  variant="textarea"` (an area with voice, the microphone under it full width — the pattern of «Реверс-инжиниринг», with the key hint),
  `Spinner`, `EmptyState`, `Button`. The chat tool considered and not taken: the window is one request and its result, not a conversation.
- `components/architect/element-row.tsx` — the row «state dot + name link (+ why)» extracted at its third copy (menu portions, «Найти»,
  «ИИ»); the three now use it.
- Intent: the architect in the middle of work finds «a component that does X» by saying it — calm, workbench-tight. Focal: the request
  area; one line under it — the status left, the one action «Искать» right; results as borderless rows (name 500, the reason small and
  muted), states: searching, empty, error, no vectors, who picked.
- Plane 1: tsc clean, the prebuild chain green by its exit code. Plane 2 (after the node update, BEFORE any report): eyes of the window at
  1440 and 390, light and dark, empty / searching / results — the screenshot paths named here.

## 722-9 — the left menu cleaned by the owner's critique (2026-11-11)

> раз ты уже сделал этот инструмент внутри верхнего меню пусть он только там и остается. Одновременно с этим из левого меню убирай все что
> ты построил я имею в виду инструмент для поиска и Checkbox. Но скажу-то мне нравится что ты поставил зелёный индикатор это правильно мы
> его оставляем возможно для не работающих элементов индикатор будет красный? Индикатор также поставь на вкладку нативные элементы там
> тоже есть работающие и неработающие. Теперь вопрос о фильтрации через чекбокс. По задумке он должен находиться прямо в верхнем меню …
> Но прежде чем продолжать сразу же включи нормальный навык дизайнер

- `interface-design` loaded again before continuing (his order). The left menu: the search panel and the checkbox removed
  (`only-active.tsx` deleted); the header keeps the search. Dots: `menuStates()` now covers every registry entry (`allStates` in
  `menu-state.cjs`) — the built-in natives get them; «выключен» is red (`destructive`), «спит» stays amber (it wakes by itself on a
  call — a question for the owner if he wants it red too), «черновик» a hollow ring.
- The checkbox and the dots in the header's dropdown need the shell's mega-menu (core and root carry it byte for byte, the templates an
  older copy) — taken over by the owner's next word: the header becomes ONE tool of the core that every element imports (step 727).
- Plane 1: the prebuild chain green by its exit code, `test:menu-state` green. Plane 2: after the node update, eyes of the left menu (full
  and compact) with the natives' dots.
