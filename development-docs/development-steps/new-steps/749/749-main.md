# 749 — names instead of ids when an element is deleted or born, the true internet address on a server, Lagrix behind one accordion

Planned 2026-11-15 13:45 UTC — **PLAN, waits for the owner's yes.** Repository: the core only (Fractera/web4-node-starter-kit, main).
No template changes: the custom and native starters were read (2026-11-15) — neither prints its own id as text (`ownId()` only builds
links to the core) and neither draws a Lagrix part of its own (only the H2H page description and the native footer credit). It ships
in ONE update of the owner's Mac and ONE of aifa.dev, together with 5fb21d94, 18e4cbf5 and d81b9098 (not yet on the Mac). Every
interface file is written with `interface-design`, `use-primitives`, `use-shadcn` loaded.

## 1. The owner's words (verbatim, 2026-11-15 13:02 UTC)

«Я отменяю прошлое задание. Можешь очистить контекст сейчас я пытался удалить элемент и обнаружил что на вкладке опасные зоны при
удалении элемента вместо того чтобы показать его название ты показываешь его идентификатор очень интересно ведь мы однажды создавали
целый шаг для того чтобы у нас нигде в проекте не показывали идентификаторы а везде показывалисьреальные названия элементов. Найди
пожалуйста этот шаг ведь мы же его прошли? Так почему я снова вижу идентификатор может быть потому что мы с тобой забыли внести изменения
в кастомные элемент? Проверь пожалуйста шаблон кастомного элемента где у нас показывает идентификатор вместо названия? Другую проблему
нашел уже на удалённом сервере. Сделай исследования на предмет того, что при нажатии на название элемента нас открывается его главная
страница там есть название порт на этой машине и это выглядит нормально а дальше есть название адрес в интернете и я почему-то вижу
красную карточку который сообщает нереальный адрес который я вижу в адресной строке адрес Local хост и ошибочную надпись узел работает на
этой машине своего Домина у него нет. Что за бред? Исследуй проблему Также давай ещё обратим внимание на другую часть этой страницы она
рассказывает о том как работает этот элемент в сети lagrix. Но так как этот элемент ещё не построен я попрошу тебя сделать аккордеон
внутри которого будут скрыты все эти элементы а название на аккордеоне будет означать: данный элемент в сетях lagrix web4 (пока не
построена) то есть я бы мог бы вскрыть всю эту информацию но боюсь что когда я активирую сеть LARX я просто не вспомню что было скрыто
поэтому пусть аккордеон существует а вся информация не будет скрыта , в работу . Проверь и кастомные шаблоны и существующие нативные
шаблоны и стартовые обои типОв»; then «i deleted 2 elements , it is ok».

I read «вся информация не будет скрыта» as «nothing is removed from the code — it stays inside the accordion».

## 2. Measured (2026-11-15 13:06–13:45 UTC, read-only)

**T1 — the id in the delete dialog.** The step he remembers is **721** («human names wherever an element is shown», approved
2026-11-11, `921947b1`, `d35c5009`): one `elementLabel(id, lang)` in page titles, the element's home, the i2i catalog, cards, lists and the
left menu. Its inventory (721-0) was an eyes scan of 177 PAGES — a dialog opens only on a click, so the delete dialog was never seen:
`delete-element-button.client.tsx` prints `{address}` and asks to type it (325-5); without a node domain (this Mac) the address is the
bare five-character label — the id. 678 (the menu name) and the 2026-11-10 chat rule (CLAUDE.md §1) never covered it either.
**A second source, found on the way:** the panel's «+ Создать элемент» makes a draft with only a random id (`createDraft`, 314-1), and its
birth passes no `--name` (`lib/web4-items/birth.ts` `birthArgs`: `--look`, `--repo`), so `item-birth.mjs` writes `props.name = id`
— an element born from the panel is called by its id EVERYWHERE (menu, header, title, dialogs). 721's scan did not see it: every custom
element of that day was named by the main agent (`create --name`, required since 682). The custom template is clean.

**T2 — the red «Адрес в интернете» on aifa.dev** (reproduced in his Chrome, `architect.aifa.dev/ru/root`): the card says
`localhost:24683` and «Узел работает только на этой машине: своего домена у него нет». The doors, same minute:
`/api/node/reach?service=root` → `{"mode":"local","port":24683}`; `/api/node/place` → `kind: "server"`; `/api/domain/state` →
`zone: "aifa.dev", active: true, server: true`. The same `mode: "local"` for auth, data, config, storage — every element's and every
service's main tab on a server is red. Cause: `app/api/node/reach/route.ts` `measure()` line 114 — «no `tunnelId` → local»; a server's
domain is held by its nginx (`logs/domain.json` `via: "server"`, 737-8), which 737-16 taught the POST (`serverReach`) and 742-1 taught
`/api/domain/state`, never this GET. The 741-7 map (`reports/feature-where-the-node-lives-map.md`, 25 rows) has no row for this card.

**T3 — the Lagrix part.** The element's home (`architect/[item]/[[...page]]/page.tsx`, `r.trail.length === 0`) draws, after the port and
address cards, `ElementHome` (`_components/element-home.client.tsx`, 551-2): an accordion of «Репутация в сети Lagrix» and «Кошелёк
элемента» (the wallet opens itself with a red dot while the discovery alarm burns). Custom elements only (544-3: natives have none).
The core draws it for every custom element — one change covers them all.

## 3. Reused (paths that open)

`lib/web4-items/element-name.ts` (`elementLabel`, `elementDisplayName`) · `lib/web4-items/name-file.cjs` (`ownName`, `writeName`,
`displayName`, `NAME_MAX` 60) · `components/dialog/app-dialog.client.tsx` · `components/ui/{button,input,label,accordion}.tsx` ·
`app/api/architect/items/[id]/route.ts` (DELETE) · `app/api/architect/drafts/route.ts`, `drafts/[id]/route.ts`, `drafts/[id]/birth` ·
`lib/web4-items/drafts.ts` · `lib/web4-items/birth.ts` · `scripts/item-birth.mjs` (`--name` exists) · `app/api/node/reach/route.ts`
(`publicIp`, `answers`, `serverReach`) · `lib/hosting/place.mjs` (`placeKind`) · `components/services/service-reach.client.tsx`,
`service-port.i18n.ts` · `_i18n/element-settings.i18n.ts` (removeDialog), `_i18n/element-home.i18n.ts`.

## 4. Known limits

- CLAUDE.md §1: an element is named by what it is, never by its id; §6: one modal (`AppDialog`), texts through translations, a component
  ≤ 250 lines, `data-block` on every container; a touched file leaves clean (`check:shadcn-parts` — the raw `<button>` of
  `create-draft-button.client.tsx` becomes `Button`).
- 741: where the node lives is asked of `lib/hosting/place.mjs` only (`check:place-readers`).
- The delete doors are destructive: their checks are proven as functions over a temp folder, never by a POST to the live node.
- The batch rule: one build of the Mac (≈12 min, the terminal goes dark — the warning ends a turn first), one update of aifa.dev.

## 5. Substeps

| # | Result | Proof (two planes, one negative) |
|---|---|---|
| 749-1 | The delete dialog of an element and of a draft asks «Удалить «Клип» насовсем?» and takes the NAME; the doors check the name | Chrome on the Mac: the dialog names «Клип», `s8y6x` typed keeps the button off · a unit test of the check over a temp folder |
| 749-2 | «+ Создать элемент» asks the name first; the draft and the born element carry it (the core's name file → `--name`) | Chrome on the Mac: a draft «Проба имени» in the menu and its title, then deleted by its name · a unit test (empty name refused) |
| 749-3 | «Адрес в интернете» on a server: `aifa.dev` / `<address>.aifa.dev`, green when it answers, the record to add when it is missing | aifa.dev after its update: the door says `server`, the card green by eyes · the road test; the Mac still `local` |
| 749-4 | The Lagrix part of an element's home sits inside ONE closed accordion «Данный элемент в сетях Lagrix Web4 (пока не построена)» | eyes on the Mac: closed, then opened with everything inside · DOM: no rating or wallet outside it |

## 6. My decisions (one line each)

- 749-D1 — The person types the element's NAME to delete it (as he thinks of it); an element without a name falls back to its address — the
  same rule as everywhere (678-1). Compared after trimming and folding spaces, case-insensitive.
- 749-D2 — The internet address line stays in the dialog only when the node has a domain (without one there is no internet address).
- 749-D3 — The name is asked when the draft is made, not at birth: then the menu never shows a random id even for a minute (749-2 is
  my addition — research found it; one word drops it).
- 749-D4 — A server without a domain yet says so in its own words; «только на этой машине» stays for a person's computer only.
- 749-D5 — The accordion title is his words, capitals only.

## 7. Not in it

The suspects and defects in `wishes.md` (by reading, not measured, or of another capability). The main agent's `npm run create` path is
unchanged (it already names). No template release.

## 8. Order, address and price

749-1 → 749-2 (the same name store and dialog words) → 749-3 → 749-4 → the whole prebuild chain in the working copy → push → the CI run
→ the fork sync (`gh api … merge-upstream`) → the Mac's update (warned first) → aifa.dev's update → the live proofs. Code: this session,
Opus. Running cost: none — no process, no timer; the door measures only when the card is opened, as today.
