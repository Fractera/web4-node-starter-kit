# 662 — the landings grow up: the menus, the power label, the builder, questions, the working tools, root's carousel (closed)

**The owner, 2026-11-06 (verbatim in the plan, recoverable from git):** the top menu «должно существовать всегда … автоматически»; auth's
guests and Google/Resend; design and CONFIG — «третья сверху секция»; blocks — «стандартизировать первый раздел … сохранить идею»; «На все
лендинги добавь секцию вопрос ответ»; data's schemas; backups for the stores; «каждый элемент идёт в комплекте с своим строителем Claude
Code Agent и Telegram бот»; embeddings «прямо на вашем компьютере» and the comparison with OpenAI; the heart of LightRAG and a diagram of
the search; Stripe's item; root's carousel «каждые 3 секунды … приостанавливается пока пользователю удерживает эту карточку»; the power
label as a section. His choices: «Метка + включение (Рекомендую)», «Go, всё одной доставкой (Рекомендую)»; and after the first delivery:
«построить верхнее меню такой же как на странице архитектора в которой состоит из двух разделов нативные элементы и кастомные элементы».

| Substep | What | Commits (tags) | Summary |
|---|---|---|---|
| 662-1 | «All projects» in every header from the registry; Stripe marked off, to its switch, architect only | see `662-1.md` (core `adba39dd`) | `662-1.md` |
| 662-2 | shared sections in every landing: power label, «your own builder», FAQ last, backups for the stores; the widgets draw catalogue blocks (`renderBlocks`) | 15 repositories, pins `08843b3` | here |
| 662-3 | auth guests and providers; data schemas; embeddings beside OpenAI text-embedding-3-small; graph «the heart of LightRAG» + block-flow of a search; design and CONFIG «tool» third; blocks first screen after the sample | the same releases | here |
| 662-4 | root's carousel: arrows, 3 s, paused while held, while text is typed, when deselected, on reduced motion | root `0e80ddc` v3.0.29 | here |
| 662-5 | the element header as the core's: «Native elements» / «Custom elements» | 15 repositories (auth `eb136d9` v2.4.19 … vectors `17b3181` v1.2.15), pins `3c742135` | here |

662-2/3/4 releases: auth `ad8566b` v2.4.18, blocks `cf8f06d` v1.4.24, config `2d06813` v1.2.27, custom `ab4775e` v0.3.164, data `505fee4`
v2.2.11, design `bb64502` v1.1.26, embeddings `6cca141` v0.1.12, graph `7f69863` v1.2.13, memory `29a5931` v2.2.31, native `86a6d03` v0.1.44,
cache `c5aa3a8` v0.1.23, root `0e80ddc` v3.0.29, storage `f647287` v1.1.31, stripe `224373d` v1.3.21, vectors `2e1e85c` v1.2.14 — CI
three-os green on all 15 (auth 42231633579 … vectors 42231731494), pins `08843b3` (42233807108). 662-5: CI green on all 15 (storage's macOS
job cancelled by GitHub's capacity, rerun 42239656461 green), pins `3c742135`. Tools: `~/fractera-dev/_tools/662/` (`patch-widget.mjs`,
`content.mjs`, `add-sections.mjs`); the menu patch was a throwaway script (scratchpad `662/apply-menu.py`), as the owner asked. Delivered:
`ядро 35c3f965` (662-2/3/4), `ядро 9d8c5b93` (662-5). GitHub, by the owner's word «to do itnow , for domain you must use
<element>.fractera.ai»: description, homepage and topics on all 15 repositories.

**Proven.**
1. *Lab* (`next dev`, en/ru, light, dark, 390): every landing — the new sections, console 0, no overflow; graph «heart» and the flow,
   embeddings' table, design «tool», blocks' first screen seen; root's carousel (`662/carousel.cjs`): swarm → 3.5 s fullstack → 6.7 s
   factory, held 4.5 s stays, next/prev, the card in view at 1440 and 390; the two tabs with an off Stripe for the architect only.
2. *The owner's node* (`ядро 9d8c5b93`): `eyes-landing.cjs` on all 12 running elements — en and ru, 1440 light and dark, 390 — console 0,
   no overflow, the drawer's five tabs, `===EYES_LANDING_OK===` each; `menu-eyes.cjs` on all 12 — tabs «Нативные элементы | Кастомные
   элементы», the native tab: architect 12 cards with «Платежи Stripe ВЫКЛЮЧЕН» → `…/stripe/settings/danger-zone`, guest 11; the carousel
   on the node — the same numbers as the lab.

**Mistakes.** (1) I built one «All projects» tab while the task named the core's two sections — the owner caught it; 662-5. (2) The
landing widgets drew only text blocks in an unknown section — `block-faq` would have vanished silently; caught by reading the widget
before writing data. (3) Two FAQ headings (the section's and the block's) — Generic now skips its heading for a lone FAQ. (4) The custom
template's guard wants FAQ to close the page — FAQ moved last everywhere. (5) Releasing a held card counted as a click and deselected it;
a «visible» check mid-scroll left a card off-screen — both found by the timer test. (6) The owner clicked «Sync fork» twice before the
pins were committed — I said «готово к Sync» only after CI; the order must be said before the click, not after. (7) My eyes tool clicked
a hidden menu card for «Account» once menus appeared — the tool now clicks the header's button by role.

**Evolution of skills.** The tool `eyes-landing.cjs` fixed (the drawer by role). Not done of the owner's list: «formats of the Blocks page
moved into Design» — Design got the tool section and FAQ only; told to the owner.

**Not in it:** the power label fed from the passport (663-1); fractera.ai for root's homepage (the owner: later today).
