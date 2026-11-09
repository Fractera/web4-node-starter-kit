# 712 — The core's «Design» and «Site settings» tabs: a remote control over the element's own config files

Status: PLAN APPROVED by the owner 2026-11-09 ~18:10 WET, verbatim: «go to code non stop to finish» (after plan mode on the plan
«Шаг 712 — вкладки «Дизайн» и «Настройки сайта» ядра как пульт к конфигам элемента»).

## 1. Retelling and decisions

The owner, 2026-11-09, verbatim: «в обоих случаях и для CONFIG и для дизайна мы должны избавиться от внешних страниц которые уводят нас
из вкладки работы с элементом и перенести дизайн страницу на ту самую вкладку» · «ядро всего лишь навсего представляет доступ к …
настройкам которые сейчас существуют в элементе. То есть это удалённый пульт управления если пользователь однажды исправит файл
конфигурации своего собственного элемента таким образом что у него появится одни настройки а исчезнут другие значит в едре будут
представлены только те строки которые совпадают с предварительно созданными в ядре … Если пользователь добавил 10 и убрал из 10 -5 то
значит … новые 10 не должны появляться а из Старых 10 … редактировать только пять а остальные поля вообще не … пользователю для того
чтобы их настроить придётся внутри элемента создать собственный конфигуратор или работать через искусственный интеллект но нас это не
беспокоит».

Decided (in the approved plan): the element's own editor pages stay (an element lives without the core); the core no longer links to
them; the core stores nothing — it reads and patches the element's files through the element's doors with the node key.

I decided (the files are sparse — a fresh element's `design-config.json` holds only colours, `app-config.json` only `url`): «a field
exists in the element» = the element DECLARES it — its own config schema (zod → JSON Schema, `z.toJSONSchema`) or its closed key list
(`FEATURE_DEFAULTS`), returned by its door with the values. Shown in the core ⇔ the core knows the field AND the element declares it
with the same type. A field removed from the element's schema is hidden; a field added to it is unknown to the core and not shown; a
known name with another type is hidden. A save sends only the changed keys (JSON merge patch); the rest of the file is untouched.

## 2. Reused (paths that open)

Template `fractera-custom-item-starter`: `app/api/settings/design/route.ts` (the key door 280-6), `lib/architect/design-config-writer.ts`,
`admin/api/settings/{app,platform,brief}/route.ts` (session doors — their writing moves to `lib/`), `config/{design,app,platform}-config.ts`,
`config/*-config.schema.ts`, `config/platform-config.defaults.ts` (`FEATURE_DEFAULTS`), `lib/design-brief.ts`, `lib/own-site.ts` (`linkOn`).
Core: `app/api/architect/design-config/route.ts` (`settingsKey`, `siteDoor` — moved to a lib), `lib/microservices/registry` (`serviceUrl`),
`lib/design/{color-schemes,contrast,font-catalogue}.ts` (identical to the template's), the template's newest editors
`admin/_components/design-editors/*` and `site-settings-editors/*`, `components/element-design/*` (711), `components/design/*` (legacy 280
editors — evolved in place, nothing renders them today).

## 3. Known limits

The element boundary — the core never reads or writes an element's folder for this (doors only). The node key never reaches the
browser (the core's door calls the element server-side). Every door `// @api`; texts through dictionaries; `data-block` on every
container; the platform modal for the pin warning (`check:dialogs`); a component up to 250 lines; the architect's pages ask nothing
without a click — the tabs load by a client island after open (the existing 711 pattern), never values printed into a prebuilt page.

## 4. Observable results

On the node, in an element's Build → Design and Build → Site settings: no link leads out; the fields the element declares show its
values; a saved colour appears on the element's live page with no build; a switched-off breadcrumbs disappear there; the element's
file keeps its foreign keys; an element on an older template says «template older — update»; an element linked to CONFIG shows
read-only values.

## 5. Substeps

1. 712-1 Template: the key doors design (+schema, +revalidate), app, features, brief; writing moved to lib; fixture; release v0.3.180, pin.
2. 712-2 Core: the door `/api/node/element-settings`, the known fields and `visibleFields`; fixture of the owner's rule.
3. 712-3 Core: the Design tab whole — brief, 711 panel, fine tuning (colours, fonts, type, shapes, motion); pin warning; no link out.
4. 712-4 Core: the Site settings tab whole — CONFIG link line, read-only when linked, editors when own; no link out.
5. 712-5 Push, CI, fork sync, node update, live proofs by eyes; then the 711-8 stand (its subject — the owner's word).

Not in this step: the root starter (the owner: «later for root»); rolling v0.3.180 into existing elements (their «Update» button);
the legacy shared door `/api/architect/design-config` (untouched).
