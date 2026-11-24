# 852 — The product quiz is a tree, walked in breadth

Source: the main agent of the server fractera.ai (core e638fed7), forwarded by Roma 2026-11-24 (Telegram 1288–1295), kept as data in
`pre-steps/2026-11-24-*.md`. Roma 1296 (13:45 UTC), verbatim: «Строй план пожалуйста по реализации этих проблем и их решений и решай это
самостоятельно … Действуй пока не завершишь, только по окончании каждого отдельного решения предлагай сделать Git Push. И каждый раз
предоставляй чеклист какие были созданные планы какие уже реализованы и сделан Push дата время. Меня больше не беспокой … работай».
The owner's approval of the plan is that word; every substep keeps two proofs, one with a negative control.

## The requirement (pre-steps/2026-11-24-product-quiz.md — one document replacing the earlier ones)

A tree; level 1 = the modules, agreed first; breadth level by level, a new branch caught up; every turn ends with the whole tree numbered
(1, 1.1, 2.3.4…), each 2–4 words, marked answered / filled by the agent / open; depth 1–5 (default 3) with the volume and price said
before; the model's freedom F 0–100 % (default 75 %), money, ownership, publication and secrets always asked with a recommendation; a page
with the tree, depth, F and version; «Скачать результат» (PDF); team results uploaded and turned into proposed edits by number; every
approved version a git tag `quiz-v<N>`, rollback = a new version.

## Substeps

- **852-1 · The skill.** `product-quiz` of both templates (custom and native workshops) gets the tree, breadth, the turn's checklist,
  depth and F (asked once, kept in `quiz.json`), the always-asked four; released and rolled out (`release-template`). Proof: a fresh
  test element's quiz asks every level-1 branch before any level-2 one (negative: an answer in branch 1 raises no level-2 question while
  2…N are open); a money question at F 100 %.
- **852-2 · The page shows the tree.** The core's «Дизайн продукта → Продуктовый квиз» renders `quiz.json` as the numbered tree with marks,
  depth, F and version. Proof: eyes of the page for a test element; an empty quiz shows the empty state.
- **852-3 · The PDF prints on a server.** `GET /api/node/product-quiz/pdf` prints with the node's own headless browser (the one `npm run
  eyes` installs) when no Chrome is there; the PDF carries version and hash. Proof: `application/pdf` on the Mac with Chrome hidden
  (negative today: 503 «no Chrome»).
- **852-4 · Team results.** «Загрузить результаты команды» (a file and a comment) → `development-docs/product/feedback/<date>/` of the
  element + a node line to its agent, which proposes edits by number. Proof: upload → the line → a list of edits; a bad file refused.
- **852-5 · Versions.** An approved version is the element's commit tagged `quiz-v<N>`; the page lists versions; «вернуться к версии N»
  makes a new one. Proof: v2 tag; rollback to v1 makes v3 equal to v1.
