# 708 — a conversation cut by accident is continued, not lost

The owner 2026-11-09: «У нас ещё остается механическая прерывание когда например по ошибке пользователь закрыл то есть остановил
терминал или просто разрядился компьютер … моя идея заключается в том чтобы не несколько последних сообщений пробрасывать в локальные
хранилище браузера а в твоей инструкции сделать обновления что в случае запуска когда речь идёт о том чтобы например: – продолжай с
того же места ты пытаешься прочитать какие-то файлы … Так же точно и с элементами». Then «go» to the plan.

## Facts (measured 2026-11-09)

- Claude Code writes every message of a session at once to `~/.claude/projects/<folder>/<id>.jsonl` (an element on its person's
  subscription — in its own Claude folder). The session the lid killed at 13:45 lies there whole (3.2 MB). Every folder has its own.
- The node already continues a conversation: `spawnAgent(..., { continueLast })` → `claude --continue` (core-back after a build, model
  switch). The «Start the agent» button and the bot's /on always start a NEW session — the person gets only the brief and the last
  exchange. That is the «only part of the conversation» of the morning.
- `session-mode.json` is written `running: true` at the start and reset by the bridge when the process ends; if the core itself dies
  (power, killed core) the record stays `running: true` — the signal of a lost session.
- Browser storage is rejected: the agent cannot read it, Telegram and other devices do not have it, clearing it erases it, a reply cut
  mid-word never reaches it, and it would be a partial copy of what is whole on disk.

## Substeps

- **708-1 The end is named.** `session-mode.json` keeps how the last session ended: `closed` (done --close, «выключить», the bot's
  /off), `stopped` (the Stop button), `exited` (the process ended by itself), `lost` (the core's start finds `running: true` and no build
  record of 675/707 — power, a killed core). One field, written by the bridge and the core's start; no timer, no new process.
- **708-2 The terminal offers to continue.** The sleeping card of every agent (the kit is shared — the core and all elements): the folder
  has a conversation and its end was not `closed` → main button «Продолжить разговор» (`--continue`), second «Новый разговор»; after a
  clean close the order is reversed. The button shows how full that conversation's window is (the `session -- context` measure); above
  80 % the main button becomes «Новый разговор» with the letter (the state record), and says why.
- **708-3 Telegram the same.** The bot's /on («включи») after an unclean end continues the conversation and says so in one line; after a
  clean close — a new session, as today.
- **708-4 «Продолжай с того же места».** A line in the core's instruction §4 (the owner's word — resealed) and the element template's
  instruction (next template release): read the state record first; if it is not enough, the tail of the previous conversation —
  `npm run session -- tail [<id>]`, the last turns' words only, no tool outputs.
- **708-5 Proofs, two planes.** (a) kill the main agent's `claude` mid-answer → the card shows «Продолжить разговор» → pressed → the same
  conversation (same transcript file, it knows the last words); (b) the same for an element (s8y6x); (c) Telegram /on after a kill;
  (d) negative: after `done --close` the main button is «Новый разговор»; (e) stop the core process (a power cut stand-in) → start →
  `lost` → continue. Screenshots by eyes.

## Open — the owner chooses

- A: buttons only (708-1..5).
- B: A + after a `lost` session the MAIN agent comes back by itself when the core starts, like after a cut build (elements by buttons).
  My pick: B — the person talks to the main agent; after a power cut the computer comes up and I am there, in the same conversation.
  **DECIDED 2026-11-09 by the owner: «b».**

## Code map (read 2026-11-09, no code written yet)

Kit master `app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/server/`:
- `session.cjs` `stop(service, reason)` deletes the session from the box BEFORE kill, so `bridge.cjs` `child.onExit` (line ~399) cannot
  tell the reason → 708-1: `stop` sets `s.endReason = reason` before `kill`; onExit writes `resetMode(element, born.endReason ?? 'exited')`.
- Reasons today: 'stopped' (Stop button: api/session/route.ts.tpl:67, app/api/agents/sessions/route.ts:49), 'closed-by-agent'
  (done --close, bridge.cjs:890 — «выключить», npm run close), 'closed-woken-by-main', 'model-switch', 'channel-failed'.
  Clean = closed-*; unclean = stopped, exited, lost; model-switch/channel-failed are restarts — not offered.
- `writeMode` at spawn (bridge.cjs:372) running:true; `lost` = the core's start (instrumentation → lib/deploy/agent-return.cjs
  afterCutOff) sees running:true with no agent-return.json → for MAIN (decision B) wake with continueLast like core-back; elements: mark
  `why: 'lost'` only.
- Continue = `spawnAgent(..., { continueLast: hasConversation(...) })` (bridge.cjs:648). Wake door `wake()` (bridge.cjs:768) already takes
  continueLast → 708-3: /on continues when the last end was unclean.
- Client: `core/client/agent-terminal.client.tsx` sleeping card, words `core/words/agent-terminal.i18n.ts:117` («Терминал спит»,
  «Запустить агента»); the start goes through the ticket (`ticket.cjs`) → needs a `continue` flag. Fill %: `scripts/main-agent-cli.mjs:527`
  (`session -- context`).
