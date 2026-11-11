# 722 — the architect's menu at a thousand elements: state dots, pages of 12, «Найти», «ИИ» — summary (closed for the core; the header in the elements goes to 727)

**Commits (core `Fractera/web4-node-starter-kit`):** `921947b1` plan (with 721) · `a5f6e97b` 722-1 · `34c26def` 722-2 · `11724bb9` 722-3 ·
`f68b47d5` `68f81b9c` `ea35bdbc` 722-4 · `bfea56cd` 722-6 · `9f44b989` 722-7 · `e39b9c03` 722-8 · `400da186` 722-9. Live on the owner's
node since the update `a4b1b048` (core started 2026-11-11 18:51:37Z).
The plan, deleted in this commit: `git show <this commit>^:development-docs/development-steps/new-steps/722/722-main.md` — it keeps the
owner's words verbatim, the measures and every substep's own record.

## The owner's words (2026-11-11)

«…если мы говорим о том что у нас есть 1000 элементов … нужно показывать … текущее состояние спит или активная? … максимально мгновенно»;
pages of 12 with a skeleton; two searches — «Найти» and «ИИ»; «только активные» for the architect; for everyone else «последнюю Билл
версию но абсолютно статически … с выключенным JavaScript»; «да, активный — процесс работает». After 722-9: the search and the
checkbox only in the header; red for an element that is off; ~19:10 «жёлтый is ok» (asleep stays amber). ~19:20, on «722 can not work
without tools strategy, no?» — my answer: the core's half works now, the header inside the elements cannot without 727 → variant A
«close 722 for the core, the elements' header to 727» — «ok».

## What was done

- **722-1** `lib/web4-items/menu-state.cjs`: one read of the registry and the drafts → running / asleep (`off.byRule`) / off / draft;
  names only for the portion shown — 12 of 1000 synthetic elements in 4 ms, no process and no model asked.
- **722-2** the door `GET /api/architect/menu/elements` (architect only); the left menu draws the first 12 custom elements, the rest by
  twelve with a skeleton; a state dot on every row; without JavaScript a link to all projects.
- **722-3** «Найти» — a match in the name through the door. **722-4** «ИИ» — no key leads to the key page; a key opens the window with
  voice; the OpenAI model picks from the 30 nearest by the node's vectors, the vectors alone on no key or an error; the window says who
  picked. **722-6** `npm run eyes -- <url> --no-js`. **722-7** the field's own row in the narrow menu; one model retry within 12 s.
- **722-8** the AI window rebuilt from ready parts (`AppDialog`, `VoiceControl variant="textarea"`, `Spinner`, `EmptyState`), the row
  `components/architect/element-row.tsx` shared by the menu, «Найти» and «ИИ».
- **722-9** the left menu cleaned: no search, no checkbox (the header keeps the search); dots for the built-in natives too (`allStates`);
  off red, asleep amber, a draft a hollow ring.

## Moved out

- **722-5** (the static menu for visitors, maybe millions) → step **723** (the owner: «да, 723 отдельно»), not built.
- The header's dropdown with the dots and «Только работающие», and the same menu inside every element → step **727** (the header as one
  tool of the core every element imports): every element carries its own copy of the shell, the templates an older one — fixing a
  thousand copies is the thing 727 removes. 727 builds on 722's parts: `menu-state.cjs`, the menu door, `element-row.tsx`, the AI door.

## Proofs

PROOF 1 — plane the data (the registry against the reader, 2026-11-11 ~19:50Z)
  `allStates()`: auth, data, storage, vectors, embeddings, config, graph, memory, root, s8y6x — running; cache, stripe — off (both
  `off.byDefault` in the registry).
PROOF 2 — plane the eye (`npm run eyes`, the owner's node, light; screenshots in the node's `logs/eyes/`)
  `2026-11-11T19-50-50-013Z.png` natives open with «Память» open: green АВТОРИЗАЦИЯ, ДАННЫЕ, ХРАНИЛИЩЕ, ВЕКТОРЫ, EMBEDDINGS, ГРАФ,
  ГЛУБОКАЯ ПАМЯТЬ, CONFIG; red БЫСТРОЕ ХРАНИЛИЩЕ and ПЛАТЕЖИ STRIPE — exactly the registry; «Память» is a group, no dot (right).
  `…19-51-14-432Z.png` customs: ГЛАВНЫЙ САЙТ and КЛИП green; no search and no checkbox in the left menu.
  `…19-51-38-666Z.png` compact: the dots on the custom rows. No console errors on any of them.
PROOF 3 — plane the eye, dark (the visitor's choice `fractera-theme=dark` set as the cookie; a scratch Playwright script, 1440 and 390)
  The AI window empty / searching / results: `html.dark` true, no console errors, nothing covered; the owner's words «есть у нас что-то,
  что помогает создавать клипы?» → «Клип» (совпало название), «Хранилище»; the line «Подобрано векторами узла — модель не ответила».
  Negative control: without the cookie (`npm run eyes -- --dark`, earlier today) the page stays light — see the finding below.
Earlier live proofs (722-2…722-4, JS off and on, 15 temporary drafts) — in the plan's record «Live on the owner's node».

## Findings, not fixed here

- `npm run eyes -- --dark` emulates only the SYSTEM theme; the pages follow the visitor's choice, else
  `NEXT_PUBLIC_DEFAULT_THEME ?? "light"` (`components/shell/shell-init.tsx`) — so `--dark` never shows a dark page. The tool should set
  the `fractera-theme` cookie. A small fix of `scripts/eyes.mjs`; waits for the owner.
- The model did not answer the AI search again (OpenAI 429 seen earlier the same day) — the fallback works; who spends the key — 726.
- «Хранилище»'s description comes in English: the native passport's `shortDescription` has no Russian — a texts pass of the natives.

## Mistakes

- 722-4 was first built by hand beside ready parts (VoiceTextarea, the chat tool) — the register `reports/errors-2026-11-11-…`, fixed in
  722-8; the rule that prevents it is step 725.
- «Dark is checked» was believed from a flag of the tool; the tool never reached the theme. A proof names how the state was set.

## Evolution of skills

`use-browser` should say: a dark page is set by the cookie `fractera-theme=dark`, not by `--dark` — after the eyes fix, with the owner.
