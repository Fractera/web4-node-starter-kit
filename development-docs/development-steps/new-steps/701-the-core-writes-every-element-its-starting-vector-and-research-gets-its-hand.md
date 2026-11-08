# 701 — The core writes every element its starting vector at birth; research gets a hand of its own

**State: PROPOSED 2026-11-08 ~21:40 WET, not agreed.** The owner, verbatim (excerpts of one message): «та часть которая записывается
самой моделью Orchestrator для элементов … ты должен дописать в инструкцию агенту элемента послание которые создаст базовое понимание
того что он должен делать. Например как он должен создавать маршруты где будет находиться область публичного взаимодействия с страницы
элемента где будут находиться внутренние страницы какие они будут нести нагрузки и как вообще строить этот проект … внести изменения в
главную инструкцию каждого элемента где описать какую роль несёт в себе это дополнительная часть инструкции … это область инструкции
открыта для редактирования … стартовый вектор»; «own-service-props.json … кто у нас создает … он должен существовать сразу как только
элемент рождён проверь что это работает»; the case «проведи исследования и скажи каким именно образом работает этот проект какие задачи
решает и как можно с ним интегрироваться?» → «ты предлагаешь пользователю создать отдельный элемент который будет посвящен подобным
исследованием … явно описать в чем преимущество такого подхода по сравнению с стандартным интерфейсом например Claude.ai … Fractera это
тюнинг ателье Claude Code Agent … 1000 элементов по 1 000 000 токенов … каждому исследованию будет соответствовать определённое публичное
страницей и определённый дашборд»; «как нам сделать так чтобы при появлении подобных запросов от пользователей твой ответ был более-менее
таким как я его описал?».

## Facts (2026-11-08, read in code)
- An element's CLAUDE.md: §1–10 sealed (template release, `check:instruction` in its prebuild), §11 «This element» its own — born
  «(Nothing yet …)», carried over every release by `ownOf()` in `lib/instructions/element/build.mjs` — §12 Evolution. No person's
  block file in elements (the core has `data/main-agent/CLAUDE.user.md`).
- The passport `OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json` comes with the template; `scripts/item-birth.mjs` step 4 writes `id`, `name`
  (`--name`) and a preliminary `shortDescription` (`--describe`) before the first commit; no passport — `===BIRTH_FAILED===`. Role, area,
  grows — the core's map (`data/node/roles.json`, `areas.json`), the element sees the role in `npm run passport -- me`; the task — the
  intake. 682's birth part is still «live at the next occasion» (NOW-45).
- ✗ 2026-11-07: five of nine new elements asked the core for their own role (the wake text of `create` patched by 682) — the wake text
  lives one session; after it only the passport (≤ 600 characters) and the intake remain; the shape of a multi-element solution lives
  only in the core.
- How it works 7.1 already says the scale: every element its own window up to a million tokens, a project of a billion tokens in total.
- Claude.ai (Anthropic's pages, read 2026-11-08): Research — agentic searches with citations (anthropic.com/news/research, 2025-04-15);
  Integrations — remote MCP connectors, research up to 45 minutes (anthropic.com/news/integrations, 2025-05-01). «It cannot call
  third-party tools» is false; the pitch rests on what the node has, not on Claude.ai's weakness. Its schedules — not checked yet.
- The shaping path holds no case (673, guard `check:shape-examples`, FIELD_SKILLS content-factory, own-agents, integrator): the owner's
  research case goes to the exam `development-docs/exams/shape-of-a-need.md`, the facts to a field skill.

## Substeps (draft)
| Substep | Result | Proof |
|---|---|---|
| 701-1 | Element instruction (sealed): §11 has two parts — «From the core» (the starting vector written at birth: the whole goal and this element's part, role, area, neighbours in that goal, its public face, its inner pages, its loads and data, the first step, what is not its) and «The laws of this element»; one sealed line says what «From the core» is, that it yields to §1–10 and that its agent keeps it true with its person in the build process | `instruction:element` renders 15 templates; `ownOf` carries both parts |
| 701-2 | `npm run create … --vector-file <file>` (required with `--role`); the birth writes it into §11 «From the core» before the first commit, next to the passport; `create` prints `passport:` and `vector:` read back from the element | a birth on the node: card + the element's first answer names its vector |
| 701-3 | `create-element`: the form of the vector (headings, no case), ≤ 30 lines (it is loaded every session); existing elements get theirs by `npm run task` from their own agent | root and s8y6x carry it |
| 701-4 | Field skill `research` (facts, no case; added to FIELD_SKILLS): what a research needs (primary sources, site rules, test accounts, a live probe), what a node gives it that a chat does not (checked, dated), its price, how the work runs in a research hand (a record per research: question, sources, tests, verdict, re-check date; a dashboard; a public page only by the person's yes; an i2i door «what do we know about X»); `study-for-element` and `create-element` point to it | `check:shape-examples` green |
| 701-5 | Soul «A thousand hands» — one sentence of the measure (a window per hand, a billion tokens per project, Fractera a tuning atelier of Claude Code); CLAUDE.md §4 one line «A research …», §8 names `research`; both seals — after the owner's word on the wording | `check:instruction`, soul seal |
| 701-6 | The exam: the owner's research case into `exams/shape-of-a-need.md`; after the node update a cold exam in a fresh session | Pass: the referent, find, the fork with the honest one-off branch, the pitch from checked facts, the price, one question, nothing born without a yes |
| 701-7 | Live, after the person's yes: the research element born — proves 682's passport at birth and 701-2 in one birth | card, its first quiz question names its vector |
