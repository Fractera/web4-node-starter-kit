# 771 — Telegram Mini Apps: the node's and every element's face inside Telegram (plan, waits for the owner's yes)

The owner, 2026-11-16 20:56: «раз уже я больше большую часть времени собираюсь проводить в Telegram то возможно для наших элементов …
имела бы смысл создать отдельный инструмент Telegram приложения? … в зависимости от того какую функциональную задачу решает элемент …
удобный мобильный интерфейс … элемент для продвижения в соцсетях … дозорный … дашборд»; 23:09: «что ты сделаешь в итоге расскажи
правильно ли я тебя понимаю что у нас будет приложение».

## The shape (shape-the-need, answered 21:00)
- Not a new element and not one shared «Telegram app»: every element already has its own bot, pages and agent — its Mini App is one more
  route of that element, opened by its bot's menu button and built by its own agent. The core gets its own: the main agent's bot opens
  «Пульт узла».
- The capability is given once: the core (its own Mini App) and the custom template (every element), plus a skill for element agents.
- Mini App ≠ mobile version ≠ bot commands: no sign-in (Telegram signs who opened it), Telegram's theme and buttons; short «do / show»
  stays a chat command, cards and dashboards go to the Mini App.
- Price said aloud: a temporary address dies — the menu buttons die with it; a stable Mini App needs the own domain.
- skills_find (20:58, 21:00): no Mini App skill in the checked catalog; the open store's search is broken (`skills -- market --live`
  refuses every query — a defect to fix). Our own skill `telegram-mini-app`, written from core.telegram.org/bots/webapps (read again at
  771-5, the primary source).

## Substeps (core first: it proves the road with one build and no template release)
- 771-1 The sign-in road: a door turns Telegram's signed launch data (the main bot, a person of its allowed chats = the architect) into a
  short session of the architect's role, the same as signing in; reuses `lib/node/telegram-webapp.cjs` (768-4). Negative controls: forged,
  stale, another bot, another person.
- 771-2 «Пульт узла» — mobile pages of the core in the core's primitives: requests waiting for the person (the action window's cards,
  «Готово», the key form), elements with on/off and where their development stands, the subscription limit and money.
- 771-3 The menu button: the core sets the main bot's menu button (`setChatMenuButton`, web_app) to the HTTPS address and sets it again
  when `serve:publish` raises a new temporary address (the owner's word needed — it is a self-updating behaviour, §6).
- 771-4 The template: the same door with the element's own bot token, Telegram's theme bridged to the element's own design tokens (its look
  stays its own), a route group for its mobile pages; the core sets each element bot's menu button. Release custom + roll out.
- 771-5 The skill `telegram-mini-app` for element agents: when a job wants a Mini App and when a command, the sign-in door, the theme,
  MainButton/BackButton, the eyes at 390 px in both themes.
- 771-6 Proof on «Соцсети пользователя»: its agent builds its Mini App — posts as cards with «в черновик / опубликовать» over its own door.

## Tests (checklist shown to the owner before the build)
- M1 unit: the session door — valid launch data passes; forged / stale / another bot / another person refused.
- M2 live: the main bot's menu button opens «Пульт узла» on the owner's phone, no sign-in; a waiting request shows and closes from it.
- M3 eyes: 390 px, light and dark (Telegram's theme), console clean.
- M4 live: the temporary address changes → the menu button follows (after 771-3's yes).
- M5 live (771-6): an element's Mini App opens from its own bot and acts through its own door.
Price: two core builds, one custom-template release rolled to the custom elements, one element agent's session for 771-6.
