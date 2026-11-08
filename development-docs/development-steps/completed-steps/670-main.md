# 670 — An order finds its hand: waking on an order (i2i now, a2a on paper), element or route, who already solved it (closed)

**The owner, 2026-11-07, verbatim (his first message of the day, whole — the plan is recoverable from git before this commit,
`new-steps/670/670-main.md`):** «У агента в архитектуре стоит задача создавать как можно больше разнообразных элементов. Но тем не менее
каждый элемент это сервер который жрет свой ресурс. … Когда по протоколу A2A снаружи постучится заказ , нужно немедленно пробудить
агента. … Где проходит граница между: - в этом случае точно нужно создавать новый элемент. Или – у нас уже есть элемент который создан
для подобных задач и мы должны создать внутри него новой маршрут и нового агента. … какой архитектурный элемент аккумулирует информации
о всех имеющихся агентов этого элемента? – Может ли до этой информации дотянуться главное агент? …». Approved 2026-11-07 (§9);
the owner: «your choose in the all process».

| Substep | What | Summary |
|---|---|---|
| 670-1 | The gatekeeper wakes an element asleep by the load rule on an i2i call — proven live (blocks 2.96 s) | `23dd7519` |
| 670-2 | A job wakes the element's worker and names which of its agents (a skill of its card); its «done» brings the report back | `8e0792be` |
| 670-3 | The core's map: every element's area and what it may grow into (`areas.json`, `role --area --grows`) | `b290443d` |
| 670-4 | `find` says why: «does it now / nearest by its area / matches only its description» | `41d6b796` |
| 670-5 | The law: the order of a request, the boundary of a new element, the curiosity of every agent (CLAUDE.md §4, the soul) | `466e0b3b` |
| 670-6 | The Lagrix rung as one contract; the outside (a2a) order on paper — plan 672 | `04abc27b` |
| 670-7 | On the owner's node: the update, the node-side proofs, the exam (673) — verdicts, one wrong expectation | the commit of `670-7.md` |
| 670-8 | No call lost during a cold start: the caller waits — decided; built in 671-3 | `7a8180e8` |
| 670-9 | The chain where the agent reads it: the end of `skills_find`'s answer, the fork | `6622c7f1` |

## The answers to the owner's questions, as built
- **An outside A2A order wakes the agent?** Inside the node — yes: the gatekeeper holds a sleeping element's port and wakes it on the
  first call (670-1); since 671-3 the caller waits through the cold start. From outside — on paper until Lagrix lives (plan 672).
- **New element or a route?** The order of §4 and `shape-the-need`: `find` with reasons, a route in the hand whose area covers the job,
  a new element only past a boundary of force 5 — since 671-1 a closed list in code (`create --boundary`), a rhythm or a platform never.
- **Who holds the agents of one element?** Its A2A card (skills and doors); the main agent reads it with `npm run card` and `find`, and
  hands a job to one of them with `task --work --skill`.
- **Who already solved it?** Lagrix (simulated, said so) → `skills_find` → skills.sh → the person's idea or analog → a product taken
  apart → we build; the product quiz when the variants differ — in the core (670-5, 670-9) and since 671-2 in every element's build order.

## Left
The YouTube retelling asked cold (the next exam); a2a from outside (plan 672, after Lagrix).
