# 632 — The node updates itself from the synced fork; the menus show every element as the person names it

## 1. Retelling and decisions

The owner, 2026-11-03, verbatim (from Telegram and this conversation):
- «За проверь верхнее меню чтобы там присутствовали все нативные элементы потому что сейчас я не вижу там Stripe и я не вижу там наш
  новый элемент»; «На вкладке кастомные элементы верхней меню нету ни одного хотя у нас есть руут»;
- «До сих пор не вижу новые элементы в левом меню ядра:, также до тех пор пока не подключён собственный домен на вкладке основное в
  левом меню вкладку доме на хостинг подсвечивает красным шрифтом»;
- «Я уже нажал синхронизацию но на странице архитектора у меня до сих пор сейчас висит баннер: узел собран из вашего форка, а в
  оригинале Fractera один новых изменений. … синхронизацию я уже выполнил наверно было бы логично здесь поставить вторую кнопку
  запустить развёртывание? И убрать кнопку открыть Fork?»;
- «sync success, next steps will for you» — the update of the owner's node done by hand the same hour (the record in `current-steps.md`).

Measured the same hour on the owner's node:
- the top menu takes its cards from `GET /api/node/catalog`: a card's title is the element's home page `<title>` — root showed as «Что вы
  хотите построить?», cache as «Эталонный нативный шаблон»; an element whose process does not answer is dropped (`catalogEntry`:
  `if (!seen.up) return null`) — Stripe is off by its passport, so it was not there;
- the temporary internet address had been dead since 2026-11-02 19:05 and nothing on the pages said so (the watcher wrote `dead` into
  `logs/tunnel.json`; `/api/domain/state` turns a dead address into `null`); the owner: «Похоже для этого нужно делать баннер, который
  будет предупреждать об этой проблеме и кнопка которую этой проблемы будет решать?»;
- the banner reads `logs/origin.json`, written by `check-origin` only at a build or a start: after «Sync fork» it kept the old count, and
  its only button opens the fork, which has nothing left to sync;
- «Sync fork» changes the fork on GitHub, not the node: the node's folder takes nothing by itself. Its `main` is the fork plus its own
  «Fresh project» commit, and 40 files were left changed by hand-made updates (33 equal to the fork's) — a `git pull` refuses, and a merge
  brings back the starter's step files the fresh project removed. `serve:rebuild` builds only the core; a new element or a new pin needs
  `services:install`.

## 2. What is reused
- The hand-made update of 2026-11-03 (its order and every check — `current-steps.md`): backup, merge keeping the node's own
  `development-docs/development-steps/`, the registry's runtime fields (`off`, `powerAuto`, …) carried over, `prebuild`, `services:install`,
  `serve:rebuild`, `skills-base`.
- `scripts/serve.mjs rebuild` (the quiet build, a failed build gives the old one back), `scripts/rebuild-detached.mjs`, `scripts/check-origin.mjs`
  (`logs/origin.json`, `behindBy`), `components/node-state/origin-notice.client.tsx`, `app/api/node/origin`.
- The catalog: `lib/web4-items/dashboard-rows.ts` (`catalogEntry`, `diskPassport`, `power.offOf`), `components/architect/all-projects.client.tsx`.
- The left menu: `_lib/draft-menu.tsx`, the section words `architect/<id>/_data`, the domain record (`nodeDomain`, `logs/domain.json`).

## 3. Known limits — what must not break
- «Behaviour nobody ordered is never built»: the update runs only by the person's click or word, never by itself.
- The update stops the node for the core's build (the quiet build) — the button says so before it runs, with the measured time.
- The node's own development steps never take the starter's; the node's registry state survives every update.
- Law 264: the machine's state is asked in the browser (the banner, the domain mark), not baked into a prebuilt page.
- `ANTI-PATTERNS.md` «All systems» before every substep that runs the update.

## 4. Observable results
- The top menu: «Нативные элементы» lists every native element by the name of its section in the left menu, Stripe with «выключен»;
  «Кастомные элементы» shows «root».
- The left menu: «Домен и хостинг» in the warning colour while the node has no own domain.
- After «Sync fork» the banner says the fork is synced and offers «Обновить узел»; the click updates the node the way it was updated by
  hand, and the banner is gone after it.

## 5–6. Substeps, order, address

| Substep | What | Where | Rests on |
|---|---|---|---|
| 632-1 | the top menu: cards named as in the left menu (root is «root»), turned-off and silent elements listed with the reason, linking to their section (only in the core's own menu, never in the CONFIG catalog for public sites) | core | — |
| 632-2 | «Домен и хостинг» (and «Активация домена», and the zone «Основное» holding it) in the warning colour while the node has no own domain — asked in the browser | core | — |
| 632-3 | `npm run node:update`: the hand-made update as one command — refuses on local work it would lose, keeps the node's steps and registry state, installs, rebuilds, reports | core | — |
| 632-4 | the banner: «Проверить снова» (the fork against the original and the node against the fork), «Обновить узел» once the fork is synced; «open your fork» only while it is behind; the update's stage after a reload | core | 632-3 |
| 632-5 | a dead temporary address: a red banner with the time the watcher saw it, and «Поднять новый адрес» (`serve:publish --new`) | core | — |
| 632-6 | live on the owner's node: the update delivered by `node:update` itself; the next one by the button | the owner's node | 632-1 … 5 |

## 7. Substeps
The table above is the substep list (the owner's yes given on the outline: «my choose 1»); each substep's proof is in its summary.

## 8. Acceptance of the plan
Stages 1–7 present; every substep proven on two planes — the code run by the core's own functions or guards, and the owner's node.

## 9. The owner's approval
«my choose 1» (2026-11-03, the choice window after the update), with the dead-address banner added by the owner's words in the same answer.
