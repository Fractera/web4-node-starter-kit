# 798 — every node has its own bot factory

The owner, 2026-11-18, Telegram 782–790. Status: PLAN — waits his «да». Replaces fork A/C of 786 (786-2..4 not built).

## The owner's words

- 786: «мне нужно системное решение а не просто сейчас один раз как люди это будут делать? Партнёры?»
- 788: «у нас два места где мы создаем этого супер бота? … в своем левом меню на вкладке ядро для себя … А также при развёртывание
  нового сервера для этого сервера? И ты добавишь в оба действия определённый шаг … человек прочитает задачу и подтвердит чеклист» —
  confirmed (789), «Да» to writing the plan (790).

## The fact it stands on (primary source, read 2026-11-18 13:3x, step 786-1)

Bot API 9.6 (2026-04-03, https://core.telegram.org/bots/api-changelog), «Managed Bots» (https://core.telegram.org/bots/features): a bot
with Bot Management Mode (BotFather → the bot's settings; `getMe.can_manage_bots`) creates bots for a person by the link
`https://t.me/newbot/{manager}/{username}?name={name}`; the person confirms in Telegram's own window; the manager gets the update
`managed_bot` and takes the token by `getManagedBotToken`; `replaceManagedBotToken` reissues it. The Claude Telegram plugin of the main
bot drops that update (measured, 786-1) — so the manager is a separate bot that talks to nobody.

## The shape

- Every node — this one, a partner's, a dedicated server — has its OWN factory; its token and the tokens of the bots it makes stay on
  that machine (`data/node/bot-factory.json`, outside git, never logged — the last 4 only). No shared Fractera factory: it would hold
  every person's bot keys and be a single point of failure (CLAUDE.md §2).
- The one bot a person makes by hand is the factory (today it is the main bot — the count stays one); the main bot and every element's
  bot come from it with one tap. The hand road (@BotFather → token) stays as the fallback everywhere.
- The node listens to the factory only while a creation waits (≤ 10 min, a short poller with `allowed_updates: ["managed_bot"]`), no
  resident process.

## Substeps

- **798-1 The factory module** `lib/node/bot-factory.cjs`: `save(token)` (getMe: a bot, `can_manage_bots` true — else the named
  switch is missing, nothing kept), `state()`, `createLink(name, username)`, `await(ms)` → the new bot's token by `getManagedBotToken`,
  `reissue(botId)`. Proof: a test with a stubbed Telegram (good / not a bot / management off → nothing written); then live with his
  factory: `getMe.can_manage_bots` true.
- **798-2 The core's «Telegram-бот» page** (`architect/build/telegram`): a new first step «Бот-фабрика» — the task in points (open
  @BotFather → /newbot → the name and address ready to copy → the bot's settings → Bot Management Mode → paste the token), the
  person's checklist, and the node's own check (the step closes only on `can_manage_bots`; off — it names the switch). Then «Создать
  главного бота одним касанием» (the link, the wait, the token into the main channel as `saveToken` does); the hand form folded below.
  **First live proof here:** the main bot made by the factory answers through the Claude Telegram plugin (a message reaches me).
- **798-3 The server's page** «Активация выделенного сервера», next to its bot step: «Бот-фабрика сервера» in the page's own style — the
  same task, checklist and check, the token goes to the server (the road of 2069b172), the server's bot then by one tap.
- **798-4 The Pult** (786-3/4 rebuilt on the factory): in an element's open card — «Создать бота» (one tap, the element's name and a
  free address), after — «Открыть бота», «Обновить» (`replaceManagedBotToken`, no @BotFather); a token of another element's bot refused.
- Each substep: prebuild RC=0, one core build, proofs, commit; 798-3 also reaches the server by its own update.

## Proofs (two planes each)

- Wire: getMe of the factory `can_manage_bots: true`; a made bot's getMe answers with its token; negative — a factory token with the
  mode off is refused and nothing is written (mtime of `data/node/bot-factory.json`).
- Eye / live: the step on the page (eyes), his tap in Telegram's window, the new bot's message reaching its agent.

## Not in it

- The four extra slots of an element (h2h, orders, work) — later, on the same factory.
- Bots of people near the architect (integrator) — later, on the same factory.
