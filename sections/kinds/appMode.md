# appMode — the app mode of the node: one user or many users

**Type:** Workspace. The first card of the architect's root page (the overview), above «Три действия, чтобы начать» (node step 782).
The configurator's own switch card went away with it.

**Слова владельца, 2026-11-18 12:43 (Telegram 597):** «это не для страницы паспорта это для корня страницы архитектора посмотри там сейчас
существуют три карточки это должна быть четвёртая» — first built on the Passport by my reading of «вкладка страницы архитектора», moved.

**Слова владельца — the owner's words, 2026-11-18 (Telegram 565):** «первую верхнюю голубую вкладку с переключателем. Переключатель можно выполнить виде такой
же круглой кнопки какая на остальных карточках. Но поставить две одну над другой активной подсвечивается тёмно-синем как и все другие
кнопки неактивные светло голубым карточка тоже пусть будет голубой без всякого красного цвета … Старайся чтобы карточки не прыгали по
высоте при переключении различных режимов».

**Telegram 567:** «мы не просто интерфейс сделаем а глубокое переключение … домены которые были созданы ранее в противоположном режиме
сохранят свое состояние». **Telegram 574:** «переключатель должен иметь подтверждающий окно в любом случае … либо отменяет и там более
подробное описание что сейчас произойдёт».

## What it draws

A tinted card like `docref`'s: the title, on the left the text of the chosen mode («один пользователь» carries the configurator link), on
the right two round buttons stacked — the active one `bg-primary`, the other `bg-primary/15`. Both texts live in ONE grid cell, the hidden
one `invisible`: the card keeps the height of the longer text and never jumps.

## Rules

- 🔒 Every press opens AppDialog: what changes now (birth of new elements, the wallet, the Messenger section, tools) and, when born custom
  elements exist, each by its name with «under the configurator» / «own settings» — they keep their state (`node-type.cjs`).
- 🔒 No red on this card: a refusal or a failure is muted text under the buttons.
- The switch is the door `POST /api/node/type` (architect, admin). The temporary public address is read-only — the press is refused.
- One per page; it belongs to the architect's root page only.
