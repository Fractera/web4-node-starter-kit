# 706 — Drop the Blocks and Design native elements; pages are designed natively by the element's agent

Status: DECIDED by the owner, plan in drafting (stages 1–4 below; substeps unfold after the owner answers the legacy question).
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

## Substeps — draft for the owner's approval (2026-11-09 11:53)

706-1 core: «Blocks» leaves the Build tab; «Site settings» gets the CONFIG link switch moved from the Danger zone · 706-2 template:
the quick navigation banner — an island in the flow; localhost always, own domain only the architect, temporary address hidden; three
buttons, the width badge folded in · 706-3 template: «Design» = the brief (audience, character, references with upload, anti-references,
the skill with a default); the look in the passport; the design pass reads the brief · 706-4 template: the empty body «awaiting design»,
noindex; the Blocks pages, `npm run blocks`, cards and the two composition guards go · 706-5 release custom and root, pins, push, fork
sync, node update · 706-6 the stand born from the new tag: the owner fills the brief, its agent designs, the owner grades · 706-7 birth
«like element X»: X's look from its passport fills the new element's brief, proven with a sibling of the stand.
Not included: the brief from Telegram; the natives Blocks and Design out of the core's list; review-page and verdicts moved; the existing
elements.
