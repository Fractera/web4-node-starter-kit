# Task for the creator agent (Mac): the product quiz is still not visible from the bots on fractera.ai (Roma, 2026-11-25 17:56 UTC)

From the main agent of fractera.ai, core 39bc76fd. No keys or personal data. Nothing was changed on the server.

Roma: «было же требование что продуктовый квиз становится виден в ботах и в главном и нативный и в кастомный, но я все ещё не вижу».

## 1. An element with a quiz from before 852 has no tree, so the Pult lists nothing (main cause)

- `GET /api/node/product-quiz?item=f2f-marketplace` → `quiz.tree.length = 0`. The marketplace's quiz.json still has the older form
  (vision, actors, modules, stages, 13 decisions, 9 open questions). Its numbered tree lives only as text in `current-step.md` («The quiz
  tree … is kept below»).
- `lib/web4-items/product-quiz.ts` `quizGlance()` 379–381: `if (!quiz || quiz.tree.length === 0) return null` → the Pult's «Квиз»
  (852-8) leaves it out, and the quiz page (200) shows «дерево ещё не начато» (your 604c647).
- Taking the template (v0.1.83 brought `quiz-tree.mjs` and the breadth-first skill) does not move an existing tree into `quiz.json`.
  The offer text of `npm run template -- offer` does not ask for it either.
- Needed: a migration road. Either the offer of a release with 852-1 adds «move your existing tree into quiz.json `tree` (numbers and
  marks as they are), check with `npm run quiz:tree`», or the skill product-quiz says it on its first run over a tree-less quiz.json.
  On this server the marketplace's own agent can do it now; it is the element's data.

## 2. The quiz PDF still fails on the server

- `GET /api/node/product-quiz/pdf?item=f2f-marketplace` → **502** `{"ok":false,"error":"Chrome did not print the PDF"}` (measured
  2026-11-25 ~17:58 UTC). Before 852-3/4 it was 503 «no Chrome». So Chrome is found now but does not print. Roma's requirement: a PDF
  link in every quiz turn.

## 3. A native element's bot has no way to the quiz

- 853's native Mini App is three parts: token use, the site, the chat (`lib/node/tg-app/element-page.cjs`). It has no quiz entry. The
  requirement (`for-mac-product-quiz.md` §4–5) is the quiz page and the PDF link in every quiz turn, and 852-8 lists quizzes in the main
  bot's Pult only. Roma expects the quiz to be reachable from the native and custom bots too. Proposal (it fits the Mini App law of 848,
  «navigation to the project's pages»): one line «Квиз · N % · уровень L» with a link to `/<lang>/<address>/product-design/quiz` in the
  native Mini App, and the same in the custom template's `/tg`, when `quizGlance(id)` is not null.

## 4. Still open from before

- `GET /api/node/deploy` (status) has no keyed path, so `npm run deploy:self -- status` → 401 (`for-mac-deploy-self-status-401.md`).

## Proof

- After 1: the marketplace's quiz.json has a tree; `quizGlance` → `{nodes, filled, level, percent}`; the Pult's «Квиз» lists the
  marketplace with the link to its bot; its quiz page shows the numbered tree.
- After 2: the PDF door → 200 `application/pdf` on the server.
- After 3: the native Mini App of the marketplace and the custom `/tg` of «test» (z8asv) show the quiz line once a tree exists, and
  nothing without one.

—
No keys or personal data in this file.
