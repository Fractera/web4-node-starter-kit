# 710 — the main agent's Documents show the core's files; Super node hidden until Lagrix

The owner 2026-11-09, verbatim: «у кастомных элементов … на вкладке документы есть все необходимые записи. А вот у главного агента почему-то
надпись что эти страницы ещё не построены? Почему надо бы доделать да?» · «вкладка супер узел должна быть скрыта то есть закомментировано до
тех пор пока у нас лагрикс не будет запущен».

- 710-1: eleven pages of the main agent's «Документы» (instruction, skills, docs-registry, step-current, steps-new, steps-done, glossary,
  backlog, cancelled, anti-patterns, translation-debt) render `ElementDocIsland item="build"`; the door `/api/node/element-docs` reads
  the core's file by the page name only (`lib/main-agent/core-docs.ts`); `lib/web4-items/element-docs.ts` got `readDocAt(dir, src)` and
  `nested` (a steps folder of step folders, at most 60 files). «Добавить задачу» (task-add) is a form, not a document — not touched.
- 710-2: `architect/super-node` → `architect/_hidden-until-lagrix-super-node` (a `_` folder is no route and no menu item); the way back is
  written in its `_hidden-until-lagrix-README.md`.
- Proofs: every path of CORE_DOCS exists on the owner's node; guards and tsc clean. Live: eyes on «Текущий шаг» and «Навыки» of the
  main agent after the update; no «Супер узел» in the menu.
