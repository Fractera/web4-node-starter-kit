# 735 — the tool lifecycle works for every element — the plan (2026-11-12, written to be executed by another session)

Rewritten whole after the owner's «check again with max model». The earlier versions of this file (a rollout of documents; then
«protocol first») were wrong in substance — they are in git (`c3d99279`, `03096ff1`). This file is a PLAN ONLY: nothing below is
built. The owner releases with Opus; every stage ends with a model-free proof, so a stage cannot be called done by reading code.

## The goal, in the owner's words (2026-11-12, verbatim)

«купу не справился с задачей которая заставляет нас активную переиспользовать инструменты в нашей архитектуре. Все что он создал потом
уже и опроверг поэтому я вызвал тебя. Но мне не хватит ресурсов оплатить твою работу полностью от начало до конца а вот план ты должен
сделать с фокусом на то что именно решится эта проблема:
– новый элементы рождаются бизнес инструментов. [без инструментов]
– Иногда когда приходит задача они получают инструменты и других элементов. А потом иногда они их улучшают под себя
– Если подходящее инструментов не существуют, то они их создают.
– Система работает чётко и эффективно»

Four points, each with its measure:
- **G1 born without tools** — a newborn's `_tools/` holds `.gitkeep` only.
- **G2 takes, sometimes improves** — it finds a tool of the core or a neighbour (`parts_find`), takes a copy (`tool:take`), and may make
  the copy its own and change it.
- **G3 creates** — nothing fits → it creates a tool with a complete card, and neighbours can find and take it.
- **G4 clear and efficient** — one search, one command per act, no dead ends; the whole cycle is proven by a script with no model.

## Where it stands — measured 2026-11-12 on the node (core `566cad15`), not read from code

| | newborn custom (template v0.3.200) | newborn native (template v0.1.67) | the 8 natives at their pins |
|---|---|---|---|
| G1 `_tools/` | `.gitkeep` ✓ | `.gitkeep` ✓ | 8 old copies `tool-*`, 2 doors, the voice control — a dead island |
| G2 find (`parts_find` over MCP) | own map + the node ✓ | own map + the node ✓ | ✗ answered as if it were the core (D1) |
| G2 take: «any» tools of the core takeable | **7 of 13** | **4 of 13**, and no key at all (D4) | 4 of 13, no key, no `tool:take` |
| G2 improve | by hand: the guard says «make it your own tool», no command | same | — |
| G3 create | by hand, the card's fields found by guard refusals | same | — |
| neighbours' tools | no element of this node has a map → the node index is empty; the neighbour path never ran on real data | | |

The 13 «any» tools: app-dialog, table-tools, tool-chat, tool-code-view, tool-fact-draft, tool-image-crop, tool-socials-ai,
tool-translations-dialog, tool-video-trim, tool-voice-input, voice-control, voice-field, voice-textarea.

### The defects, each reproduced

- **D1 the core's MCP `parts_find` answers an element without its own map as the core.** `lib/agent-kit/skills/mcp.mjs` `callParts`:
  `here = existsSync(cwd/lib/parts/PARTS.json) ? cwd : ROOT`, `node = here === ROOT ? [] : …`. Reproduced live from a copy of config's
  source: «Modal window … `components/dialog/app-dialog.client.tsx` — Yours — it is in this repository … Used by 37: _tools/block-task/…»
  and the core's sections. `npm run parts -- --as config` answers right («Lives in the core — … npm run tool:take»): the command and
  the MCP server diverge. Probe: `probes/mcp-ask.mjs <folder> "<query>"`.
- **D2 the voice tools cannot be taken by any element that has no `components/form/mic-icon`.** In the core `mic-icon` has its own card
  (composite, internal — `components/form/parts.json`), so it is neither in voice-control's body nor a tool of its recipe: it lands
  in `requires`, and the door refuses. Both templates deleted `mic-icon` in 733-6. Blocks voice-control, voice-field, voice-textarea,
  tool-fact-draft. Only `components/form/voice-control.client.tsx` imports it.
- **D3 the table cannot be taken by anyone:** table-tools `requires` `sections/table.i18n` — a dictionary of the core's section layer
  (15 importers in the core); no element has it.
- **D4 the native template declares no `ELEMENT_KEY`** (`.env.example`; positive control: the custom template has
  `# kind: element-key` / `ELEMENT_KEY=`). The installer writes the key only when declared (`scripts/services-install.mjs`
  `parseExample`, line ~325, 919). `scripts/tool-take.mjs` stops: «TAKE_FAILED: no ELEMENT_KEY here». A newborn native cannot take
  anything. None of the 8 natives declares it.
- **D5 natives lack three small libraries** that the OpenAI tools require: `lib/openai-error.cjs`, `lib/usage-ledger.cjs`,
  `lib/i18n/openai-error.i18n` (the custom template has them). Blocks tool-voice-input, tool-translations-dialog, tool-socials-ai
  and, with D2, the voice fields and the fact draft.
- **D6 «improve» and «create» are manual.** A newborn has `tool:take`, `build:tools-map`, `build:parts-map`, `check:*` — no command to
  make a taken copy its own and none to create a tool. In a scratch element the card needed three rounds of guard refusals
  (`version`, `scope`, then `parts`).
- **D7 taking a tool the element already has uncarded is a refusal that reads like an error:** «components/dialog/app-dialog.client.tsx
  is already here and is not «app-dialog» — the element decides what it is first» — both templates carry the one modal as their own
  component.
- **D8 the old natives are not newborns.** Their `_tools/` holds 8 old copies; measured with `probes/importers.mjs` in all 8: no page
  imports any of them — tool-voice-input is imported only by two other tools, its own door and the voice control; the voice control
  only by the fact draft; tool-socials-ai only by its own door. With the island removed (the template's own list of 733-6, `b508490`)
  the type check of config gives the same single error as untouched config (`previews.generated`, a file made at prebuild), the parts
  map builds with no problem, `check:parts-map` is green.
- **Not a defect of the protocol, a correction of the record:** root on the node runs v3.0.39 + its own work (`861f8d1`), vectors
  v1.2.26 + own, graph v1.2.25 + own, Клип v0.3.171 + own (`npm run node:readiness`; the update log: «своя работа поверх … — на тег
  не перевожу»). Earlier records that called root «v3.0.55 live» were wrong. These four are not touched by this plan until stage E.

- **D9 an element's paid calls never reach the node's ledger.** `lib/usage-ledger.cjs` writes `data/node/usage/<day>.jsonl` under
  `process.cwd()`; an element runs as a Next standalone server whose `server.js` does `process.chdir(__dirname)` (seen in config's built
  `.next/standalone/server.js`) — its lines land in the build folder, wiped by every rebuild; `npm run money` (`scripts/money.mjs`
  `readDay()`) reads only the core's folder. The core's ledger today holds only the core's own calls (2026-11-11: i18n/translate
  gpt-5-mini 1, voice-input 1; 2026-11-12: voice-input 1). Measured by the build artifact; no element has written a ledger line yet.
- **D10 the natives' dead island keeps a live, unledgered OpenAI door:** `app/api/tools/tool-voice-input/route.ts` (staff roles) →
  the old `transcribe.ts` with the deprecated `gpt-4o-transcribe` and no ledger. Removing the island (C) closes it.

## Rules for the executor (each was paid for in 733)

1. A stage is closed only by its model-free proof printed in full, with the number it names, and by the negative control turning it
   red. A build log, a green chain or a read of the code is not a proof of the protocol.
2. Before a substep: run its probe and write the number into this file. After it: the same probe, the new number.
3. An element's version is what `npm run node:readiness` prints, never the registry's pin.
4. Never read or edit `WEB4-ITEMS/**`. Natives are changed in their sources `~/fractera-dev/fractera-<x>-starter`, one release each;
   elements with their own work — through their agents only (stage E).
5. The whole chain of a repository before its push; the warning before a node update ends a turn; one node update per stage.
6. No tool is exchanged between nodes or through Lagrix (the owner, 2026-11-12). Panel tools (`scope: "panel"`) never go to elements.

## Stage A — the core: every «any» tool is takeable, and the search tells the truth (one session, no release of an element)

- **A1 the measure first: `scripts/tools-protocol.test.mjs` in the core's prebuild.** For each template whose clone is found
  (`data/workshop/fractera-<kind>-item-starter`, else `../fractera-<kind>-item-starter`) it unpacks the pinned tag
  (`git archive <pin> | tar -x`) into a temp folder and runs `planTake` for every «any» tool of the core (`lib/parts/take.mjs`,
  `source = core`, `from = "core"`). Green only when every tool is `ok` or is answered «your own stands in» (A4). It prints
  `===TOOLS_PROTOCOL_OK=== custom 13/13, native 13/13` or the list of refusals; no clone → `===TOOLS_PROTOCOL_SKIPPED===` and exit 0 (a
  person's node has no workshop). `npm run template -- pin` runs it too: a template whose newborn cannot take a tool is not pinned.
  Seed: `probes/plan-all.mjs`. **Today it must print custom 7/13, native 4/13 — write that run down before fixing anything.**
- **A2 D2:** `mic-icon` becomes part of voice-control's body — remove its card from `components/form/parts.json` (the same-folder rule
  of `parts-map.mjs` then pulls an uncarded import into the body) or name it in voice-control's `also`. voice-control's version rises,
  its recipes move (`build:parts-map` names them).
- **A3 D3:** the table's words move next to the tool: `components/table/table-tools.i18n.ts` (type `TableUi` and `tableUi`), imported
  by the tool from its own folder; `sections/table.i18n.ts` stays as a re-export, so its 15 importers do not change. table-tools'
  version rises.
- **A4 D7:** in `planTake`, a root tool whose files are all present in the receiver and are not a taken copy answers `ok: true`,
  nothing written, «<id> — your own files stand in (…)» — the same words a recipe part already gets. A partial presence stays a
  refusal.
- **A5 D1:** `callParts` — the session's folder is the asker whenever it is not the core's root:
  `const cwd = process.cwd(); const core = resolve(cwd) === resolve(ROOT); findParts(cwd, { …, node: core ? [] : nodeTools(ROOT, cwd) })`
  (`findParts` already answers for a folder with no map — `npm run parts -- --as config` proves it). Test in
  `scripts/parts-find.test.mjs` or beside it: the MCP server started in a folder with no `lib/parts` answers «Lives in the core» for
  «modal window» and never «Yours»; the negative control — the old line — fails it. Seed: `probes/mcp-ask.mjs`.
- **Proof of A:** `===TOOLS_PROTOCOL_OK=== custom 13/13` (native stays red until B1 — its line names only D5 and nothing else); the
  MCP test green; the core's whole chain; node update; `probes/mcp-ask.mjs` against the live node from a mapless folder.

## Stage B — the templates: a newborn of either kind runs the whole cycle with one command per act (one session, two releases)

- **B1 native template v0.1.68:** `ELEMENT_KEY` declared in `.env.example` with `# kind: element-key` (the custom template's block,
  its last sentence about DATA_SECRET dropped — a native keeps the data key); the three libraries of D5 from the custom template
  (they are copies of the core's kit — the guard that keeps the custom's copies identical gets the native's too). Proof:
  `===TOOLS_PROTOCOL_OK=== custom 13/13, native 13/13`.
- **B1b D9 — the ledger of every element reaches the node:** `lib/usage-ledger.cjs` writes under `SERVICE_DATA_DIR` when it is set
  (`<SERVICE_DATA_DIR>/usage/<day>.jsonl` — the installer gives every element `data/services/<id>`, outside its build folder), the
  core's own process keeps `data/node/usage/`; `scripts/money.mjs` reads the core's lines and every `data/services/*/usage/`, each line
  named by its element. The core's copy, the agent kit's 12 copies (the guard OPENAI_CALLS keeps them identical) and both templates
  move together. Proof: a line written by a standalone process with `SERVICE_DATA_DIR` set appears in `npm run money` under that
  element; negative control: without it the line stays in the process folder and money does not show it.
- **B2 D6, two commands in both templates** (small scripts beside `scripts/tool-take.mjs`, model-free, the core's parts code):
  - `npm run tool:own -- <id> [--as tool-<name>]` — a taken copy becomes the element's own tool: `source` leaves the card, `origin:
    { from, id, version }` stays as the lineage, the id and the folder take the new name when given, the version starts at 1.0.0, both
    maps are rebuilt. After it the copy may be edited freely; `tool:take --update` no longer touches it.
  - `npm run tool:new -- <name> "<the task in one sentence>"` — `_tools/tool-<name>/` with a complete card (`id`, `entry`, `version`
    1.0.0, `scope: "any"`, `parts: []`, the task in both languages of the card) and an empty client entry; both maps rebuilt; it
    prints the three questions of `use-tools` (section / widget / tool) before writing and refuses a name that `parts_find` already
    answers with a close match (the agent passes `--new-anyway` after reading the match).
- **B3 the words:** `use-tools` in both templates carries the cycle in ten lines — find (`parts_find`) → take (`npm run tool:take --
  <id> [--from <element>]`) → change (extend in your own file, or `tool:own` and edit) → create (`tool:new`); the element instruction's
  source in the core (`lib/instructions/element/element-instruction.src.md`) names the two new commands; resealed, regenerated in both
  templates.
- **B4 releases:** custom v0.3.201, native v0.1.68 (CI three-os), pins. `template pin` runs A1.
- **Proof of B — the lifecycle script, no model (`scripts/tools-lifecycle.test.mjs` in the core, run on the owner's node by hand; it
  creates and deletes two throwaway elements through the node's own commands, so it never runs in a prebuild):**
  1. `npm run create … --look project --no-wake` twice (A and B, the boundary flag as in 734-3b) → `_tools/` of each is `.gitkeep` (G1).
  2. In A: `npm run tool:take -- voice-textarea` → the copy and its recipe's parts are written with `source`; A's map guards green;
     A's type check adds no error (G2 take).
  3. In A: one line edited inside the copy → `check:parts-map` red «a copy … was edited» (negative control) → `npm run tool:own --
     voice-textarea --as tool-voice-note` → green; the edit kept (G2 improve).
  4. In A: `npm run tool:new -- demo-counter "count clicks"` → card complete, maps green (G3 create).
  5. `npm run parts -- --as <B> "count clicks"` names A's tool «Lives in <A>»; in B: `npm run tool:take -- tool-demo-counter --from <A>`
     writes it (G2 from a neighbour, G3 found). `data/node/parts-index.json` now exists.
  6. Both elements deleted through the core's door (`DELETE /api/architect/items/<id>` with `{ confirm }`), ports silent.
  Every step prints its own `===…_OK===`; the last line is `===TOOLS_LIFECYCLE_OK=== G1 G2 G3`. The script runs each element's
  commands through its `npm run`, never by reading its code.

## Stage C — the 8 natives become newborns (one or two sessions, eight releases, no model in the releases)

Measured file plan against the native template (`probes/file-plan.mjs 7302b1f^` — `7302b1f` is the template's 725-5; the tip
v0.1.67; after B the tip is v0.1.68 — run the probe again). The same picture in all 8 unless said:

- **Delete — the island, the template's list of `b508490`:** `_tools/tool-*` (8 folders), `_tools/README.md`, `_tools/TOOLS.json`,
  `app/api/tools/tool-socials-ai`, `app/api/tools/tool-voice-input`, `components/form/{mic-icon.tsx,parts.json,voice-control.client.tsx}`;
  `_tools/.gitkeep` added. 32 of the 35 files are byte-equal to the template's old ones in all 8; 3 have a native's own variant
  (fact-draft client, socials client, voice-control — in auth, data, storage, config, redis-cache, stripe): still inside the island,
  no importer outside it — run `probes/importers.mjs` on the source before deleting and stop if any number outside the island is not 0.
- **Add — 17 paths absent in all 8:** `lib/parts/*`, `scripts/{build-parts-map,check-parts-map,check-parts-dup,parts,tool-take,
  parts-find.test}.mjs`, the cards `components/**/parts.json` for the folders the native has, and after B the two new commands and the
  three libraries.
- **Replace — 8 paths byte-equal to the template's old version in all 8:** the skills `use-tools`, `build-widget`, `use-languages`,
  the two `node-knowledge` files, `OWN-SERVICE-PROPS/README.md`, `scripts/build-tools-map.mjs`, `scripts/check-tools-map.mjs`.
- **Edit by hand — the native's own files:** `package.json` (+ `build:parts-map`, `check:parts-map`, `check:parts-dup`, `parts`,
  `tool:take`, `tool:own`, `tool:new`; prebuild + `check-parts-map`, `check-parts-dup`, `parts-find.test`; no dependency changes);
  `scripts/check-routes.mjs` (the two lines of the removed doors; own in 7 natives); `.env.example` (`ELEMENT_KEY`);
  `use-development-docs/SKILL.md` (own in 6 — compare, take the template's lines about «tasks this needs»); `tree-manifest.json`
  (regenerated by the element's tree script); `CLAUDE.md` + `scripts/instruction.seal` (`npm run instruction:element -- element <dir>`).
- **Per native, known before the start:** auth — one card for `components/shell/shell-init.tsx` (imported from 2 folders) and 3
  duplicate-class groups; config — 4 groups: `node scripts/check-parts-dup.mjs --freeze` (the frozen debt of 725-6), named in the
  commit. The other six: map and both guards green at once (measured with the island kept; re-measure with it removed —
  `probes/variant-c.sh <name>`).
- **The shell rides in the same release** (the owner: «да, раздавай за один проход»): `npm run shell-kit:add -- <source>` from the
  core — the 4 files `check:shell-kits` names.
- **Each release:** the native's whole chain → tag (next patch) → push → its pin in the core (one file, one commit). One node update
  after the eighth. cache and stripe are off on this node: built, not seen by eye.
- **Proof of C:** `npm run node:readiness` — the 8 at their new pins; `check:shell-kits` — the 8 are ✓; for each of the 8
  `npm run parts -- --as <id> "modal window"` says «Lives in the core»; in two natives (config, auth) `npm run tool:take --
  voice-textarea --dry` answers a plan with `ok`; `data/services/<id>` untouched.

## Stage D — one live proof with an agent (one run on the subscription, its price named before the start)

A real small task to one native's agent (config: «в редакторе шапки дай продиктовать название пункта меню голосом»). Closed when
its session shows `parts_find` → `npm run tool:take -- voice-…` → the page built with the taken copy, no second voice control written
by hand; `data/node/tools-take.jsonl` has the line. If the agent builds its own instead — the skill's words are the defect: fix B3,
repeat.

## Stage E — the four with their own work (later, by the owner's word, one at a time)

root (16 releases behind: v3.0.39 → v3.0.55), vectors, graph, Клип: each takes its newest tag by the «Обновить» button, the conflicts
go to its own agent (the update log names this way). Root first — it is the largest. Four agent sessions; none starts without its
price said.

## Decisions — taken by me for the night run (the owner, 2026-11-12 ~23:45, verbatim: «to do tools non stop , not find me , i am go
## to sleep , to do all steps for tools strategy»)

1. Yes — the old copies leave the 8 natives (no importer; closes D10).
2. Yes — `tool:own` and `tool:new`.
3. Yes — the owner asked for more on this one before he left; what he gets (said to him in the chat): the four files are
   `lib/openai-error.cjs` (128 lines, the node's one reader of OpenAI's refusals — «no money», «limit», «key» told apart),
   `lib/usage-ledger.cjs` (99 lines, one line per paid call, never a key or a text), `lib/i18n/openai-error.i18n.ts` (64 lines) and its
   `.json` (4 KB) — byte-identical to the core's, no dependency of their own. Without them a native can take 6 of the 13 tools; with
   them all 13 (the voice fields, the fact draft, socials, translations). The natives' own code calls OpenAI nowhere today. With D9
   fixed in the same stage, a native's spending becomes visible in `npm run money` — today no element's is.
4. «All steps»: E runs after D is green, each of the four agent sessions with its price written into the record before it starts;
   a subscription limit stops the run — the node wakes it after the reset (686-5).

## Decisions for the owner (my pick first)

1. The old tool copies in the 8 natives are removed, as in the templates (**yes** — nothing imports them; this is his own reading of
   2026-11-12, and my «no, pages import them» was wrong for the natives).
2. «Improve» and «create» get commands `tool:own`, `tool:new` (**yes**), or stay words in the skill.
3. Natives get the three libraries so that they can take the OpenAI tools (**yes**, through the native template), or those tools
   stay untakeable for natives.
4. Stage E waits until D is green (**yes**).

## Not in this step

The runtime shell kit for natives (the custom template's `components/shell-kit`, 727-2) — natives keep the byte copy;
`check-shadcn-parts` for natives (the template's guard of 722, never brought to them); the sweep of duplicate classes (725-6);
734-3c…734-5.

## Cost, said aloud

A and B — two sessions of code in the core and two templates, three releases, two node updates. C — eight mechanical releases with
their chains (the chains are the time), one node update. D — one agent run. E — four agent sessions, by the owner's word. The
probes under `probes/` cost nothing to run again.
