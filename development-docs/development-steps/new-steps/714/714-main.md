# 714 — the stand's page keeps the node's menu and the project's name; the quick strip leads into the core; the interface skill in the instructions

The owner 2026-11-10 ~08:00 WET, verbatim (excerpts), about the stand qfx9w «Глина и огонь» from the custom template:
- «страницы должна сохранить верхние меню такой же как раз всех остальных элементах который автоматически создается из всех
  существующих к кастомных и нативных элементов»
- «Верхняя полоска … имеет три кнопки, задача этих кнопок ввести в настройки на странице архитектора а не показывать собственные
  страницы например дизайн … показывают собственной страницы»
- «С небольшим отступом сверху большим шрифтом ты должен написать название проекта в данном случае глины и огонь противном случае все
  страницы не имеют никакого отличительного принципа»
- «мы работаем над обновлением именно стартового кастомного шаблона … мы изменяем глину и огонь пока это единственная элемент …
  когда закончим обновление будем переносить на другие элементы»
- «вкладка внутри строительства дизайн и … настройки сайта интерфейс получился значительно лучше … вспомнил какой ты навык использовал
  … и перенёс этот навык в инструкцию ядра и элементов с подсказкой использовать при моделирование административных панелей и
  дашборда»
- «после всего вот этого выполненного позвать меня» — then, at maximum effort, a review of the instructions and skills of the old
  blocks-and-design architecture: every conflict found and rewritten for the new one (the next step, not this one).
The approval is the task itself («позвать меня» after it is done) — no plan questions.

Measured before (eyes, node build c3667776): qfx9w home — header «Fractera» + «Личный кабинет», no «Нативные / Кастомные элементы»
(root has both); `projectCatalog` returned [] while `links.json` config=false (`look own`) and `pullProjectSettings` refused to pull;
the strip's «Дизайн и бриф» → the element's own `/admin/design`; the body empty (`awaitingDesign`, `titleInBody`, no blocks).

- 714-1 Template: the node's catalog no longer depends on the CONFIG link — the copy is pulled always, the owner's patches still lie
  only when linked (`projectSettingsPatch`).
- 714-2 Template: the three strip buttons → the element's Build tabs in the core (`coreTab`); no core → Design stays on its own page.
- 714-3 Template: an awaiting-design page prints the project's name (passport `name`, else the site's name) as a hero H1 with a small top
  padding (`AwaitingTitle`).
- 714-4 Core: the skill interface-design (dammyjay93/interface-design, MIT) adopted into the core and into the custom template's skills
  with SOURCE.md; one line in the core's instruction and in the elements' sealed instruction: load it when modelling administration
  panels and dashboards.
- 714-5 Delivery: template release, pin, core push, fork sync, node update, rollout to qfx9w only, its rebuild; eyes 1440 and 390 on
  qfx9w (menu with both tabs, the strip's links into the core, the name); 713 closed (the owner accepted the result).

## Live (2026-11-10, node build 1a7a2167)

- The rollout left qfx9w alone («HEAD ee00f4f is not its pin v0.3.180»: its own prototype commits) — by design. Its agent merged
  v0.3.181 (`f2b09fd`: unrelated histories → v0.3.181 as the second parent, the template's diff v0.3.180..v0.3.181 applied three-way,
  13 files, no conflicts; `titleInBody` kept next to `AwaitingTitle`); tsc and its prebuild green; not pushed, not deployed. Its sealed
  instruction: nothing to change. Rebuilt (`services:install --only qfx9w`).
- Eyes 1440 and 390: the name «Глина и огонь» as the hero H1 ✓; the strip's three buttons → `http://localhost:24680/ru/qfx9w/build/
  {design,site-settings,subscription}`, each 200 (`/ru/architect/qfx9w/…` redirects there) ✓; console clean.
- Found: after the first rebuild the header had NO «Нативные / Кастомные элементы» though the element's copy held 16 catalog entries.
  The element's agent (`50d8235`, anti-patterns): the template's shell and menu doors are `force-static` (`app/api/shell/[lang]/route.ts:13`,
  `app/api/menu/[lang]/route.ts:18`); the build baked `top: []` at 09:19:16, the start pull wrote the copy at 09:19:23 and nothing
  revalidated; one `POST /api/settings/changed` restored both groups (12 native, 4 custom) ✓ by eyes.
- 714-6 (core): `services:install --only <id>` now refreshes the node catalog after the element answers (`notifyCatalog('install',
  { waitPort })`), the same call a full install, a birth and a deploy make — its signal revalidates the element's baked shell. Not
  reproduced on demand: two more rebuilds (one with the copy removed) baked the menu correctly, so the race shows only sometimes; the
  live proof is the next single install on a fresh element. Rides the next node update.
