# 679 — An element is never left waiting; an element's links to the project are the main agent's command and a question at birth

**State: APPROVED 2026-11-08** — the owner, verbatim: «Запускай в работу и обновляй ядро».

## The owner's words, verbatim (2026-11-08, after s8y6x asked the core to turn off its link to the shared Blocks)
«ты думаешь что я нахожусь с тобой в связи но это не так я был на связи с агентом элемента клип и он продолжает ждать твой ответ это
проблема если ты решил что у тебя нету компетенции решить эту задачу так ты значит должен прямо ему ответить потому что может быть
именно там сейчас находится архитектор … элемент тебя пробуждает а ты не можешь решить эту задачу ты должен ответить ему о том что задача
решиться не может и нужно вмешательство архитектора.»
«разработать необходимый скрипт инструмент … подобные задачи ты должен уметь решать самостоятельно во-первых. Во-вторых я не помню чтобы
при рождении элемента ты меня спросил связывать ли этот элемент с нашей архитектурой ядра или он должен родиться самостоятельным. Имеет
смысл пояснить плюсы и минусы … я бы предпочёл чтобы клип родился самостоятельно элементом»
«– элемент должен получать отказ если ты не собираешься завершать работу
– прежде элемента запрашивать самостоятельно ли это будет элемент или единой с ядром также задавать вопросы понимать ли пользователи чем
речь если нет комментирует.
– И прямо по этой задаче немедленно решить проблему чтобы у тебя была возможность по такой команде переводить блоки дизайн и прочее связи с
узлом в самостоятельно режим.»

## Measured
- 2026-11-08 ~00:25 UTC: the core answered s8y6x «NOT switched … the link was sent to the architect» — the link went only to the main
  agent's terminal, where the architect was not; `npm run look` said «never change the values yourself».
- The door exists since 324-7: `PATCH /api/architect/items/<id>/links` `{ kind: config|design|blocks, on }` (`element-links.ts`
  `setLink`). Done at once on the owner's word: s8y6x — config, design, blocks off (`{"ok":true,…}` ×3, `look`: «own»).
- `item-birth.mjs` takes `--look project|own`; `npm run create` never passed it — the node type chose, the person was never asked.

## State (2026-11-08, ~00:45 UTC)
679-1 … 679-3 coded (the commit after this line). Proven: `look s8y6x --linked blocks` → `{"blocks":true}`, `--own blocks` →
`{"blocks":false}` on the owner's running node through the core's door; `--own colour` and `look root --own` refused; the guards green.
OWED on the owner's node after the update: `npm run look -- s8y6x` from the node's own CLI; a `create --look own --blocks off` when the
next element is born.

## Substeps
| # | Result | Proof |
|---|---|---|
| 679-1 | `answer-element`: an element is never left waiting — what the core does it does and answers «done»; what it cannot, it answers the element at once «the core cannot — the architect must: <the exact action and link>», for the element to say in its own chat | `check:skill-headers`; the text read |
| 679-2 | `npm run look -- <id> --own [config,design,blocks]` / `--linked […]` — the main agent switches the links through the same door, on the person's word | live on the owner's node after the update: a temporary element… or s8y6x linked/own both ways |
| 679-3 | `npm run create -- --look own|project [--blocks off]`; `create-element` asks before birth: on its own or one with the project, the gains and costs in plain words, terms explained | `create` usage; the skill text |

## Not in it
Changing what «own» means at birth (CONFIG and Design off, Blocks on — 367) — `--blocks off` adds the third.
