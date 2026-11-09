# 706 — Drop the Blocks and Design native elements; pages are designed natively by the element's agent

Status: PLAN APPROVED by the owner 2026-11-09 12:32 WET, verbatim: «go to work, to do step by step to finish» (after plan mode on the plan
«Step 706 — native design: the entrance, the empty starter body, birth «like X», the stand»). Substeps 706-1..7 below, each in its file.
Born 2026-11-09 on the owner's node (aifa-agi), from the lqvop landing graded 1 twice.

## 1. Retelling and decisions

The owner's question, 2026-11-09 ~10:55 WET, verbatim (excerpt): «является ли моя архитектура потенциально устойчивой к прогрессу или
пришло время вернуться к нативным возможностям модели в области дизайна и эффективности страниц?»; «психологически я готов удалить весь
код связанный с: блоками элементы, элементы дизайн, на уровне страницы из маршрута убрать логику разделение на блоке и виджеты».

The owner's decision, 2026-11-09 11:25 WET, verbatim: «Отлично давай зафиксируем факт того что мы приняли решение отказаться от
элементов дизайн и от элементов Blok.»

Open, the owner, same message, verbatim: «какое-то наследие они могут нести например если мы возьмём несколько самых качественных блоков
и сохраним их в архитектуре каждого стартового шаблона мы сможем создать pattern? Есть в этом ценности?» — my proposal (waits for his
word): keep the SECTION PATTERN, not a catalogue — block-section-head, block-faq, block-toc, block-warning-card + page-body + typography
in every template; each section carries its words in data, its `bid`, and its markdown form co-located; remove block-hero-centered and
block-cta-button from the three templates (the hero graded 1 on lqvop IS block-hero-centered: `pill` over the heading + `cta` +
`secondary`); the owner's verdicts become the design pass's anti-slop list.

What stays — «the physics» (explained in the same conversation; the owner's next word: «Отлично…»): two route files per branch and data folders (300
pages: 1252 s as files vs 98 s through the template); words in per-language data cells (the markdown twin, llms.txt, snippets,
translations, edits without a build); the static public layer; tokens in the element's own DESIGN-CONFIG → CSS variables
(`buildDesignCss`); `bid` / `data-block` addresses; the SEO/AIO guards. What goes: the shared catalogue and its process, the block/widget
taxonomy, the «first a ready block» law, the Design link.

The owner, 2026-11-09 ~11:30 WET, verbatim: «Прежде всего давай перестанем смотреть вообще на элемент исследования он самый мусорный
и самый бесполезный. Предлагаю поднять для теста новый элемент из стартового шаблона затем разработанные на этом элементе патерны
переедут сначала обратно в стартовый шаблон а затем будем думать его других существующих элементах согласен?» — and: «Технически если мы
не зависим от элемента блоки и от элемента дизайн прямо сейчас давай их удалим а потом поднимем новый стартовый шаблон если в процессе
поднятия появится какая-то зависимость мы её обнаружим в виде ошибки».
Done 11:36: blocks and design turned OFF on his node (`npm run power … off`, reason «шаг 706»): node 2.47 → 2.27 GB, the core answers 200.
Not deleted: the delete door takes only born custom elements (`isBornElement`: kind user + born); both are `required: true`, pinned
(blocks v1.4.34, design v1.1.39) — `services:install` of the next node update would bring them back. Off by a person = a neighbour's
call is refused at once with the reason, so a dependency surfaces as an error (his test). The real deletion is 706-5.
The order is now his: a NEW test element from the custom starter (`--look own --blocks off`) → its patterns back into the starter →
the existing elements later. lqvop is out of this step. The way back (my proposal): the element's agent hands its pattern commits as
patches into its own data folder; I apply them in the workshop clone, generalise, release. The element's subject waits for the owner.

The owner, 2026-11-09 11:42 WET, a proposal under discussion, verbatim: «имеющийся стартовый дизайн с которым проходит сейчас страница
создает для агента Pater безликого дизайна? Если я тебя правильно понял то стартовый шаблон не имеющий никакого Патерно проще развернуть в
любую сторону? Если это так то наилучшим решением будет пустой экран, который имеет обязательно заголовок обязательно футер наш
стандартный обязательно хлебные кружки если они включены и обязательно секции вопрос ответ если они включены обязательно страницы футера
если они включены всё остальное так называемое тело в идеальном состоянии лучше бы оставалось пустым? Так ли это». Fact: the starter's
home today = block-hero-centered + widget-static-custom-landing (343 lines: cards, flow, access-map, faq) + ~10 section-heads with text +
block-faq — the pattern every element inherits. My answer: yes, with three conditions — the chrome follows the element's tokens; an empty
body is a declared state «awaiting design», closed from indexing (check:page-blocks rule 7 forbids an empty home today, ✗ 577-7); the
brief and the anti-slop list replace our pattern, or the model's own default (the same centred SaaS hero) fills the void.

The owner, 2026-11-09 11:52 WET, a proposal, verbatim: «Я обратил внимание что ядро для каждого элемента на вкладке строительства
предоставляет кнопки: блоки, дизайн, настройки сайта. Эти кнопки сейчас у нас не реализуют ничего. Но в свете развития нашей архитектуры
кажется логичным: – убрать кнопку блоки да или нет? – На вкладке дизайн создать Бриф где пользователь выбирает один из навыков дизайна и
загружают референсы? – На вкладке настройки сайта выбирает связан ли этот новый элемент с узлом то есть наследует ли он его конфиге, и
дублирует собственные настройки. Если в этой части ты со мной согласен то при создании на странице у нас выпадает оранжевый баннер
который отправляет пользователя на вкладку настройки нужно расширить описание этого баннера и добавить эти две кнопки: дизайн, CONFIG, и
старая кнопка ведущая скорее всего на подписку Claude, Считаю правильным оставить этот баннер всегда если страница имеет формат Local
хост, или если это собственный домен то оставить этот баннер если его видит архитектор.Можно было бы его назвать баннер быстрой навигации
что ты думаешь по этому поводу внесёшь изменения в стартовый шаблон сразу? Одновременно понадобится создать какие-то заглушки для этих
страниц и перезапустить ядро? Я бы с этого начал как думаешь».
Facts found: the core's Build tab (`lib/web4-items/item-tree.ts`) — «blocks» for every element and «design», «site-settings» for custom
ones are only new-tab redirects to the element's own `/admin/*` pages (the owner 2026-10-23); the three link cards CONFIG, Design, Blocks
sit in the core's `element-danger-zone.tsx`. The starter banner (`components/shell/starter-banner.client.tsx`) is mounted UNCONDITIONALLY
in the element's `app/[lang]/layout.tsx` (custom; root has it dismissible) — every visitor on every address sees «Вы просматриваете ваш
стартовый шаблон…», and it is `fixed … top-14 z-30`, so it covers content (the lqvop hero badge). The width/skill badge (`ViewportBadge`,
«impeccable 1440») is on by default in production too.

The owner, 2026-11-09 11:53 WET, verbatim: «Есть ещё одна вещь у нас в левом нижнем углу экрана есть подсветка ширины экрана и она же
отображает навык дизайна. Возможно имеет смысл новых дизайна добавить к own-service-props.json ну возможно ещё и ссылку на референс для
этого можем хранить их в базе данных. Какую-то проблему решает если архитектура развивает связанные решения: например решение вокруг
генерации контента может предполагать генерацию текста генерацию видео, генерацию клипа то логично что эти решения будут выглядеть в
одном интерфейсе и если первая уже создано агент нативно может получить описание для второго и сразу же при запуске подставить его на
вкладку дизайнпредлагаю пользователю с минимальными настройками продолжить разработку? Подумай об этом».
Fact: the passport already holds `designSkill` (`OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json`) and reaches the core by `describe:publish`.

Assumptions:
- I assume that the element's OWN design panel (`admin/design`, `DESIGN-CONFIG`) stays: it caps nothing and gives the owner a path
  without a model. «элементы дизайн» is read as the Design native element.
- I assume that existing elements are not rewritten: their blocks are their own copies, the data format does not change.

## 2. What is reused (paths that open)

- Templates (`~/fractera-dev/fractera-{custom-item,native-item,root}-starter`), each: `components/blocks/block-{cta-button,faq,
  hero-centered,section-head,toc,warning-card}.tsx` + `page-body.tsx` + cards + `.blocks-lock.json`; `lib/content/blocks/registry.tsx`
  (`BLOCK_SET`, 29 lines); `lib/aio/blocks-to-markdown.ts` (a central `switch (block.kind)` — «a new kind … otherwise the machine
  version of the page silently loses its text»); `components.json` registry `@fractera` → `${BLOCKS_REGISTRY_URL}`.
- Template scripts — go: `blocks.mjs` 254, `check-page-composition.mjs` 175, `check-page-blocks.mjs` 198, `design-skill.mjs` 23; stay:
  `check-block-ids.mjs` 76, `stamp-widget-ids.mjs` 147, `check-page-sequence.mjs`. Admin «Blocks» pages: 669 lines — go.
- Template rules: `.claude/modes/build-design.md` (56), skills `use-blocks` (100), `use-design` (83), `build-widget` (96), `custom-design`
  (59); `build.md` «Look and site settings are data».
- Core: `scripts/blocks-usage.mjs` (DEFECT: reads `WEB4-ITEMS/user/blocks`, Blocks lives in `core/blocks` → «0 in catalogue»),
  `build-blocks-map.mjs`, `check-blocks-map.mjs`, `check-page-composition.mjs`, `sync-site-design.mjs`; commands `look`, `design-skill`,
  `blocks:usage`; skills `blocks-of-the-node`, `handle-block-request`, `design-and-settings-of-elements`, `use-sections`, `use-widgets`,
  `use-design`; CLAUDE.md §3 (Blocks, Design, the signal line), §6 («An interface is needed — first a ready block…», «A page has three
  sources…»), §8; the tool «task for a block»; registry entries, pins and the natives list of `services:install`.
- Must MOVE before deletion: `data/services/blocks/verdicts.jsonl` (the owner's grades) and skill `review-page` (framed on catalogue
  blocks; `shots.mjs` hard-codes the Windows Chrome path — defect of 2026-11-09).
- Retired starters: `fractera-blocks-starter` (~82k code lines, ~26k over the native template), `fractera-design-starter`.
- Measured on the owner's node 2026-11-09: blocks 126 MB + design 130 MB awake (`npm run load`); block usage — section-head 73 pages,
  warning-card 16, faq 12, hero-centered 12 (natives' documentation pages mostly).

## 3. Known limits

- CLAUDE.md §1–8 change only by the owner's word, sealed with `npm run check:instruction -- --seal`; on an installed node the system part
  comes back from the last release — the law changes only through a Fractera release.
- The core never edits an element: templates are released, elements take them through their agents (skill `release-template`).
- Words stay in data: the markdown twin and translations must not go blind (AIO, `check:aio`).
- Natives' documentation pages use block-hero-centered — they need the page header primitive before a template drops the block.

## 4. Observable results (draft)

- A new element born from the template has no Blocks or Design link and no `npm run blocks`; its design pass opens with a brief and
  writes its own sections; its machine twin holds every section's text (negative control: a section without a markdown form fails).
- `npm run load` lists neither blocks nor design; every existing element's pages still render (eyes screenshots before and after).
- lqvop's home page rebuilt by the new pass and graded by the owner.

## Substeps (approved)

**706-1 · Core: the Build tab.**
- `lib/web4-items/item-tree.ts`: the `blocks` page and its moved-page entry go; `site-settings` stops being a redirect.
- `[item]/[[...page]]/page.tsx`: the three `redirect()` lines go. `build/site-settings` renders the existing `ElementSiteSettings`
  with the CONFIG `ElementLink` card on top (moved from `settings/danger-zone`); `settings/site-settings` moves there (moved-page map).
  `build/design` renders a small client island: loopback → `http://127.0.0.1:<port>/<lang>/admin/design`, own domain →
  `domainRecord(item).url`, otherwise one line why the element is local-only.
- `_components/element-danger-zone.tsx`: default cards without `config`, `design`, `blocks`; `_i18n/element-settings.i18n.ts`: the
  site-settings texts stop sending people to the Danger zone.
- Proof: eyes screenshots of the Build tab (no Blocks, the switch in Site settings) · on localhost «Design» opens the element's design
  page (negative control: today's build lands on a non-existent https address).

**706-2 · Core: the look in the registry and birth «like X».**
- `element-describe.ts`: take the passport's `design` block (skill, audience, character words, what to avoid, reference links, token
  summary) into the registry entry, beside `designSkill`.
- `npm run create` (`scripts/main-agent-cli.mjs` → `scripts/item-birth.mjs`, `lib/web4-items/birth.ts`): `--look-like <id>` reads X's
  taken look from the registry (never X's code), writes it into the newborn's passport `design` (`inheritedFrom: X`) and its tokens into
  `DESIGN-CONFIG/design-config.json`; implies `--look own --blocks off`. Uploaded images stay in X's store space; links and captions
  travel.
- Proof: a seeding test on fixtures (passport with a look → newborn files) · negative: `--look-like` an element with no taken look →
  a clear error, nothing born.

**706-3 · Template: the quick navigation banner.**
- `components/shell/starter-banner.client.tsx` + `.i18n.ts` become the strip (the `inline` mode for pages without text stays as is);
  mounted in `app/[lang]/layout.tsx`.
- Visibility decided in the browser with the existing helpers (`lib/auth/temporary-address` `isTemporaryHostname`,
  `isLoopbackHostname`, the showcase check) and the architect check of `components/auth/access-gate.client.tsx`: loopback — always;
  temporary address — never; own domain — only a signed-in architect.
- In the flow under the header, never over content; three buttons — Design (`/<lang>/admin/design` of this site), Site settings (the
  core's `…/<id>/build/site-settings`), Claude subscription (today's link); the width/skill badge folded into it.
- Proof: the visibility function tested on hostnames and roles (negative: a temporary host shows nothing) · eyes on localhost.

**706-4 · Template: «Design» = the brief.**
- New widget `widget-dynamic-design-brief` first on `app/[lang]/(protectedLayer)/admin/_pages/design/{en,ru}.json`; the token editor
  stays below. Fields: for whom, 3–5 character words, references (links + screenshots through the existing
  `app/api/media/upload/route.ts`), what to avoid, design skill (default `frontend-design`).
- A door beside `/<lang>/admin/api/settings/design` (pattern of `design-save.ts` / `settings-access`) writes the passport's `design`
  block, keeping `designSkill` in step; `npm run describe:publish` carries it to the core.
- Vendored into the template's skills with `SOURCE.md`: `frontend-design` (anthropics/skills, Apache-2.0) and the anti-slop checklist
  (samber/cc-skills deslop, MIT) extended with the owner's verdict lessons.
- `.claude/modes/build-design.md` rewritten: brief → `DESIGN.md` (open DESIGN.md format) → own sections with words in data →
  `npm run eyes` → the owner's grade. `use-blocks`, `custom-design` out; `use-design` rewritten.
- Proof: the door writes the passport and refuses a bad shape (negative) · eyes of the filled brief.

**706-5 · Template: the empty body and the section contract.**
- Home `app/[lang]/(publicLayer)/_data/{en,ru,meta}.json`: empty sequence, `meta.awaitingDesign: true` → noindex
  (`lib/content/create-content-page.tsx`, beside `config.noindex`); `widget-static-custom-landing` goes.
- Sections kept: section-head, faq, toc, warning-card + page-body + typography; hero-centered and cta-button go (custom only). Each
  section's markdown form lives beside it (today's central `switch` in `lib/aio/blocks-to-markdown.ts`); a guard fails a kind without a
  renderer or a markdown form, and the same check runs when page data is written (the lqvop silent drop).
- Removed: `scripts/blocks.mjs`, `check-page-composition.mjs`, `check-page-blocks.mjs` (its «one h1» rule moves to
  `check-page-sequence` unless `check-seo-html` holds it), the `@fractera` registry in `components.json`, cards and `.blocks-lock.json`,
  the admin «Blocks» pages, their package.json scripts and prebuild lines.
- Proof: the template's whole prebuild + tsc green · negatives: a section without a markdown form fails; an empty home without
  `awaitingDesign` fails; the home's robots says noindex.

**706-6 · Release and node update.**
- Custom template: prebuild, tag, push, CI green; `npm run template -- pin` in the core; core commits (706-1, 706-2) pushed, CI green;
  fork aifa-agi synced (Chrome: «Sync fork» → «Update branch»); here `npm run node:update` — the core build stops agents and brings
  them back (skill `core-build-return`).
- Proof: `npm run serve:status` shows the pushed core hash · the Build tab live.

**706-7 · The stand and its sibling.**
- `npm run find`, then `npm run create -- … --look own --blocks off` from the new tag; Blocks and Design stay OFF, so a hidden
  dependency surfaces as an error and is fixed in the core.
- On localhost: the strip shows; the owner fills the brief; `npm run task -- <id> "Build process, design: …"`; eyes; the owner's grade.
- `npm run create -- … --look-like <stand>`: the sibling's Design opens filled; its first page wears the same tokens.
- Proof: the owner's grade with screenshots · machine plane: the page's `index.md` holds every section's text; the home was noindex
  until designed.

## My decisions (one line each, for the owner's yes)

- Root and native templates keep their banner and blocks in this step; only the custom template changes.
- The brief and the token editor live on the element's own page; the CONFIG switch is node state and lives in the core.
- The design skill has a default (`frontend-design`); vendoring it and deslop into the template is part of this yes.
- No stubs: every page is built working and proven on the stand.
- Uploaded reference images are not inherited by a sibling — links and captions are.

## Not in this step

The brief from Telegram (bot questions, photos as references); Blocks and Design out of the natives list (registry, pins, install);
`review-page` and `data/services/blocks/verdicts.jsonl` moved; root and native templates; existing elements.

## Records and price

After the owner's yes: the plan unfolds into `new-steps/706/706-1..7.md` and 706-main.md stages 5–8; `current-steps.md` on every event;
each substep closes with a summary naming its hashes. Price: my session on Opus; one template release; one core build (agents stop and
return); about 150 MB per new element (stand + sibling ≈ 300 MB; 5.5 GB free now).

## Verification, end to end

On this Mac: open the stand's site on localhost → the strip is there and covers nothing → «Design» opens the brief → filled → the
element's agent designs the home → screenshots graded by the owner; `/<lang>/index.md` carries every section's text; before the design
the home answered noindex. The visibility rule for a visitor (temporary address, own domain without sign-in) is covered by the unit test
until the node has its own domain. The sibling born `--look-like <stand>` shows the stand's tokens and a filled brief.
