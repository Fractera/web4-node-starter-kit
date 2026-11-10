# 716 — the old blocks-and-design architecture out of the instructions, skills, guards and templates

The owner 2026-11-10 10:09 (terminal), verbatim: «мы приступаем к генеральному исследованию инструкции и навыков которые требовали
исполнение старой архитектуры и переключаемых на новую?»; 11:20: «next? check claude 's .md and skils? focus to design and blocks
instuctions for update ?». The decision the review rests on, 2026-11-09, verbatim (the custom template's `build-design.md`): «Отлично
давай зафиксируем факт того что мы приняли решение отказаться от элементов дизайн и от элементов Blok»; «стартовый шаблон не имеющий
никакого Патерно проще развернуть в любую сторону».

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

## Next substeps (after the owner's decisions by group)
- 716-2 A — rewrite the sealed lines, `check:instruction -- --seal`.
- 716-3 B — skills deleted / rewritten; `check-instruction-skills`, `check-skill-headers`.
- 716-4 C — code; guards; a core build.
- 716-5 D — root and native templates: release, pin, rollout.
- 716-6 Proof, two planes: (1) a search for the old words gives zero living mentions outside history; (2) a cold test — a fresh custom
  element's agent gets «сделай страницу о мастер-классах» with no hint and goes the new way (its design pass, the approved tokens, its own
  sections), never asking for a catalogue.
