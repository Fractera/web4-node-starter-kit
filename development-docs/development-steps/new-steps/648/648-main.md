# 648 — the eyes for root and the custom template

## 1. Retelling and decisions
The owner, 2026-11-04 ~23:30 UTC, verbatim: «linux task now to cancel»; «Давай добавим возможность play Wing для для рут и стартового
кастомного шаблона»; «Разумеется с обновлением текущих навыков как мы это сделали и при необходимости они знают дела или нет при обновлении
инструкции». Native template and native elements — not in it. Linux root install-deps — cancelled.
Decision (existing pattern, `scripts/study.mjs`): ONE Playwright in the core; an element's `scripts/eyes.mjs` calls the core's
`scripts/eyes.mjs` and puts the screenshot into its own `logs/eyes/` (outside git).

## 5–7. Substeps
| | what | repositories |
|---|---|---|
| 648-1 | `scripts/eyes.mjs` + `npm run eyes`; skill `use-eyes`; `use-tests-before-dev-finish` and `connect-own-domain` updated; the build-skills table | custom template, root |
| 648-2 | the element instruction §7, `@C` line (custom + root only), regenerated; resealed by the owner's word | core (source), custom template, root |
| 648-3 | releases: custom template v0.3.156 + pin, root v3.0.20 + pin | all three |
| 648-4 | proof on the owner's node: root's own `npm run eyes` → a screenshot in root's `logs/eyes/` | — |

## 9. The owner's approval
«Давай добавим возможность play Wing для для рут и стартового кастомного шаблона» + «Разумеется с обновлением текущих навыков …» (2026-11-04).
