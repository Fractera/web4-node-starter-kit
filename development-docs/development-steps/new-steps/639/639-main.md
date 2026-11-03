# 639 — A clean Telegram chat: the interim disappears in 30 seconds, the summary stays (built; the live proof waits)

## 1. Retelling and decisions

The owner, 2026-11-03 21:33 UTC, verbatim: «Я сделал ещё одну проверку а именно попросил главного агента поставить задачу в агента root
а именно попросил поставить напоминание и это напоминание отработал отлично. Мы можем зафиксировать успех. Смотри какая проблема если мы
с тобой посмотрим на Ленку чата увидим очень много бессмысленных сообщений. Знаешь мне очень нравится идея что сообщения которые несут в
себе финального результата несут промежуточные результаты могут автоматически исчезать: –агент build включен//выключен - агент build
включени… - поставил задачу элементу… В общем тебе нет смысла наверно самому в ходе размышлений решить какие промежуточные решения и они
должны быть через 30 секунд удалены, а какие решения итоговые и должны остаться ? Понимаешь или нет мой проблемы посмотри на счёт скажи
что ты там видишь. Помнишь ты человеку приятно смотреть и видеть только важные задачи.»
21:38: «да, делай 639». 21:39, on my first list of six messages: «Ты хочешь зафиксировать только эти шесть записей которые достойны
удаления? Я расчитывал на то что ты сможешь отделить все промежуточные ответы которые уже существуют и будут создаваться позже от саммари
который всегда должна оставаться».

Retold: not a list but a rule that also holds for messages written later. Two kinds of messages reach the person's Telegram:
1. **The node's own messages** (the bridge, the bot slots, the progress hook). A service message — «the agent is on», «already off», a
   command done, an answered question — disappears 30 seconds after it is sent. A result, a question still waiting for the person and a
   trouble that needs their action stay. A waiting question disappears when it is answered, when a newer one replaces it, or when the
   session it is about closes.
2. **The agent's own replies** (the reply tool of the Telegram channel). In one turn — from a message of the person or of the node to the
   end of the agent's answer — only the LAST reply in a chat stays: the summary. Each earlier reply of that turn disappears 30 seconds after
   a later one is sent. A reply with files always stays.

Kept by design (unchanged): the scheduled notices of the core's notice door (⏰ 🟢 ⚙️, 636-8 — never deleted) and the A2A pairs «asks /
answers» (408-5 — the record of a call, sent at its result).

## 2. How it is built (core, uncommitted at the time of writing → see «Where it lives»)

- `kits/_agent-kit/core/server/telegram.cjs` (master; 14 copies by `npm run agent-kit:update`): `sendKept` and `sendVanishing` are the only
  two senders; `vanish` deletes a message after `TELEGRAM_VANISH_MS` (30 000). Classified: «on — write to it» vanishes, a start failure
  stays; «already off», «nothing to clear» vanish; the commands list and the OpenAI key's result stay; the status of a sleeping terminal
  vanishes, «the subscription is not signed in» stays; the start question stays until answered (both answers remove it) or replaced; «Sorry…»
  with buttons stays until answered; «Turn it off?» stays until a newer one replaces it or the session closes; «waiting in the terminal»
  stays until the session closes; «the channel did not connect» stays; the folder-trust question stays until answered or the session is
  gone (`clearTrust`), «trusted» vanishes. A question about a session lives in `data/node/telegram-until-session-ends.json`.
- `bridge.cjs`: the session's exit calls `telegram.sessionEnded(key)`; the progress hooks gain `UserPromptSubmit` and `Stop`.
- `telegram-slots.cjs`: the core's words through a slot bot stay; the slot's auto-answer «the bot is being built» vanishes.
- `lib/agent-kit/progress.cjs`: `keepLastOfTurn` — the turn file `data/node/progress/turn-<element>.json`; the last reply is the one with
  the largest Telegram message id in that chat (ids grow; background hooks may arrive out of order); the deletion waits in a detached
  process (`vanishLater`, the bot's key in its environment, never on the command line); it uses the element's OWN bot, so an element led by
  the main agent cleans its own replies too. Turn boundaries: `UserPromptSubmit` (a new message) and `Stop` (the answer ended; a turn that
  Claude Code starts by itself gives no `UserPromptSubmit`), the turn closed 2 s after `Stop` — the last reply's hook may still be running.
  The once-a-session hint vanishes; the relay advice with a link stays.
- `lib/agent-kit/chat.md` (via `modes.cjs` `chatText`, in every session with a person, not in a working process): the agent learns that the
  last reply of a turn is the summary — one message with everything the person must keep, no «Готово» tail after it.
- The guard (`lib/agent-kit/check.mjs`, in `prebuild`): every line that sends `sendMessage` in the kit's master, `lib/`, `scripts/`,
  `app/api/` carries «639: остаётся» or «639: исчезает» — a new message without the decision fails the build.
- Claude Code 2.1.317, read in its code: a Telegram message enters as a queued prompt (`mode: "prompt"`, `origin: channel`) without
  `skipSubmissionHooks`; a mid-turn message comes as an attachment of the running turn (no new turn).

## 3. Proof before the live run

1. The stub plane (`…/faa581fd-…/scratchpad/probe-639.cjs`, fetch stubbed, a temporary node root): 31 of 31 — `sendKept` sends and never
   deletes; `sendVanishing` deletes that very message with the same bot; a second «Turn it off?» removes the first; the session's end
   removes the last, a second end removes nothing; `clearTrust` removes the question with the main agent's bot, an old record without ids
   removes nothing; `sentIds` reads one id, parts, the MCP array, a failure (none); the turn: first reply — nothing, second — the first,
   a reply with files — the earlier text, a reply after files — nothing (files stay), a late hook with a smaller id — itself, a multi-part
   reply leaves whole; after `UserPromptSubmit` and after `Stop` the previous summary is untouched; a reply within the 2 s after `Stop`
   still belongs to the closing turn; the build and main-agent prompts carry the rule, the working-process prompt does not.
2. The detached deleter (`probe-639-child.cjs`, fetch stubbed through `NODE_OPTIONS`): no deletion at once, `deleteMessage` of message 50
   in chat 5001 after the delay, the key from the environment.
3. Negative control of the guard: before the marks, `check:agent-kits` failed on `lib/a2a/telegram-relay.ts:132` and
   `lib/main-agent-cron/notice.ts:58` (`===AGENT_KITS_FAILED=== ошибок: 2`); after — `===AGENT_KITS_OK=== копий в порядке: 14, долгов: 0
   … отправок в Telegram с решением 639: 6`.
4. The 42 core guards from `check-menu-icons` on: RC 0; `check-modes` OK.

## 4. The live proof (the owner's node, after «Sync fork» and `npm run node:update`) — at most three phrases

The person's plane: in the main agent's chat a task with an interim reply («найди в памяти что я говорил про чайник») — the interim lines
disappear within ~30 s, the answer stays; «включить» when the agent sleeps — «включён» disappears. The machine's plane: the core's log
and `data/node/progress/turn-build.json` (the ids marked `gone`).

## 5. Known limits
- Telegram lets a bot delete its message only within 48 hours; a deletion missed while the core restarts leaves the message.
- A turn that sends content first and the question after it keeps only the question — `chat.md` tells the agent to put both in the last
  reply; a reply with files stays.
- The person's own messages are never deleted.
- Not in 639: the elements' templates (their clocks send reminders — kept by design).

## Found on the way
- `scripts/check-boundary-hook.mjs` fails 2 of 18 (two heredoc cases «got allow», expected ask) — the same before 639's changes (checked
  on a stash); not in `prebuild`; to look into separately.
