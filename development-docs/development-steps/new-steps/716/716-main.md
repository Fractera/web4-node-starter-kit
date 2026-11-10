# 716 — the old blocks-and-design architecture out of the instructions, skills, guards and templates

The owner 2026-11-10 10:09 (terminal), verbatim: «мы приступаем к генеральному исследованию инструкции и навыков которые требовали
исполнение старой архитектуры и переключаемых на новую?»; 11:20: «next? check claude 's .md and skils? focus to design and blocks
instuctions for update ?». The decision the review rests on, 2026-11-09, verbatim (the custom template's `build-design.md`): «Отлично
давай зафиксируем факт того что мы приняли решение отказаться от элементов дизайн и от элементов Blok»; «стартовый шаблон не имеющий
никакого Патерно проще развернуть в любую сторону».

**The owner's decision, 2026-11-10 ~11:35 (terminal), verbatim — the plan is approved by it and runs without him:** «go to finish non
stop , i am not here , use only best solutions fo our goal : Приоритет твоей работы проверить чтобы нигде не было упоминаний о том что
существуют блоки и дизайн как нативные элементы их не должно существовать как нативные элементы и не должно быть обращение к ним. Поэтому
сначала убери их, проверь что все продолжает работать без них а затем опиши работу внутри нативных и кастомных элементов речь о
инструкции и навыках с точки зрения нашей новой архитектуры». So: C (the registry entries and every call to them) FIRST, option (a) —
removed from the node, the repositories stay on GitHub untouched; then the proof that everything works without them; then A, B, D.
Then «good luck», «great , i am go out». The fork sync by Chrome checked at his request (11:38: pressed myself, `identical`).

**The new model (live since 706/711/715).** An element designs itself: design skills from the library → a test page (prototype: its own
`tokens.json` + `DESIGN.md` + page) → compare in the core's «Build → Design» → approve (`design:pin`: tokens become the element's
`DESIGN-CONFIG`) → the element's agent builds every other page in that design, its sections are its own code. No shared Blocks catalogue,
no shared Design element. CONFIG (site switches) stays shared — not part of this decision.

**Not old (kept, only named clearer):** the core's OWN section catalogue for its architect pages (`sections/blocks/`, `use-sections`,
`check:sections`, `check:blocks-map`, `check:page-composition`) and an element's own `lib/content/blocks` + `blocks:ids` (the `bid`
addresses of its page items). Both are «blocks» in a different sense — a page's own sections, not the retired shared catalogue.

## 716-1 Inventory (no model, 2026-11-10 ~11:25) — file · line · old rule · conflict · proposal

### A. The core's sealed instruction (`CLAUDE.md`, owner's word needed)
| line | old rule | proposal |
|---|---|---|
| §3 103 | native elements include «CONFIG, Blocks, Design» | drop Blocks and Design from the list |
| §3 128 | «Changes in CONFIG and Design reach the elements by a signal» | «Changes in CONFIG reach …» |
| §3 129–130 | «Design: one set of fonts, spacing and colours for all elements; the project's design skill is chosen here» | rewrite: each element chooses its design in the core's «Build → Design» (skills → test page → approve), skill `design-and-settings-of-elements` |
| §3 131–132 | «Blocks: every element reuses them … a ready block is plugged in» | delete |
| §5 280 | «An element's mode: it syncs CONFIG, Blocks and Design with the shared elements or keeps its own» | «… syncs CONFIG or keeps its own; its look is always its own» |
| §6 323–324 | «A page has three sources: a catalogue block, a route widget, a platform primitive … tools, blocks» | «… its own section, a route widget, a platform primitive» |
| §6 325 | «An interface is needed — first a ready block; none — a new section in Blocks, then its reuse» | rewrite: «a page in the approved design — the element's design pass; a section is reused inside its element» |
| §7 367 | «Block — a design section from the Blocks catalogue» | «Section (block) — a designed part of a page, the element's own code» |
| §8 395 | «page sections and blocks — `blocks-of-the-node`» | point to `design-and-settings-of-elements` (or the rewritten skill) |

### B. The core's skills
| skill | old | proposal |
|---|---|---|
| `blocks-of-the-node` (45 l.) | the whole skill: shared catalogue, `npm run blocks find/add`, the node's mode decides who builds a block | delete; its one living rule (a page request goes to the element's agent with «Build process, design:») moves into `design-and-settings-of-elements` |
| `review-page` (68 l. + 2 scripts) | «a page built from catalogue blocks», block cards `*.card.json`, `check-page-blocks.mjs` | rewrite: review a page against the approved design (`DESIGN.md`, tokens), sections named by `data-block`; the three grades stay |
| `create-element` 44–49, 53 | `--look project` = shared Design + CONFIG + Blocks; `--blocks off` | rewrite: an element is born with its own look (optionally `--look-like X`); the only shared choice left is CONFIG |
| `answer-element` 19 | «Blocks — `npm run look -- <id> --own/--linked`» | drop Blocks/Design from the line |
| `handle-block-request` (off for me) | the Blocks element builds a block on request | delete |
| `extract-design-system` (off) | «the Design element does it» | delete (the library's design skills do it inside the element) |
| `use-design` (off, core copy) | the Design element owns the look | delete the core copy |
| `use-page-tree` 16–18, `use-routes` 95 | the master lives in `fractera-blocks-starter`, measured «on the Blocks service» | the master → the custom template; the measurement stays as history in words |
| `lib/main-agent/root-skills-off.json` | reasons «the Blocks/Design element does it» | entries go with the deleted skills |

### C. The core's code
| place | old | proposal |
|---|---|---|
| `scripts/main-agent-cli.mjs` 987–992, `scripts/item-birth.mjs` 50–63 | `--look project|own`, `--blocks off` | `--look project` → linked CONFIG only; `--blocks` removed (its default is already off) |
| `npm run look` (`lib/web4-items/element-look.cjs` and the CLI) | `--own|--linked [config,design,blocks]` | keep only `config` |
| registry `design` (v1.1.39), `blocks` (v1.4.34) | native elements, off, still installed and in the left menu | your choice: (a) remove from the node (registry, built-in list, menu; repos stay on GitHub, archived), or (b) keep off, out of the menu |

### D. The templates
| template | old | proposal |
|---|---|---|
| custom `fractera-custom-item-starter` | already new (706-4); only `build-design.md` 9 names the retirement | nothing |
| root `fractera-root-starter` | `build.md` 119 «the link to the shared Design or CONFIG»; `use-design` 37 `npm run look` for Design | two lines: CONFIG only |
| native `fractera-native-item-starter` (auth, data, storage …) | fully old: `build-design.md` 37–42 (`npm run blocks find/add/request`), `build.md` 80, 179, skills `use-blocks`, `custom-design` («designs itself through the Blocks and Design elements»), `custom-design/impeccable-on-design.md`, `build-widget` 49 | bring to the custom model: `build-design.md`, `use-design`, `use-page-tree` from the custom template; delete `use-blocks`, `custom-design`; then a release and the rollout into the 12 native elements |

## Substeps (the owner's order, 11:35: remove first, prove, then the instructions and skills)

Facts measured 11:40–11:55 that shape the plan:
- The installer gives every element `DESIGN_SERVICE_URL` / `BLOCKS_REGISTRY_URL` by the registry's neighbour rule — no entry → empty →
  the element's code never calls (`scripts/services-install.mjs` 434–447). Calls stop by construction once the entries are gone and an
  element is installed again; the dead code is then cleaned from the templates.
- ✗ The node update keeps every entry of the node's registry the fork no longer has (`mergeRegistry`, `scripts/node-update.mjs` 109–120)
  — right for custom elements, wrong for a native Fractera retires: removing the two entries from the fork alone would leave them on
  every node as «own». Fix: a native (`kind: core`) missing from the fork leaves the node's registry, and the update retires it (pm2
  process and watcher deleted, its folder and its `data/services/<id>` moved into `WEB4-ITEMS/.trash/`, as the deletion door does).
- `/api/settings/changed` is the node's general redraw signal (core build `lib/deploy/quiet-build.cjs`, the catalog push), not only
  Design's: the doors stay, only the pull from Design leaves them.
- Every native repository carries the same ten files that call Design/Blocks (`lib/design-follow.ts`, `instrumentation.ts`,
  `app/api/settings/changed/route.ts`, `config/design-config.ts`, `.env.example`, `OWN-SERVICE-PROPS/A2A-CARD.json`, `components.json`
  `@fractera`, `scripts/blocks.mjs`, the admin «Blocks» page lib, `lib/content/blocks/types.ts`); custom and root — six of them.
- The way 704-4 proved for the natives: edit the author workshop clones `~/fractera-dev/fractera-*-starter`, next patch tag, push by hand,
  pin in the core; vectors and graph carry their own element commits — their agents merge the starter's tag themselves.

- 716-2 Core: the two registry entries; `mergeRegistry` + `scripts/element-retire.mjs` in the node update; the core sections
  `architect/design`, `architect/blocks`; links → `config` only (door, UI, `npm run look`, `create`, `node-type`); `lib/design-follow.ts`,
  `lib/web4-items/design-seed.mjs` and their calls; prefixes, reserved names, progress words, README. Guards green.
- 716-3 Templates' code (custom, root, native) and the natives: the ten / six files; releases, the natives' patches, pins.
- 716-4 Instructions and skills: the core's `CLAUDE.md` (sealed, by this word), its skills; the element instruction source (sealed) →
  the three templates; the native template's modes and skills rewritten to the custom model; root's lines.
- 716-5 Delivery: push, fork sync, node update (the retirement runs), elements installed / merged by their agents.
- 716-6 Proof, two planes: (1) the node — `serve:status` and pm2 without design and blocks, their folders gone, the core's and the
  elements' pages answer (eyes), each element's `/api/health` 200; (2) a search for the old words gives zero living mentions, and a cold
  test of a fresh custom element agent goes the new way.

## Next substeps (after the owner's decisions by group)
- 716-2 A — rewrite the sealed lines, `check:instruction -- --seal`.
- 716-3 B — skills deleted / rewritten; `check-instruction-skills`, `check-skill-headers`.
- 716-4 C — code; guards; a core build.
- 716-5 D — root and native templates: release, pin, rollout.
- 716-6 Proof, two planes: (1) a search for the old words gives zero living mentions outside history; (2) a cold test — a fresh custom
  element's agent gets «сделай страницу о мастер-классах» with no hint and goes the new way (its design pass, the approved tokens, its own
  sections), never asking for a catalogue.
