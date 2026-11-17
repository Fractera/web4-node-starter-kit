# 771 — Telegram Mini Apps: the node's and every element's face inside Telegram (the owner's yes 2026-11-16 23:13: «Хорошо продолжай работать до конца меня больше не ищи пока не закончишь полностью»)

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

## Done in code — 771-1..3 (2026-11-16 23:15–23:45)
- 771-1 — no session is minted: every call of the panel carries Telegram's signed launch data, checked against the MAIN bot's token and
  its allowed chats, at most a day old (`webapp.check`, 768-4's lib). Simpler and safer than turning it into an architect cookie.
- 771-2 — the door `/api/node/tg-app` (GET the page, POST state | done | secret | power); `lib/node/tg-app/{state.ts,page.cjs,words.cjs}`;
  the power runner shared with the panel's door (`lib/web4-items/run-element-power.ts`); a required element has no switch.
  Decision: the Telegram surface is plain HTML + a little JS in Telegram's theme (the 768-4 form's way): no React bundle to load on a
  phone, no session, the node's words only through textContent. The panel on the computer keeps the core's primitives.
- 771-3 — `lib/node/tg-menu.cjs`: `setChatMenuButton` web_app «Пульт» at the HTTPS address (own domain first, the live tunnel next),
  commands without one; moved by the tunnel's one writer (`scripts/tunnel.mjs` saveAddress) and by `npm run tg-app -- menu`.
- Proxy: `/api/node/tg-app` public and allowed to write on the temporary address (it stands on the bot's signature).
- Tests: `scripts/tg-app.test.mjs` 6/6 (in prebuild); tsc 0; prebuild RC=0.

## Live after the build (core 88110b91, 23:28–23:35)
- M2 (half): the bot-wide default menu button answered ok and still read back «commands» — the button is set PER ALLOWED CHAT now; read
  back: `web_app «Пульт» → trucks-regulatory-requesting-sends.trycloudflare.com`. The owner's own tap on the phone — not yet seen.
- From the internet: GET the page 200; POST with forged launch data 401 «forged»; POST with launch data signed in-process by the main
  bot's token (never printed) — 200, asks 1, elements 12, limits 1; the same signature for another person — 401 «not-allowed».
- M3 eyes 390 px, light and dark, console clean: logs/eyes/2026-11-16T23-30-35-074Z.png, logs/eyes/2026-11-16T23-30-39-447Z.png (a
  10-minute test signature in the hash, removed after). Seen: an element's step «none.» — hidden now.

## 771-4..6 — stopped by a measured fact, not by time
- On this computer only the core is in the internet: the tunnel carries port 24680; an element's own site has no public address
  (`/ru/hrutb` through the tunnel is the core's page of the element; its own server answers only on localhost:24684). An element's Mini App
  therefore needs the own domain (an element = a subdomain), or a new core proxy to elements' ports — against «the node's composition and
  ports are never given out» (§6). «Соцсети пользователя» has no Telegram bot either.
- So the element half waits for the owner's choice: connect the own domain first (761 — the fresh launch is on the way), or allow a core
  route that serves an element's Mini App through the core's address. Ready meanwhile: the signature check (telegram-webapp.cjs) the
  verify door would reuse; the skill and the template part are written when the road is chosen.

## Redesign by the skill (the owner 2026-11-17 00:25: «возможно всё-таки нужно было использовать навык? Вот и идея правильная дизайн не
## хватает … красные подтверждение но отменить его никак нельзя»)
- Defect: «Выключить» armed a red confirm with no way back. Now a row opens on a tap; turning off asks «Выключить «X»?» with «Отмена» and
  «Выключить» side by side.
- interface-design pass: inset grouped lists in Telegram's way and its theme keys (section_bg_color, secondary_bg_color,
  destructive_text_color); the focal «Ждёт вас» ringed by the accent; the signature — the subscription's fuel gauge under the title;
  built-in elements fold under «Показать все · N» (shown: those off or running); haptics on taps; reduced motion respected.
- The open store's telegram-mini-app (sickn33, 1.8K installs) read 00:27: thin, aimed at TON and crypto payments, «risk: critical» —
  nothing taken.
- Eyes before the build (a local preview server on 127.0.0.1:41111 forwarding to the door, stopped after): 390 px light
  logs/eyes/2026-11-17T00-28-07-055Z.png, dark with a row opened logs/eyes/2026-11-17T00-28-11-694Z.png, console clean.
