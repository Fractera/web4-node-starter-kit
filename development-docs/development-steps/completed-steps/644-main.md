# 644 — Before the fresh install: no tails of the starter, a pattern to close a step, a glossary that agrees with the instruction (closed 2026-11-04)

## The owner, verbatim
«Обрати внимание что при установке новой версии не должно быть каких-либо Хвостов которые мы с тобой наработали то есть например шаги
разработки должны обнулится и первый шаг который приезжает на старте должен и быть первым. Также я помню об одной проблеме: … агент самого
узла ему как будто бы был недостаточно паттернов для того чтобы правильно создать закрыть, правильный корректно оформить документы
закрытого шага. Проверить этот момент другой момент это документ глоссари, насколько я понимаю там должно быть максимально компакт
упаковано информации всех видах протоколов что такое узел что такое элемент что такое ядро … Тогда просто проверь чтобы он не
конфликтовал» (2026-11-04 ~17:30 UTC); the plan: «да, делай 644».

## Where it lives
Core `Fractera/web4-node-starter-kit`, `main`: `ae33229` (644-1), `efd9b2f` (644-2), the commit of this summary (644-3).

## What was done
- **644-1** `scripts/fresh-project.mjs` (launch stage 4; an install from the original itself is refused by `check-origin`, so it always
  runs on a new node): besides `new-steps/`, `completed-steps/`, `pre-steps/handled/` it now drops the starter's rows of
  `development-docs/CANCELLED.md` (its own rule: this node's entries only), header and table head kept, and commits that file too.
  `TRANSLATION-DEBT.md` is kept on purpose: its section on step 255 is knowledge of the product (why it has two languages), not steps.
- **644-2** `use-development-steps/references/closed-step-example.md`: a closed substep (`1-2.md`) and a closed step (`1-main.md`) on
  step 1 of a fresh node, with four checks before calling it closed; named in §5 and in the step 1 plan `fresh-project` writes. The CI
  rule of §5 now applies where the repository has CI and `gh` is signed in.
- **644-3** the panel's first-contact glossary (`architect-home.i18n.ts` «basics», en + ru) got the protocols **i2i, a2a, f2f, H2H,
  H2A** in the words of CLAUDE.md §2 and §4. `development-docs/GLOSSARY.md`: the header no longer says «there is no glossary page in the
  panel» — it names the first-contact glossary as the only source of the node's words (CLAUDE.md §7) and keeps the words of building;
  the removed PRODUCTS-CONFIG «product» model went to «Removed 2026-11-04».

## Proof
1. 644-1, two temp copies of the repo (`p644/fork`, `p644/author`): fork — `===FRESH_OK=== removed 55 starter step files; step 1 written,
   committed`, `new-steps/` = step 1 + README, CANCELLED rows 0, «Active steps: 1 — the first launch»; author (negative) —
   `===FRESH_SKIPPED=== author`, 49 completed files and the CANCELLED row untouched.
2. 644-2, Sonnet on fresh trees, «Подшаг 1-1 готов … Закрой подшаг 1-1 по правилам проекта.»: without the pattern (`p644/fork`) — an
   honest summary in a form of its own («## The two proofs (as they reached the record) / PROOF 1 — plane …»); with it (`p644/with`) —
   «## The person, verbatim / ## Where it lives / ## What was done / ## Proof / ## Mistakes / ## Evolution of skills», the missing
   negative control and the pending hash named in both.
3. 644-3: `===TERM_HINTS_OK=== словарей: 1, слов ликбеза: 48, меток: 39`; `===LINKS_OK===`; `===STEPS_OK===`; `tsc` 0 errors.

## Mistakes
- I first wrote the CI rule of §5 for every node: a person's node may have no CI and no `gh` — narrowed in 644-2.
- I first counted `TRANSLATION-DEBT.md` as a tail; read whole, it is the product's knowledge — kept.

## Not in it
The panel page «Глоссарий» (`/architect/build/glossary`) is still empty («content coming»): the definitions live on the first-contact
page; showing them there too is a separate small step if the owner wants it.

## Evolution of skills
`use-development-steps` — the closing pattern; the CI rule narrowed.

## The plan
Deleted in this commit (`git log --diff-filter=D --format=%H -1 -- development-docs/development-steps/new-steps/644/644-main.md`).
