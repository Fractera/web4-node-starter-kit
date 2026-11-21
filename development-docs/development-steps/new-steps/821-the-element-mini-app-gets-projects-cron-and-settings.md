# 821 — the custom element's Mini App: «Проекты» (4 sections · 46 groups, empty but ready), a common «Cron», «Настройки»; the private layer becomes «Администрирование»

State: PROPOSED 2026-11-21 ~10:15 UTC — waits the owner's «да» to this plan and then to the picture (821-1) before any code.

## The owner's words (verbatim)

- Telegram 409 (09:47): «Внутри кастомного шаблона у нас приватный слой до сих пор называется слой архитектора … заменить этот слой на
  слой администратора элемента чтобы самоназваний не путала?» — agreed (411): «Администрирование» on screen, «element admin layer» in docs.
- Telegram 412 (09:58): the structure — Дашборд · Проекты («огромный шаблон … Сортировка это популярные проекты то есть те в которых
  больше всего страниц, актуальные это те в которых установлены задачи в Cron событиях») · Krohn события («общий крон всех проектов») ·
  настройки (собственная инструкция элемента, о владельце, о проекте, навыки, подписки с датами окончания, MCP коннекторы) · «то что мы
  построили раньше в рабочем процессе нужно все убрать». The whole text: pre-steps/2026-11-21-mini-app-projects-template.md.
- Telegram 416–417: the «Projects» template, 46 groups — the same intake file.
- Telegram 424 (10:06): «эти 46 групп нужно разбить на четыре например раздела … как только пользователь видит свое приложение … сама
  архитектура вдохновит его … пока делаем готовую но пустую болванку таким образом чтобы буквально нативно агент понимал что он делает и
  куда кладёт? Позже обсудим дашь борт».

## Decided

- All 46 groups are visible from the first day, empty but ready (variant Б — the owner's idea: the architecture inspires); 4 sections
  (Telegram 425): Дело (16) · Голос и аудитория (9) · Знания и инструменты (10) · Жизнь (11).
- Dashboard — later (not in 821). The old modes «Мои проекты | A2A · Web4» and their screens go (a2a, a2a-orders, a2a-reviews,
  a2a-services, a2a-wallet, help); «Подписки» moves into «Настройки».

## The design (mine, for the owner's yes)

- **One route, no new route files** (the frame: a branch has code only at its root; `scripts/check-routes.mjs`): the Mini App branch
  `app/[lang]/(protectedLayer)/tg/` keeps `page.tsx` + `[...slug]/page.tsx`. Addresses: `/tg/projects`, `/tg/projects/<group>`,
  `/tg/projects/<group>/<item>`, `/tg/cron`, `/tg/settings/<part>`.
- **One catalog file** `tg/_data/projects.json`: sections → groups → items, each with a slug, a title and one line «what lives here»
  (ru, en). The route draws a catalog address that has no folder as the catalog's own screen; a folder `tg/_pages/projects/<group>/<item>/`
  appears only when the agent puts real work there, and then it wins. No 250 empty folders in every element.
- **Sorting** `?sort=popular|actual` on the server, from files: popular = the number of page folders under a group; actual = the group
  has entries in the element's calendar. No state manager: the choice lives in the address.
- **An empty item** says «Здесь пока пусто» and offers «Спросить агента, что можно сделать здесь»: the element's door (initData of
  Telegram checked) wakes the element's own agent with that question; the answer comes in the element's bot. Price said on the button's
  hint: one turn of the element's agent on its subscription.
- **Cron**: the element's calendar (`OWN-SERVICE-PROPS/CRON.json`) gets an optional `project` (a group slug) per entry; `/tg/cron` shows
  all, a group's screen shows its own — one source, two views.
- **Настройки**: read views of what the element already has — its instruction (CLAUDE.md §11), the owner and the project (the passport
  and «From the core»), skills (`.claude/skills`), subscriptions with end dates (`SUBSCRIPTIONS.json`), MCP connectors (`.mcp.json`).
  Editing them waits for the owner's next file («как мы будем обучать агента у элемента понимать свою собственную природу»).
- **The agent knows where to put things**: a skill of the element «projects» — the catalog, the address of each item, how to add the
  person's own item («добавить»), how to tag a calendar entry with its project.
- **The core is not built**: `tg/_data/menu.json` keeps the shape the core reads (`modes[].groups[].items` + `common`) — one mode with
  «Проекты» (its 4 sections as children), «Cron», «Настройки» (its parts as children); the core's «Рабочий процесс» shows it as it is.
- **The rename** «слой/страницы архитектора» → «Администрирование» in the template's visible texts, READMEs and skills; routes, folders
  and the locks («the architect passes every lock») stay.

## The owner's words after the plan (2026-11-21 10:08–10:12 UTC)

- Telegram 426: «просто поднять кастомный шаблон сейчас в локальном компьютере и будем с ним работать … обновлять и выгружать на GitHub
  смотреть на живую» → the workshop runs `next dev` on http://127.0.0.1:24710 (scratchpad 821/dev.log); template pushes today are his word.
- Telegram 429: «продублируем верхнюю часть этого пульта … оставить шапку а эти карточки … под шапкой и уже ниже будет сам раздел который
  будет иметь левое меню с подвижным ящиком … попробуй спроектировать красивый дизайн» · 431: «подумай … куда добавить органично те экраны
  которые у нас существуют в узла потому что без них также элемент не может быть полноценным».
- Mock v1 approved («выглядят хорошо богато мне нравятся», 431) — logs/eyes/2026-11-21T10-09-28-665Z.png. Mock v2 (the Pult's family:
  Telegram theme colours, grouped cards; A home with the agent card, fuel, «ждёт вас», 4 sections · B the drawer · C projects · D «Элемент»:
  Сайт / Люди / Агент / Строительство) — logs/eyes/2026-11-21T10-12-21-677Z.png, sent 432–433.
- «Элемент» rows that live in the core (the agent card, fuel, Claude subscription, the bot, deploy) need a core door «my own» with the
  element's key → one core build at the end; until then those rows say «скоро». Site, design, site settings, users — the element's own pages.

## Substeps

- 821-1 the picture before code: a mock on the template's tokens at phone width, light and dark — «Проекты» (4 sections, sort), a group,
  an empty item with «Спросить агента», «Cron», «Настройки» → screenshots to the owner → his yes. (skills interface-design, use-primitives,
  use-shadcn loaded first.)
- 821-2 the catalog `projects.json` (46 groups in 4 sections, items, ru/en lines) + its guard test.
- 821-3 `menu.json` in the new shape; the old screens removed; the drawer (`tg-shell`) draws it.
- 821-4 the screens: projects with sections and sort, a group, an item (folder or the catalog's empty screen), the ask door.
- 821-5 the calendar's `project` tag and the two views.
- 821-6 the settings' read views.
- 821-7 the skill «projects» for the element's agent; the rename to «Администрирование».
- 821-8 release custom v0.3.221 (skill release-template), the core's pin, a fresh test element on the Mac born from it (part of the
  project) → eyes screenshots of its /tg screens and of the core's «Рабочий процесс» → the owner looks.

## Test checklist (shown before the code, marked after — memory test-plan-checklist-first)

- T1 the catalog: 4 sections, 46 groups, unique slugs, every title and line in ru and en (negative: a duplicate slug fails).
- T2 the route: a catalog address without a folder draws the empty screen; an address outside the catalog is a 404.
- T3 a real folder under `_pages/projects/<group>/<item>/` wins over the catalog's empty screen.
- T4 sort on fixtures: popular by folder count, actual by calendar entries (negative: an entry without `project` counts for none).
- T5 the core's `elementTgMenu` reads the new menu.json (the core's own test with the new file) — no core build.
- T6 eyes: phone width, light and dark, no console errors, nothing covered; the ask button's door refuses a call without valid initData.

## Not in 821

The Dashboard; editing the settings; A2A in the Mini App (it returns when the network lives); a rollout to root and other elements (the
owner's word later); the server.
