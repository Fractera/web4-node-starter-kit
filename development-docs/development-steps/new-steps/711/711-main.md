# 711 — «Строительство → Дизайн» of an element: design skills found in the graph, references, kept in the node's base

The owner 2026-11-09, verbatim: «мы должны развивать вкладки дизайн, где пользователь должен прежде всего выбрать один из существующих
навыков … сделать запрос внутри вкладки дизайн к графу получить все существующие навыки дизайна с каким-то небольшим описанием и затем
пользователь их один или несколько добавит к своему проекту чтобы в будущем из них можно было выбирать. Также нам нужно будет загрузить
референсы сохранить их в базе данных … прямо внутри ядра этого разработать правую вкладку и все эти события будут происходить
загружаться сохраняться изменяться.» · «Мне нужен нормальный поиск … когда пользователь будут добавлять туда свои навыки или когда будет
обновляться этот граф мне надо чтобы … появлялись новые навыки а не те которые ты щас хард кодом вытащишь». · «Строй мне промежуточный план
по вкладке дизайн».

Law of the step: no list of skills and no filter in code — every open of the tab is a live search of the graph; a skill added to the
graph (the person's own, a base update) shows up without a core build.

## The end goal (the owner's «y», 2026-11-09)

The mechanism knows nothing about skills in advance — 2 or 200 in the graph, the owner's and the client's. The client, for their element:
picks skill candidates from a live graph search → picks test candidates → gives each its references → «Сгенерировать тестовую страницу»
→ the prototype is kept in a protected section, its link in the tab → looks, picks the winner, pins it into the element's
`own-service-props.json`; from then on the element's agent builds every page by that choice. Pinned is the client's choice in the
element, in ONE common form for any skill: tokens first (the prototype's own copy of `DESIGN-CONFIG`, scoped to the prototype), the page
second; on pin the winner's tokens become the element's `design-config.json`, the rest (composition rules) goes to `DESIGN.md`.
The token pipeline stays (it is the flexible part); its schema widens (surfaces, shadows, motion, rhythm, weights), the `blocks` leftovers
go; no tool reads settings back from a finished page. The element's own `admin/design` stays for hand edits without a model.

DECIDED by the owner 2026-11-09, verbatim: «y , go to finish non stop first for fractera-item-starter , later for root.not more now».

## Substeps (revised — token-first; the earlier list below is superseded where it differs)

1. 711-1 live graph search of design skills, no list in code. 2. 711-2 the client's skill candidates of the element, in the node's
database. 3. 711-3 test candidates with their own references (images in storage, links). 4. 711-4 template: protected section
«Прототипы дизайна» — one route, data; each prototype its own token copy scoped to it; a guard that a prototype takes colours only from
tokens. 5. 711-5 «Сгенерировать тестовую страницу» in the core's tab — the element agent's design pass with that skill and references;
one at a time, the price before the press; status, link and screenshots in the tab. 6. 711-6 «Закрепить» — the winner's tokens become the
element's design document, DESIGN.md goes into the element, the passport records skill + version, references, date; the element's design
pass always starts by reading it; losers' code goes, their screenshots and grades stay. 7. 711-7 the schema widened, `blocks` leftovers
removed, the element's editor shows the new fields. 8. 711-8 the stand: a new element through the whole path, the owner's grade. Then the
same for the root starter.

**711-9 · The word to the architect and the collection** (the owner 2026-11-09, verbatim: «твоя презентация для архитектора как работает
дизайн какое в этом преимущество. Нужно буквально ему говорить … каждый раз когда вы видите в социальных сетях пример содержащий названия
красивого навыка дизайна просто вы можете сообщить через свой Telegram бот или прямо в терминал о том что вы нашли новый интересный навык
для дизайна. Он будет сохранён в коллекции ваших навыков и в любой момент … примените его как к новому элементу во время его создания и
последующего строительства так и при необходимости к редизайну уже существующих. Может быть это какой-то такой навык создашь?»). Fact:
the skill exists — `adopt-suggested-skill` keeps a named skill in the node's own collection (`data/node/skills/own/`, its own vector
index, searched first by `skills_find`) — NOT in the graph. So the Design tab searches what `skills_find` searches: the person's own
collection first, the node's base in the graph, the checked catalog. The tab opens with the presentation (how design works here, the
advantage, «found a beautiful design skill — tell your bot»); `adopt-suggested-skill` says that a kept design skill appears in every
element's Design tab — for a new element and for a redesign.

## Substeps (first draft, superseded)

**711-1 · The search.** A door of the core (architect, admin) asks the graph by meaning (`graph-query`, the same door as `skills_find`;
keywords taken from the query's own words — an empty keyword list is refused by the graph, measured 400) and returns every skill whose
pieces pass the graph's similarity threshold, ranked as the graph ranks them, each with its short description, source and licence. The
tab opens with a design query; the person can change the words and search again.
Proof: the tab lists what the graph holds now; a skill added to the graph (`npm run skills -- add <folder>`) appears on the next open
with no build; a non-design query does not return design skills first.

**711-2 · The project's skills.** «Добавить к проекту» / «Убрать» on each found skill; the chosen ones are kept in the node's database
(data element, table declared in the core's schema `lib/db/index.ts`, one row per element and skill). The tab shows the chosen ones on
top — the set the project chooses from later.
Proof: add two, reload — they stay; remove one — gone; another element's tab does not see them.

**711-3 · References.** Images uploaded through the existing `/api/media/upload` (the node's storage) and links, each with a short
caption; rows in the node's database for the element; remove.
Proof: upload an image and a link, reload — both stay, the image opens; remove — gone.

**711-4 · The tab itself.** «Строительство → Дизайн» of an element in the core renders the panel (search, chosen skills, references);
the link to the element's own token editor stays below. Words through translations (en, ru).
Proof: eyes screenshots of the tab with found, chosen and references.

**711-5 · To the element's agent.** When the design pass starts, the main agent hands the chosen skills to the element
(`npm run skills -- hand …`, the person's choice in the tab is the yes) and gives the task with the references.
Proof: the element's agent has the skills in its folder and names the references in its answer.

**711-6 · The stand.** A new element from the custom template v0.3.178 (empty body); its Design tab filled by the owner; the design
pass; the owner's grade.
