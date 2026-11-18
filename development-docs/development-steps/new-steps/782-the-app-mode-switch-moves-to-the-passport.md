# 782 — the app mode switch moves from the configurator to the core's Passport

Status: APPROVED 2026-11-18 11:56 UTC (Telegram 567, verbatim below) — in work. Repository: the core (`main`); the configurator's own card — its agent, in its repository.

## The owner's words (2026-11-18 11:53 UTC, Telegram 565, verbatim)

«На странице конфигуратора есть переключатель я бы хотел его перенести на вкладку страницы архитектора и добавить первую верхнюю голубую
вкладку с переключателем. Переключатель можно выполнить виде такой же круглой кнопки какая на остальных карточках. Но поставить две одну над
другой активной подсвечивается тёмно-синем как и все другие кнопки неактивные светло голубым карточка тоже пусть будет голубой без всякого
красного цвета в этом экране текст кнопки: – один пользователь – Много пользователей. Подсказку в левой части сделаешь так чтобы она менялась
в зависимости от выбранной кнопки ну то есть сама карточка должна называться режим работы приложения а текст: – один пользователь: – –
настройки распространяются на все созданные элементы и Domino. До 980 доменов работают на цели одного супер пользователя – много
пользователей: – – один супер пользователь создает до 980 доменов для для других пользователей. Один пользователь может иметь один или
несколько доменов. – – В режиме один пользователь в тексте добавь ссылку на страницу конфигуратор. Старайся чтобы карточки не прыгали по
высоте при переключении различных режимов оставались одной высоты сделает обновление.»

11:56 UTC, Telegram 567: «Да кстати говоря ты же понимаешь что мы не просто интерфей сделаем а глубокое переключение? И насколько мы говорили если после того как будет создан хотя бы один элемент кроме руут пользователь попробует сделать переключение нужно вывести уведомления о том что домены которые были созданы ранее в противоположном режиме сохранят свое состояние (нужно исследовать так это или не так и без особых комментариев и общение со мной написать правильный тексты и действуют соответствующим образом)»

## Research (measured 11:57 — do not measure again)

- The type lives in the registry (`nodeType`), `lib/web4-items/node-type.cjs`. It decides: the birth look of NEW custom elements (`birthLook`: factory → own settings, project → under CONFIG); the node's one wallet on project (`lib/web4-items/node-wallet.ts`), elements' own wallets on factory (`ownWallets` names them, keys never erased); the Messenger section (h2a/h2h) hidden on project (`lib/web4-items/tree-context.ts`, all elements at once); tools «take» only on project (`app/api/node/tools/take`); `scripts/item-birth.mjs` :338 factory specifics.
- TRUE: existing elements never switch by themselves — the module's 🔒 «ТИП ЗАДАЁТ ТОЛЬКО ОБЛИК НОВЫХ КАСТОМНЫХ ЭЛЕМЕНТОВ»; `mismatches(type)` lists born custom (not native, not payment) elements whose `data/services/<id>/links.json` config differs from the type's default; one element is switched by `npm run node-type -- look <id> own|project` (the same door as the cards on its page). Root is not `born` in the registry — not counted.
- So the switch window (AppDialog, only when ≥ 1 born custom element besides root exists): what changes now (new elements' birth, wallet, Messenger), the list «уже созданные сохранят свои настройки» with each name, how to switch each (its page), how back (here). Without such elements — the press switches at once.
- The door `POST /api/node/type` exists (architect, admin; writes + revalidates); `GET` gives `mismatches` and `settingsUrl` — add the list of born custom elements with names.
- The Passport page `app/[lang]/(architectLayer)/architect/passport`: `content()` returns `[]` (the `nodePassport` section commented by 706-8 until Lagrix); visible now — only the child card «Как это работает». The old read-only `NodeMode` is in `components/dashboard/node-passport.client.tsx` (hidden with it). The new card = a new core section kind (e.g. `appMode`) returned first by `content()` — the six places of skill `use-sections`, modelled on `toolsTab` (`sections/kinds/tools-tab.server.tsx`, `components/tools-tab/*`, `sections/SECTIONS.json`, `sections/KINDS.md`, `sections/index.ts`, `lib/content/sections/types.ts`, `lib/content/sections/specimen.ts`, parts card).

I assume: «вкладка страницы архитектора» = the core's Passport page (it already shows the mode, read-only — 564); «один пользователь» =
`project`, «много пользователей» = `factory`; «Domino» = «домены» (voice typing).

## What is reused

- The door `POST /api/node/type` (architect, admin) — writes the type and revalidates the pages; `GET` gives `settingsUrl` (the configurator).
- `components/dashboard/node-passport.client.tsx` `NodeMode` — the read-only card today (564), replaced.
- The blue cards and round buttons of the panel (the Passport's «Как это работает» card, «Открыть раздел») — their tokens and Button variant.

## Substeps

### 782-1 · «Режим работы приложения» — the first blue card of the Passport
- The card replaces `NodeMode`, first at the top: blue like the other cards, no red; on the left — the text of the chosen mode (the
  owner's words, with the configurator link inside «один пользователь»); on the right — two round buttons one above the other,
  «Один пользователь» / «Много пользователей», the active dark blue, the other light blue. Both texts rendered in one grid cell, the
  hidden one invisible — the card keeps the height of the longer text, no jump. A press on the inactive button → `POST /api/node/type`.
- Proofs: eyes in both modes, the card's height equal (measured); a press changes `GET /api/node/type` (and back); negative — the
  temporary public address refuses the press.

### 782-2 · The configurator's red card goes away
- A task to the configurator's agent: remove its own switch card, leave one line «Режим работы приложения — в Паспорте ядра» with the
  link. Its code is its own (the core never edits an element).
- Proof: its page on the internet has no switch, the line with the link is there.

## Not included

- A confirmation window before switching (ask — the skill `node-type` wants three lines said before a change: what changes, for which
  elements, how back; the card's text says the first, the button press is the yes).
