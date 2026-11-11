# 721 — human names everywhere an element is shown; the compact menu without the Passport (PLAN — approved 2026-11-11: «да, порядок подтверждаю»)

Opened 2026-11-11 by the owner (tandem: a report after every substep). His words, verbatim:

> Сейчас если мы пройдём по факту нашего ядра а также откроем настройки элементов в полном режиме этого мы можем обнаружить что
> множество элементов в нашей архитектуре записанные и представлены в правом на экране как из идентификаторы. Но я как человек не могу
> понимать смысл идентификатора. А раньше у нас была такая же проблема и в левом меню и верхнее меню. Мы её пофиксили теперь там
> нормальные названия именно так должно все существовать и в проекте. Видимые в интерфейсе названия должны быть человеческие

> Ещё одно обновление левого меню, для компактного режима: компактном режиме мы паспорт полностью скрываем а вкладку как это работает
> оставляем на уровне паспорта чтобы она была в одном уровне с вкладкой основной.

## What exists today (measured 2026-11-11, by code and by eyes on the owner's node)

- One name source since 678-1: `lib/web4-items/element-name.ts` `elementDisplayName` (name file of the core → passport `name` → address);
  the left menu, the top menu and notices use it.
- It gives «Клип» for s8y6x, but «Fractera Auth», «Knowledge graph» (English passport names) for the natives and «root» for root.
- Seen ids in the right part of the screen: the browser title of every element page — `${words.title} — ${p.item}`
  (`architect/[item]/[[...page]]/page.tsx:177`, «Настройки — s8y6x»); the i2i catalog lists the ids of all twelve elements; the rest — the
  list from the eyes scan of 177 pages (one native, one custom, the core), attached to 721-0.

## Substeps (each proven on two planes)

- **721-0 The inventory.** The eyes scan of every architect page (JS on): each place a raw id is visible, as a list in this file. It
  becomes the before-picture (the negative control of 721-2).
- **721-1 One name in the person's language.** `elementLabel(id, lang)`: a native — its label in the left menu's words for that language
  («Вход», «Граф знаний» …); a custom — `elementDisplayName`; root without a name — its site's `short_name`, else «Главный сайт»;
  never the id. The left menu and the top menu take it too, so the same element is called the same everywhere.
- **721-2 Every place of the inventory** takes `elementLabel`: page titles, the i2i catalog, cards and lists. The id stays only in
  addresses and commands. A words check where it is cheap: a page component may not print a raw `p.item` / `id` as text.
- **721-3 The compact menu.** The Passport is hidden completely; «Как это работает» moves up to the Passport's level, the same level as
  «Ядро». The full mode stays as it is.
- **Proofs.** The eyes scan after: zero raw ids in visible text (before — the 721-0 list); `npm run eyes` of the compact menu, the
  screenshot looked at; `tsc` and the prebuild chain green.

Rides the same node update as 720 (one core build).

## Built (2026-11-11)

- **721-0 the inventory** (eyes scan, 177 pages: the core, auth, graph, s8y6x; JS on): the browser title of every element page
  («Настройки — s8y6x»); the element's home heading («s8y6x»); the i2i catalog (twelve rows by id or address, the address again in grey);
  the API doors «who calls» (`config, design`); «Главный агент → Настройки» and «Платежи → Web2» (`root`, `s8y6x`, «Stripe — stripe»).
  Left as it is, on purpose: «Домен» says «Внутреннее имя auth остаётся» — the sentence is about the internal name itself.
- **721-1** `elementLabel(id, lang)` in `lib/web4-items/element-name.ts` (the rule of 632-1 moved from `dashboard-rows.ts`: the core's
  section title → the name for people → «Главный сайт» for an unnamed root); words `element-name.i18n.ts`. The left menu takes it, so
  root is «ГЛАВНЫЙ САЙТ» there, as in «Все проекты».
- **721-2** every place of the inventory takes it; the address stays only in links.
- **721-3** compact mode: no Passport, «Как это работает» on the first level above «Ядро» (`draft-menu.tsx`).
- Not built: a static words check «a component prints a raw id» — the eyes scan is the check (rerun after the node update).
- Proof 1: `tsc` clean (outside the stale `.next/dev`), the prebuild chain green with the new files tracked.
- Proof 2 (after the node update): the eyes scan again — zero raw ids in the inventory's places; the compact menu by eyes.

## Live on the node (core 81149042, 2026-11-11 ~16:20)

- Titles: «Настройки — Клип», «Строительство — Авторизация», «Главный сайт»; the element home heading «Клип», root «Главный сайт»;
  the left menu «ГЛАВНЫЙ САЙТ»; the inventory places rescanned — only English description words and error codes remain, no ids.
- Compact menu by eyes: no Passport, «Как это работает» on the first level above «Ядро» (switched for the screenshot, switched back).
- ✗ Found by eyes in compact mode: the inner element pages printed the address as the page heading (`pageTitle={address}`, not seen in
  full mode, so the full-mode scan missed it) — fixed in the next commit, rides the next node update.
