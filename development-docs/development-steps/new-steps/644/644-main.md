# 644 — Before the fresh install: no tails of the starter, a pattern to close a step, a glossary that agrees with the instruction

## 1. The owner, verbatim (2026-11-04 ~17:30 UTC)
«Обрати внимание что при установке новой версии не должно быть каких-либо Хвостов которые мы с тобой наработали то есть например шаги
разработки должны обнулится и первый шаг который приезжает на старте должен и быть первым. Также я помню об одной проблеме: ты когда
закрывал первый шаг разработки или не ты а агент самого узла ему как будто бы был недостаточно паттернов для того чтобы правильно создать
закрыть, правильный корректно оформить документы закрытого шага. Проверить этот момент другой момент это документ глоссари, насколько я
понимаю там должно быть максимально компакт упаковано информации всех видах протоколов что такое узел что такое элемент что такое ядро и
какие-то другие сущности если это нужно но может быть инструкция это тоже объясняют и это не нужно? Тогда просто проверь чтобы он не
конфликтовал». The plan (shown in chat): «да, делай 644».

## Found (read 2026-11-04)
- `scripts/fresh-project.mjs` (launch stage 4, only on a fork — the original refuses an install: «Это сам оригинал, а не ваш форк»)
  empties `new-steps/`, `completed-steps/`, `pre-steps/handled/` and writes step 1. Left behind: `development-docs/CANCELLED.md` carries
  a starter row of 2026-10-30 against its own rule («It arrives in a new node with this node's own entries only»);
  `TRANSLATION-DEBT.md` carries the starter's table «Что снято».
- A fresh node has no closed step to look at; the skill says what a summary holds, with no example.
- `development-docs/GLOSSARY.md`: «there is no glossary page in the panel» — the page `/architect/build/glossary` exists and CLAUDE.md §7
  calls it the only source of definitions; its first section is the removed PRODUCTS-CONFIG model (`config-schemas.shared.mjs`: the
  folder and the mechanism deleted); node, core, element and the protocols are not in it at all.

## Substeps
| # | Result | Proof |
|---|---|---|
| 644-1 | `fresh-project` also empties the starter rows of `CANCELLED.md` and the starter table of `TRANSLATION-DEBT.md`, headers kept | a temp copy of the repo: fork → the rows gone, step 1 first; author → nothing touched |
| 644-2 | an example of a closed substep and a closed step in `use-development-steps` (`references/closed-step-example.md`), named by §5 and by step 1's plan | Sonnet on a fresh tree: «подшаг 1-1 готов, закрой его» → `completed-steps/1-1.md` in the example's form; before — without it |
| 644-3 | `GLOSSARY.md`: the entities (node, core, element, main and element agent, protocols, modes) in a compact table matching CLAUDE.md §7 and the panel's glossary; the stale header and PRODUCTS-CONFIG into «Removed» | the words compared line by line; `check:links`, `check:term-hints` green |

## Approval
2026-11-04 ~17:35 UTC: «да, делай 644».
