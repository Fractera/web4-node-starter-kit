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
