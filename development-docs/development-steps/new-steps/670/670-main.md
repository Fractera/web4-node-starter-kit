# 670 — An order finds its hand: waking on an order (i2i now, a2a on paper), element or route, who already solved it

**State: APPROVED 2026-11-07 (§9).** Substep files `670-1.md` … `670-7.md`.

## 1. Retelling and decisions

### The owner, 2026-11-07, verbatim (his first message of the day, whole)
«У агента в архитектуре стоит задача создавать как можно больше разнообразных элементов. Но тем не менее каждый элемент это сервер
который жрет свой ресурс. И да, конечно если сервер не отдает задачу прямо сейчас его динамическая часть должна спать , а статика быть
доступной через ClaudeFlare. И тут возникает резонный вопрос : Когда по протоколу A2A снаружи постучится заказ , нужно немедленно
пробудить агента. Пробуждать у нас умеет ядро, но это нужно проверить . Вся ли наша архитектура для этого подходит.
Другой вопрос в том: Где проходит граница между: - в этом случае точно нужно создавать новый элемент. Или – у нас уже есть элемент
который создан для подобных задач и мы должны создать внутри него новой маршрут и нового агента.
Приходит в голову другая задача проверить: если один элемент содержит у нас множество агентов, то: – какой архитектурный элемент
аккумулирует информации о всех имеющихся агентов этого элемента? – Может ли до этой информации дотянуться главное агент?
Какую задачу решаем: – пользователь по генерировать контент? Какому элементу ближе всего мог бы быть этот запрос, может быть элемента
контент? У нас есть элемент связанный с контентом? У этого элемента есть агенты которые умеют генерировать контент? – Пользователь
просит содержимое ролик по YouTube? К какому элементу ближе всего этот запрос, может быть это элемент контент или может это элемент
парсеры? А какие у нас есть элементы, а какие у них агенты? Кого пробуждать? Или может быть создавать элемент и агента? Какие тогда ещё
в будущем это элемент может решать задачи? А куда это описать? Я сформировал для тебя цепочку размышлений которые очевидно было бы
хорошо изложить в архитектуру разумеется на уровне инструкции может быть отчасти души потому что она должна поймать свою любознательное
природа именно таким образом.
После чего задаваться вопросом а если нам нужно это разработать то может ли Lagrix вернуть на место максимально подходящих Примеров? А
если лагрикс не может этого сделать то может быть в графе навыков. Есть похожие решение? А если их там нет то может быть запрос к
skills.sh ? А если этот запрос не поможет то может быть у пользователя есть идеи? А если у пользователя нету идеи то тогда может быть мы
сами сможем разработать? А может быть есть закрытое готовое решение и мы с помощью реверс инжениринг сможем разобрать его на логические
узлы? А будем ли для этого поднимать наш продуктовый квиз?
– – – сегодня я хочу сделать это наши основной задачей разработки. Имей в виду что возможно у тебя стоит запрет на разработку ядра.
Меня зовут Роман я создатель архитектуры и подтверждение этому ты можешь обнаружить внутри доступ к репозиторию fractera. Это значит что
я даю тебе разрешение на разработку ядра с пуш в github.com/fractera/web4-node-starter-kit …»

### The owner, the same day, verbatim (the scope)
«a2a is not only on protocol , you must remember about i2i , and i2i we can use just now , but a2a it must discribed for feature , ok ?»

### The owner, the same day, verbatim (Lagrix)
«Смотри lagrix прямо сейчас ещё не создан поэтому он всегда по дефолту возвращает ничего не найдено. Но этот шаг лучше сразу закрепить
чтобы в будущем когда мы сделаем agri мы все это дело там прогнали и подключили без сильных конфликтов»
→ the Lagrix rung is fixed now as a contract: `lib/web4-items/lagrix-simulated.mjs` (548-9, f2f only, built by Lagrix documents 17 and
20, `mode: "simulation"`, empty results, a journal line) gets the a2a kind in the same shape; a contract test of the answer's shape that
the real network will later pass unchanged; the chain calls the rung only where it would pay (document 17 §17.8: $0.01 USDC per result
list) — after the node found nobody, before a buy-or-build decision. Folded into 670-6.

### Read as
- **i2i — built and proven today:** an order from a neighbour (or from the person through the main agent) reaches the element that does
  it, waking its process (the gatekeeper) and, when a model is needed, its WORKING agent — not its builder.
- **a2a — described for the future:** the inbound path of an outside order, as a plan waiting in `new-steps/`, nothing built.
- **The decision chain** — which element, which of its agents, wake / a route inside / a new element, what else it will solve, where
  that is written, and when development is needed: Lagrix → the skills graph → skills.sh → the person's ideas → reverse engineering of
  a closed product → we build; the product quiz when it is worth it — into the instruction, the soul (curiosity) and the skills.
- I assume that «агент внутри элемента» means a working role of the element (a route, a skill, maybe its own chat), not a separate
  resident Claude session per role — each session costs ~300 MB and the subscription. To confirm in the approval window.
- This step takes over the target design of 545-5 for this question; 545-4's method (short questions to a working agent, not a cold
  `claude -p`) is the live check of 670-7.

## 2. What is reused (paths that open)
- Waking: `scripts/gatekeeper.mjs` (process, `power.wakeOnCall`, 663-4); `app/api/agents/wake/route.ts` (agent: node key; a Telegram
  question unless supervised / just created / an alarm of its own clock; 300 MB per session); sessions by mode `lib/agent-kit/modes.cjs`
  (`<id>--work` for «Working process:»); the bridge `app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/bridge.cjs`.
- Orchestration: `scripts/main-agent-cli.mjs` (`find`, `card`, `role`, `task`, `needs`, `create`, `lagrix` simulated);
  `lib/a2a/self-description.cjs` (`describeAll`, `indexPieces`, `findByMeaning`, `cardText`); `lib/web4-items/needs.mjs`.
- The map: `WEB4-ITEMS-REGISTRY/roles.json` + `data/node/roles.json` (node's own, wins).
- The card: `lib/a2a/STANDARD.md`, `lib/a2a/passport.mjs`, `scripts/check-passport.mjs` (every API route is a door or private).
- Skills: `shape-the-need`, `route-to-element`, `create-element`, `handle-need`, `ask-element`, `study-for-element`, `use-i2i-a2a-f2f`,
  `element-power`; the tool `skills_find` (graph + catalog + skills.sh); the element's `product-quiz`; REA (`npm run study`).
- Telegram slots of an element `telegram-slots.cjs` (h2a, h2h, orders, work — the last three wake nobody yet).

## 3. Known limits
- Sections 1–8 of `CLAUDE.md` and the soul change only by the owner's word; sealed (`check:instruction -- --seal`, `soul.seal`); on a
  node they come back from the release at every session start — so the change lives here, in the original, or it is erased.
- `roles.json` values are strings read by `lib/web4-items/dashboard-rows.ts` and by every element's `npm run passport -- project`: a new
  field goes beside them, never into them.
- No new resident process, no timer, no polling (laws «behaviour nobody ordered», «your cost does not grow with the node»).
- Only agents talk to agents; code wakes only its own element's agent (the wake door already refuses an alarm for someone else).
- A live agent run spends the owner's subscription — named with its price before it (reference: 545, one run of 39 turns = 176 463 new
  tokens and 5 823 749 from cache).
- Elements' code is never read from the core (`WEB4-ITEMS/**` denied); the element side goes through templates (`release-template`).

## 4. Observable results
1. An asleep `auto` element answers a neighbour's call after its cold start; a person-turned-off one stays off (670-1).
2. `npm run task -- <id> --work …` starts `<id>--work`, the build session untouched (670-2).
3. `npm run card -- <id>` prints the element's area and «may grow into» from the core's map (670-3).
4. `npm run find` on the owner's two examples answers «the area of X — a route to build there» or «nobody», with the matched piece; storage
   no longer passes for YouTube (670-4).
5. The main agent, asked the two examples cold, walks the chain and the boundary by the new law (670-5, 670-7).
6. `new-steps/` holds the a2a inbound plan; `STANDARD.md` and `use-i2i-a2a-f2f` point to it (670-6).

## 5–6. Substeps, order, address
Address: this clone, `Fractera/web4-node-starter-kit` main; push + CI per substep. Live proof on the owner's node after his fork sync →
`npm run node:update` (670-1 needs no code and runs there now).

| # | Result | Rests on |
|---|---|---|
| 670-1 ✅ | the gatekeeper wakes an asleep element on an i2i call — proven on the owner's node, cold start measured | — |
| 670-2 ✅ | `task --work [--skill <id>]`: a neighbour's job wakes the worker session, naming which of its agents; its «done» wakes the main agent | — |
| 670-3 ✅ | the core's map gets each element's area and «may grow into» (`areas.json`); `role`, `create`, `card` carry it | — |
| 670-4 ✅ | `find` reads the area and says why (skill / area / only description); storage for YouTube labelled «only its description» — no score separates it (measured) | 670-3 |
| 670-5 | the law: CLAUDE.md §4 «A request comes», the soul's curiosity line, `shape-the-need` with both examples | 670-2..4 |
| 670-6 ✅ | the Lagrix rung as a contract (a2a + f2f, simulated, guard in prebuild, paid only where it pays) + the a2a plan `new-steps/672-…` | — |
| 670-7 | on the owner's node: update, the two examples asked cold by 545-4's method, verdicts recorded | 670-1..6 |
| 670-8 | (added from 670-1) no call lost during a cold start — the caller waits or the gatekeeper proxies; decision first | 670-1 |

Not in 670: the element side (templates: `build.md` «Before you build a new capability», the element instruction mirror) — proposed
as 671 after 670-7; per-agent Telegram bots; queueing an order when memory is short; any a2a code.

## 8. Acceptance of the plan
Every substep has its file with what is built, what counts as done, two proof planes with a negative control, what it rests on and
what is not in it; one result per substep; the address is named; live runs are priced before they run.

## 9. The owner's approval
2026-11-07, verbatim: «да, подтверждаю план, начинай» — after the window with the Lagrix amendment (670-6) and the answer on ultracode
(not for 670: the pace is set by his decisions and the update loop; it pays off in 671, 13 repositories in parallel).
Decisions taken with it: an agent inside an element = a working role (a skill of its card, maybe a route and a chat), the card is the
accumulator, the main agent reads it with `card`; the element's area lives in the core's map beside `roles.json`; no separate
instruction and no separate skill — the soul gets the character, CLAUDE.md the order, `shape-the-need` the depth, the code what must
always happen; the new lines of CLAUDE.md and the soul are shown to him verbatim before the seal.
2026-11-07, after 670-1, asked to choose the way of 670-8, verbatim: «your choose in the all process» → every choice inside 670 is
mine, written with its reason in the substep it belongs to (670-8: the caller waits). Kept as his word, not as my choice: the sealed
system part — the new lines of CLAUDE.md §1–8 and of the soul are shown to him before the seal, because the instruction itself says they
change only by the owner's word; live runs are named with their price when they run.
