# 782 — the app mode switch moves from the configurator to the core's Passport

Status: plan, waits the owner's «да». Repository: the core (`main`); the configurator's own card — its agent, in its repository.

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
