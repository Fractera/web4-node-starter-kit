# 733 — Tools: one definition, one source in the core, templates without copies, a copy taken with its provenance

Approved by the owner 2026-11-12 ~15:10, verbatim: «to do it , plan is confirmed» (the plan as shown to him:
`~/.claude/plans/to-do-it-stateful-honey.md`, in Russian). Opened from the conversation of 2026-11-12, his words:
«Задачи не одна задачи две что модели не умеют получать готовые и существующие инструменты и всё остальное задача в том что модели не
понимают когда их создавать и куда их складывать и вторая задача более первичная чем первая».

## Measured before the plan (2026-11-12)

- In the custom and native templates no page uses any of the 8 tools (they call only each other); in root one consumer — the home
  page prompt (voice input). The template copies already differ (voice input, translations, socials, fact draft: custom ≠ native).
- On a person's node the core is Fractera's and is not changed (CLAUDE.md §6): a tool born on the node belongs to its element.
- `parts_find` in an element sees only its own map; the panel glossary (the one source of definitions, §7) has no «tool», «section», «widget».
- The Tools tab (725-8): the terminal as a third column breaks its layout; «Edit» does not say what to do; a live look for 2 of 12.

## Decisions (the conversation of 2026-11-12)

- A tool is a job, not a place: one job «verb + object» without naming a page; its material comes from outside, its result goes out; it
  does not know who holds it. Three questions at birth: the look of a page's content → section; reads its route's data / knows where it
  stands → widget; one job with an input and an output → tool, even when one place needs it today.
- My pick for the open boundary (to be confirmed at 733-1's stop): a composite is a ready CONTROL — it holds a value of a form and
  produces no result of its own (the voice textarea holds text; the job, transcription, is the voice tool's). A composite that produces a
  result is a tool.
- Sources: Fractera (core, templates, by releases) → the element where a tool was born → copies, always taken from the source.
- A copy = body + own: the body is never edited (a fingerprint guard), additions in own files; an edited body is a fork.
- Find — a function without an agent; choose — the element's agent by the cards; take — a core command without a model. The main agent
  only when nothing is found (`need`) or a new shared tool needs a home.
- Registry: the card beside the code (truth) → the element's map (built) → the node's index in the core (an extract, no code); apart from
  `OWN-SERVICE-PROPS` and the A2A card.
- Templates: custom and native come with `_tools/.gitkeep`; root only with voice input (a copy of the core's).
- The Tools tab's terminal: below the list, full width, a fixed-height window like the Terminal tab; «Edit» copies the description and
  says «скопировано — вставьте в его терминал»; nothing is inserted or sent by default.

## Substeps

- **733-1** the definition and the check at birth — panel glossary, CLAUDE.md §7 and the §4 exception (resealed), `use-tools`, the gate's
  three questions, «works this needs» in the plan template. Stop for the owner's review.
- **733-2** the card — `job`, `input`, `output`, `version` required; `source`, `own`, `fork` for copies; `requires` measured; the 12 core cards.
- **733-3** portability — `requires` by imports; `scope: panel` tools are not given to elements; proof on a scratch template clone.
- **733-4** the node's index and the search order — own → core → neighbours of the same owner; built without a model at birth and deploy.
- **733-5** «take» — `POST /api/node/tools/take` + the element's `npm run tool:take -- <id>`; journal and a notice to the architect.
- **733-6** templates without tools (custom, native) — releases, pins, CI three-os; born elements untouched.
- **733-7** root takes voice input from the core with `tool:take` (live proof of 733-5).
- **733-8** the Tools tab by the owner's words (terminal below, Edit copies, core read-only on a person's node, live looks of every tool —
  the two kept edits `components/tools-tab/tool-looks.i18n.ts`, `sampleSrc` of the video trimmer).
- **733-9** updates from the source and the body guard (`check:tools-body`).

Not in it: exchange between owners and t2t between nodes (Lagrix); new rules into born elements; 725-6; 727-4.
Price: the node's weekly limit 99 % (reset 15.11 11:00); each live run of an element agent is named with its price first.
