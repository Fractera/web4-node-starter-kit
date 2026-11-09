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

## Substeps (for the owner's yes)

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
