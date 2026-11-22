# 840 — the Pult and the element Mini App in one design, in one release

## 1. Retelling and decisions (the owner, Telegram, 2026-11-22)

- 942: «давай уже приведём наш пульт к согласованному дизайну … более смелое цветовая схема … на каждом элементе сразу видно его учетную
  запись размер по текстового окна на сколько оно израсходована расход подписки … кнопка назад она не кликабельно это тоже исправь».
- 947: «при нажатии я перехожу в чат но сообщения чата не содержит предустановленного сообщения а должно».
- 951 «Да» to the layout (943) · 953 the phrase list 1–14 · 954 adds to the element Mini App: limits 5 h / 7 d, model choice like the
  main agent, an intro text closed by «Прочитано» · 955 phrases 15–17 · 956: «построй уже наконец этого восхитительное приложения …
  сейчас делай то что мы согласовали» = the yes to 1–17 and to this plan.
- Telegram cannot prefill the chat input (core.telegram.org/bots/webapps: switchInlineQuery inserts «@bot query», sendData only for
  keyboard buttons) → the element's own bot sends the line.

## 2. Substeps

- 840-1 core: `GET /api/node/my-agent` adds the element's own limits (own-<id>.json, or node.json on the node's subscription); `POST`
  switches its model (Opus/Sonnet/Haiku, Opus efforts; no Ultracode for an element) through the agent kit, refused while asleep.
- 840-2 core: the Pult — a coloured letter tile per element (palette by id), the second line «account · контекст N % · 5 ч N %»,
  badges «работает · ждёт · спит · собирается · не вошёл в Claude», «контекст —», «без входа в Claude».
- 840-3 core: the subscription page — status line + one checklist (phrases 8–12).
- 840-4 template: Telegram Back (every receiver Telegram calls + the parent screen, never a dead history.back), the chat line through the
  element's own bot to the Telegram id of the ticket, fuel under the agent card, model choice, the intro card «Прочитано» / «Как начать».
- 840-5 release custom template, pin, roll out (root, etuf1 on a server via update), one core build, eyes 390 px light/dark, push, proofs.

## 3. Proofs (two planes each)

- 840-1: curl with an element key → limits of that element only; another element's key never sees it (negative); POST bad model → 400.
- 840-2/3: eyes screenshots 390 px; `node -e` render of page.cjs with a fixture state contains the tiles and lines; a fixture without
  context prints «контекст —».
- 840-4: a test that the context door answers 401 without a session (negative) and builds the right line; eyes of the Mini App with
  a simulated `TelegramGameProxy.receiveEvent('back_button_pressed')` moves to the parent screen.
- 840-4 committed in the workshop 8daf334; release custom v0.3.238 starting 20:49 UTC
