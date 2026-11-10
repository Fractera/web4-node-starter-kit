# 716 — Blocks and Design are no longer native elements (closed 2026-11-10)

The owner 2026-11-10 ~11:35, verbatim: «Приоритет твоей работы проверить чтобы нигде не было упоминаний о том что существуют блоки и дизайн
как нативные элементы их не должно существовать как нативные элементы и не должно быть обращение к ним. Поэтому сначала убери их, проверь
что все продолжает работать без них а затем опиши работу внутри нативных и кастомных элементов речь о инструкции и навыках с точки зрения
нашей новой архитектуры». An autonomous run; the four elements with their own work — «обсудим это позже» (14:25).

## Commits
- Core: `f640b6d5` (716-2 removal), `f0a97ef4` (instruction resealed `2f32dfdadddf`, skills), `02bc0626` (pins), `c471b794`, `0e5b8a56`,
  `58a862fb` (retired natives on every node), `333bbad6` (shell kit unchanged), `f1043d2e` (last mentions). Node build `b7f4f231`.
- Templates: custom v0.3.185 (`6120c20`), native v0.1.59 (`5ea93df`), root v3.0.44; natives auth v2.4.32, config v1.2.41, data v2.2.25,
  embeddings v0.1.26, memory v2.2.45, cache v0.1.38, storage v1.1.45, stripe v1.3.36, vectors v1.2.27, graph v1.2.26.

## What was built
- Retirement: `lib/web4-items/retired-natives.cjs`; the installer drops a retired entry and runs `scripts/element-retire.mjs` (process,
  watcher, page copy, data and folder into `WEB4-ITEMS/.trash/`); the update's merge drops a native the fork no longer lists;
  `check:native-sections` skips a retired one.
- The core: its sections `architect/design|blocks`, `lib/design-follow.ts`, `design-seed`, `blocks-usage` gone; links are CONFIG only;
  `/api/settings/changed` is the plain redraw signal; the native zone of the menu ends with its last built-in element.
- Every element: no follow of a Design element, no `DESIGN_SERVICE_URL`, no `@fractera` registry, no `npm run blocks`; `npm run
  design-skill` reads only the passport; the natives' design pass rewritten (it is the gate of impeccable and design-taste-frontend;
  `use-blocks`, `custom-design` removed); custom and root editors without a design link.
- Instruction and skills: CLAUDE.md §3, §5, §6, §7, §8 resealed by the owner's word; `blocks-of-the-node`, `handle-block-request`,
  `extract-design-system`, the core copy of `use-design` removed; `design-and-settings-of-elements` takes the page and section rule;
  `review-page` reviews against the approved design (verdicts `data/node/page-verdicts.jsonl`).

## Proofs
- Plane 1: every guard and prebuild green in the core, the three templates and the ten natives; tsc 0; the merge rule on a mock; the
  retirement in a sandbox with a stub pm2 (and its refusal of a listed id).
- Plane 2: the node update of 12:20 — «===ELEMENT_RETIRE_OK=== design, blocks», pm2 and the registry without them, every running element
  /health 200; eyes on the passport, the native zone of the menu, CONFIG, an element's Design tab — console clean; the sweep over all
  repositories — zero living mentions (history notes and the retired list itself only).

## Lessons (expensive)
- The first update after a release runs the PREVIOUS `node-update.mjs` (loaded before its own merge): a change of the merge must also be
  done by a fresh process of the new code — the installer.
- A shell-kit change cannot ship while a site carries its own commits: `check:shell-kits` compares with the installed folder. Two rollbacks.

## Debts named
- The main site, «Клипы», the vector store and the graph keep their own builds; their merges of the 716 diffs were cut by the weekly limit
  (12:24) — the owner: «обсудим это позже». Their old code calls nothing: the elements are gone.
- The cold test of a fresh element agent moves into 717 (the stand «Глина и огонь» was deleted by the owner).
- The natives keep their admin «Blocks» page and block cards; custom has none — to unify in 717.
- An own domain's tunnel route and DNS of a retired native are named by the script, not removed.
