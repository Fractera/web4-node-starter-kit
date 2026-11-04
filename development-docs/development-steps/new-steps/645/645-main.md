# 645 — the first deploy as the owner saw it: progress, the closing words, the drawers

## 1. Retelling and decisions

The owner (Roma), 2026-11-04 ~20:40 UTC, after a fresh install from his fork `aifa-agi/web4-node-starter-kit` by a Claude Code agent
that followed README. Verbatim (voice, speech-to-text kept):

- «слишком долго проходят Слепой режим во время развёртывания непонятно что что тут движется раньше в проекте более ранней версии мы
  возвращали промежуточные состояния и у нас было около 20 результате время времени появлялись какие-то понятные шаги»
- «ты даешь мне ссылку на страницу localhost 24680. Вместо этого ты должна сказал: остается главное: – подключите вашу подписку … (обязательно)
  – Если вы ещё не используете Telegram установите на свой телефон и на этот компьютер … (рекомендуется) – создайте Telegram бота и начните
  работу в чате (рекомендуется) – если вы не используете Telegram перейдите на работу через терминал: ссылка»
- «Как только ты получишь ссылку от Cloud Flyer напиши: – вам выдано премиум ссылка … рекомендуется как можно раньше подключить домен: ссылка»
  — «премиум» = the temporary public link (owner: «yes»).
- Registration: «Вопросы связанные с регистрацией снимаем вместо этого пишем до переезда на собственной домен регистрации ограничена».
- Farewell: «На этом моя миссия в этом проекте заканчивается. Я не смогу помочь вам с разработкой этого проекта так как у меня нет
  необходимых инструкций. Сейчас рекомендуется идти либо в терминал либо в Telegram (рекомендуется). Эти каналы обладает всеми
  необходимыми инструкциями и помогут вам создать проект ваши мечты. Рад был вам помочь теперь вы можете меня выключить.»
- Drawers: «на странице архитектора вверху есть баннер Cloud Flyer и слово личный кабинет не видно также как и не видно кнопку закрыть.
  Поэтому на всех правых выдвижных ящиках сверху сделала 40 пикселей.»
- Cabinet: «нужно скрыть все вкладки, а вместо них создать: – как это работает – подписка Cloud Code – терминал – активация Telegram.
  В вкладке группа страниц архитектора тоже создашь те же самые страницы.» Four items (owner: «3 - ok»).
  «How it works» = http://localhost:24680/ru/passport/how-it-works.
- «Все необходимые обновления ты будешь отправлять в Fractera»; «коммиты прямо в main»; README is updated too (owner: yes).

Assumptions:
- I assume «the banner» is the core's `OnlineBar` (`components/node-state/online-bar.client.tsx`, fixed, 30 px, z-60) — it covers the
  `SheetContent` (z-50) header and its close button.
- I assume «create the pages» = drawer items to the pages that already exist in the core (`passport/how-it-works`,
  `build/subscription`, `build/terminal`, `build/telegram`); no new page folders.
- I assume «the cabinet of the page opened after deploy» = the site (root, :24683, repo `fractera-root-starter`), and «the architect
  group» = the core's own drawer (:24680, `lib/shell/core-shell-data.ts`). Both get the same four items.
- «Hide» = out of the list, code kept (a comment with the owner's word), not deleted.

## 2. Reused

- `lib/menu/account-links.ts`, `lib/shell/core-shell-data.ts` (core drawer); `fractera-root-starter/lib/menu/account-links.ts` (site drawer).
- Page titles from each page's `_data` (`wordsOf`), so a label never drifts from its page.
- Site → core links through the site's own `/architect/*` redirect (measured: 307 → :24680 for all four).
- `scripts/launch.mjs` `step()` / `welcome()`; `scripts/services-install.mjs` per-element loop; `scripts/serve.mjs` address block.

## 3. Known limits

- `components/shell/` is byte-identical with the site (`check:shell-kits`) — the drawer fix goes into `components/ui/sheet.tsx`, not shell.
- Texts only through translations (`check:i18n`); component ≤ 250 lines; `data-block` on containers.
- CLAUDE.md lines 5–8 (WELCOME, «above all the warning…») are sealed — changed only by the owner's word, resealed with
  `npm run check:instruction -- --seal`.
- Root is pinned by tag: a site change ships only as `fractera-root-starter` v3.0.19 + the pin in `WEB4-ITEMS-REGISTRY/web4-items.json`.
- One node per computer: the live test needs `npm run serve:remove -- --yes` of the current node first.

## 4. Observable results

- An open right drawer on an architect page starts 40 px lower: its title and ✕ are below the online bar.
- Both drawers (site and core) list exactly the four items, each opens its page (200).
- A fresh `npm run launch` prints ~21 `===PROGRESS=== k/N` lines with plain words and minutes.
- The end text is the owner's script with live links; README tells the agent to relay progress and that text.

## 5–7. Substeps (each in its own file)

| | what | repository |
|---|---|---|
| 645-1 | right drawers 40 px down | core |
| 645-2 | core drawer: four items | core |
| 645-3 | site drawer: four items, v3.0.19, pin | root-starter + core |
| 645-4 | `===PROGRESS===` through launch, build, elements, tunnel | core |
| 645-5 | the closing words + CLAUDE.md lines 5–8 resealed | core |
| 645-6 | README agent section; live fresh install with the owner | core |

All on `main` of `Fractera/web4-node-starter-kit` (and `Fractera/fractera-root-starter` for 645-3), dev clones in `~/fractera-dev/`.

## 8. Acceptance

Every substep has a file, two proofs from different planes named in advance, one with a negative control.

## 9. The owner's approval

2026-11-04 ~21:00 UTC, the choice window, verbatim: plan — «Да, начинай (Recommended)»; the architect-group item — «Оставить пятым
(Recommended)» (site and core drawers: the four, then «Группа страниц архитектора»); the old item 6 (subscription risks, OpenAI key) and
the first-account warning — «Убрать оба» (the closing words are the owner's script only; those facts stay on the panel's pages).
