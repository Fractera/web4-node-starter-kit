# 627 — The skills catalog graph: marked once by Fractera, shipped ready with every node

Group «The node without OpenAI vectors»: 626 (local vectors) and 627 (this step).

## 1. Retelling and decisions

The owner, 2026-11-02, verbatim:
- «В этом инструменте я вижу огромное количество навыков … если мы его игнорируем то наши Fractera это просто пустой стартер если мы
  его используем то это очень умный стартер»
- «на раннем этапе я бы хотел использовать этот проект целиком как он есть но постепенно я бы хотел прочитать особенности каждого навыка
  его описание и создать из этого графа, этот граф должен переходить вместе с каждым новым сервером и быть доступен без необходимости
  каждому пользователю создавать этот граф ну то есть чтобы он приезжал уже размеченоно это позже а хотя бы хоть что-то сразу»
  (the «сразу» part is done in 625: the live catalog in `skills_find`)
- «Если мы создадим сейчас 10 000 навыков то нужно ли их пересчитывать заново? На самом деле я думал что мы для этого все и делаем чтобы
  они ничего пересчитывать не нужно было и чтобы все новые клиенты получили готовые навыки которые уже имеют разметку»
- «…и создаст граф на основе вектора для навыков»
- the plan: «Да, верно, записывай оба шага».

Retold: Fractera reads and marks the popular skills of skills.sh once, builds a graph of the marks with the node's own model (626), and
every node receives that graph ready — nothing is marked and no vector is counted on a person's computer. `skills_find` and the deep
memory read it with no internet.

```
AT FRACTERA (once, then by the owner's command)
  skills.sh ──► SKILL.md, licence, stars (GitHub) ──► Claude Haiku marks each skill → a card
            ──► cards → graph space «skills-catalog» (LightRAG + embeddings, MiniLM-L12)
            ──► the space packed with its sha256 and model → a GitHub release of the core
ON A NODE (install and update; counts nothing)
  download the package ──► check sha256 and model ──► the graph takes the space
  skills_find: the node's base + catalog cards + live skills.sh only for what the cards lack
```

I assume that:
- a card holds our own words and the skill's metadata, never the skill's text — so it ships with every node whatever the skill's
  licence; the skill itself is installed into an element only after the person's yes (as in 625), from Fractera's store of checked
  copies when its licence allows one (see «Decisions after pilot run 1» below);
- the marking model runs with no tools (it reads, it cannot act); a skill marked risky or «not for the node» is never proposed;
- the cards live in the core repository (small, readable, reviewed in diffs); the prebuilt space is a release asset (large, derived);
- the update is run by the owner (`npm run catalog -- update`), never by a timer.

## 2. What is reused
- 625: `lib/agent-kit/skills/catalog.mjs` (the live CLI, relevance order), `skills_find` (`lib/agent-kit/skills/mcp.mjs`),
  `npm run skills -- market`.
- 626: the element `embeddings` — the same model at Fractera and on every node, which is what lets the vectors travel ready.
- The graph element: spaces, `graph-insert` with ready entities, relationships and chunks, `file_path` marks and origin notices (590-1),
  the threshold per query (598-2).
- The skills base: `lib/agent-kit/skills/to-graph.mjs` (a skill as entities and links), `lib/agent-kit/skills/base.mjs` (manifest,
  licence check); the memory's solution search (`lib/memory/solution-search.mjs`, 598-3).
- The leaderboard taken on 2026-11-02 (186 rows, ranks up to 283) — the pilot's input.

## 3. Known limits — what must not break
- skills.sh: its API answers 401 without a Vercel OIDC token; `curl` of the site gets a bot-check stub — never circumvented; the CLI
  `npx skills find` answers.
- Foreign skills go into the project only, never globally, with `SOURCE.md` and our gatekeeper skill (CLAUDE.md) — a card installs nothing.
- «A claim about a foreign service — only from the primary source»: installs, licence, stars are read from skills.sh and GitHub at
  marking time and carry that date.
- «Your cost does not grow with the node»: the marking is Fractera's cost, once per update; a node only downloads.
- GitHub: a repository file is limited to 100 MB — the space travels as a release asset.
- Marking through `claude -p` spends the owner's subscription limits.

## 4. Observable results
- A fresh node, with no internet after its install, answers «хочу постить в соцсети и блоги» with catalog cards: what the skill does,
  the verdict for Fractera, licence, installs, link.
- `skills_find` never proposes a card marked risky or «not for the node».
- The package's manifest names `paraphrase-multilingual-MiniLM-L12-v2`, 384, the count and the sha256; a node with another model refuses
  it by name.

## 5–6. Substeps, order, address
| # | Result (one thing to show) | Address | Rests on |
|---|---|---|---|
| 627-1 | pilot: 100 cards; cost and time per skill; 10 cards read by the owner | core: `scripts/catalog/`, `lib/agent-kit/skills/catalog/cards.jsonl` | — (alongside 626) |
| 627-2 | the space «skills-catalog» built from the cards and packed; the catalog threshold measured | core + a GitHub release of the core | 626, 627-1 |
| 627-3 | a node receives the space ready: a graph door and the install/update | `fractera-graph-lightrag-starter` + core | 627-2 |
| 627-4 | readers: `skills_find` and the deep memory | core + `fractera-memory-starter` | 627-3 |
| 627-5 | census and the full run — after the owner's yes with the pilot's numbers | core + a release | 627-4 |
| 627-6 | update: only new and changed skills marked again | core | 627-5 |
| 627-7 | the instruction, the README and the agents' memory text name the catalog, in the instruction's own style; resealed | core | 627-4 |

The owner, 2026-11-02, on the instruction: «по итогу всей этой работы тебе придётся также переписать главную инструкцию? Ну или скажем
так аккуратно дописать в том же самом стиле?» — 626-8 carries the lines about vectors, 627-7 the lines about the skills search.

## 7. Substeps
`627-1.md` … `627-7.md` in this folder.

## 8. Acceptance of the plan
Stages 1–7 present; every substep names what is built, what counts as done, two proofs from different planes with a negative control
named in advance, what it rests on and what is not in it; 7 substeps.

## 9. The owner's approval
«Да, верно, записывай оба шага» (2026-11-02), given on the outline of substeps 627-1 … 627-6 in the conversation; 627-7 was added at
his reminder about the instruction; the written plan is shown to him before the first line of code. The full run (627-5) needs its own
yes with the pilot's numbers.

## Decisions after pilot run 1 (2026-11-02) — they change 627-2 … 627-4

The owner, verbatim: «можем ли быть уверенным мы что оставшиеся навыки продолжит существовать там же в GitHub репозитории? А ещё
другая проблема, а вообще GitHub даст нам такой объем данных или мы попадём в блокировку?»; «мы должны быть уверены на 100% что навык
не имеет скрытых скриптов, и не был подмен после того как модамо оценку а это значит что хранить навыки мы можем только внутри
объектного хранилища нашего проекта, только при условии что лицензии это позволяет, при этом связывая это хранение с графом, а также
ссылки на звезды». In the choice window: storage — «У Fractera + по требованию (Рекомендую)»; scripts — «Только с отдельным «да»
(Рекомендую)»; the living «curiosity first» answer — «Внести сейчас (Рекомендую)» (done: core `72ae8f0`, sealed `d8cf7f94803c`).

What it changes:
- **Storage.** Fractera keeps ONE store of the checked skills — whole folders, only those whose licence allows it — linked from the
  cards (fingerprint, git blob id, stars, installs). A node keeps the cards and the graph only (~80 MB for 5,000); a skill arrives from
  Fractera's store after the person's yes and is installed only if its fingerprint matches the card; if the store does not answer, the
  original on GitHub is taken — again only with the same fingerprint (no single point of failure, no substitution). A skill whose
  licence does not allow a copy stays a card and a link.
- **Scripts.** The marker reads a skill's scripts; the card says how many and which; a skill with scripts is never installed silently —
  the agent says so and waits for a separate yes.
- **What cannot be promised.** That the installed copy is exactly the checked one — yes, by its fingerprint. That a script hides no
  harm — no reader, a person or a model, can promise that at 100 %; hence the separate yes.
- **Size and time for 5,000 skills (from run 1):** ~1 GB of folders in Fractera's store (~0.5–0.7 GB packed), ~80 MB of graph per node;
  fetching by shallow clones 1.5–4 h within GitHub's limits; marking with scripts 2–3 h, ~$7–10 at the API price (the subscription's
  limits, not money).

## Not in this step
Skills from sources that are not GitHub (for example `open.feishu.cn`, `uizze.sh`); reference files beyond `SKILL.md`; an automatic
schedule; installing skills (the person's yes, 625).
