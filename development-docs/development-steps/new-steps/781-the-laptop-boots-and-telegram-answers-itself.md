# 781 — the laptop boots, the agent and its Telegram wake by themselves, and every act of the person is a window

Status: approved and in work (one cycle). Repository: the core (`main`). The failure that started it, minute by minute:
`development-docs/reports/errors-the-main-agent-bot-went-deaf-after-the-reboot.md`.

## 1. The owner's words (verbatim, 2026-11-18 UTC)

- ~10:50: «Разрабатывай решение, которое ведёт вверху тревожный красный баннер если у нас существует Telegram основного агента который не
  подключился к сессии. Расскажи в нём что нужно делать и реши эту задачу механическим способом»
- ~10:55: «ноутбук стоит дома а пользователь с телефоном находится на работе … позвонит членов семьи чтобы они открыли ноутбук и включили
  его. После этого через несколько минут должен начать работать в Telegram … пользователь вообще должен забыть и существование ноутбука»
- ~10:39: «Telegram начинает писать сообщения какие-то размышления … сессия даже началась с его извинения … меня беспокоит эти случайные
  появляющиеся про пробуждение и засыпания»
- ~10:45: «в пульте телеграмма была реализована функция– сейчас бот спит. Разбудить бота нужно это сделать?»
- ~11:10: «каждый раз когда нужно вести ключ API, Taken логин или пароль, и многие другие вещи а самое главное команды который начинается с!
  Ты должен использовать внутреннее нативные уведомления … почему ты не вывел это уведомление автоматически? … есть ли у тебя сторож …
  Который ловит! В чате и проверяет создалось ли уведомление или может быть если оно не должно создаваться … то это должен быть
  сознательное отклонение также может быть нужно делать стороже на предмет ключей … чтобы после следующего пробуждения я всегда видел
  уведомления»
- ~11:10: «все три задачи мы решаем одновременно: – пробуждение агента при запуске компьютера – пробуждение телеграмма при запуске
  компьютера резерва при наличии кнопок в панели управления и в панели телеграмма если это возможно – финальная усиление контроля за
  передачей требований через уведомление в правом нижнем экране. Повтори план для всех этих задач разбей его и реши за одну цикл» —
  read as the yes to build all three in one cycle.

My decisions (one line each):
- At boot the main agent comes back by itself only if it was running when the computer went down (708 session-lost, made reliable here);
  otherwise it sleeps and wakes on the first message, the Pult's «Разбудить» or /on — an idle session nobody asked for is not born.
- Autostart is written by the core on the person's press (a window button or the Pult), never by the agent: the agent's permissions
  rightly refuse system persistence, and a press is the person's consent.
- The guard covers the main agent's sessions in the core folder (terminal and Telegram); elements get it with a template release, on
  the owner's word.

## 2. Why the person had to remind me about the window (measured)

The rule exists in three places — CLAUDE.md §6, the skill `act-with-the-person`, my memory `action-notice-on-screen` — and none is
mechanical. Claude Code's own system prompt tells every session «suggest they type `! <command>`»; in the morning I followed it and never
loaded the skill. Nothing read my answer. A rule only in text loses to an instruction that arrives in every session.

## 3. Known limits

- No timers nobody ordered: the channel watch is ordered here; it reads one file every 2 s, no network, no model.
- The architect's pages ask nothing without a click — the red band rides the action window's existing poll.
- `~/.claude/settings.json` and `~/.claude/mcp-needs-auth-cache.json` are the person's: one key each, an unknown format left untouched.
- A restart for healing waits until the session is idle (`whenIdle`) — a turn in flight is never cut.
- The Pult door stays public with the bot token's signature as its only lock; the panel door — the architect role.
- A Stop hook that blocks may loop: `stop_hook_active` true → allow and log (Claude Code also caps repeated blocks).

## 4. Substeps

### 781-1 · «Hears» is a fact, on every start path
- `kits/_agent-kit/core/server/bridge.cjs`: one watch for EVERY session launched with the channel (terminal page, session command, wake):
  30 s grace from the start (extended while the folder-trust question is on screen), then deaf after 20 s without a live `bot.pid`
  written after the start → `s.deaf`; `telegram.running()` = channel AND not deaf; a state file
  `data/services/<id>/channel-state.json` {state hears|deaf|asleep, since, why}; the log names who started a session.
- Done: a session whose plugin was skipped is never counted as hearing.
- Proofs: poisoned cache → a start from the terminal page → «deaf» in ≤ 50 s and the node reads the bot (negative: a clean start → «hears»).

### 781-2 · The poison cannot come back
- Before every channel launch and at the core's start: the Telegram plugin → false in `~/.claude/settings.json` (backup once in
  `data/node/claude-settings.backup.json`), the `plugin:telegram:telegram` entry removed from the failure cache of that Claude home;
  the progress hook drafts only while the plugin is alive (no «thoughts» from a deaf agent).
- Proofs: poison by hand → a launch → plugin up (negative: the removal off → «Skipping»); a deaf session → no drafts sent.

### 781-3 · A deaf session heals itself
- Deaf → wait until idle → the same conversation restarted with `--continue` once → still deaf → closed, the node reads the bot, the
  person gets «Извините…» with «Разбудить» in the Pult. Messages sent meanwhile wait at Telegram and arrive (the plugin keeps pending
  updates).
- Proofs: `kill <plugin pid>` of a live session → a new `bot.pid` in ≤ 60 s, a message answered (negative: a healthy session never restarts).

### 781-4 · Reserve buttons: the Pult and the panel
- One door `POST /api/node/main-channel` (architect) and the Pult action `channel` (signed): «wake» (asleep → start, continuing the last
  conversation when it can) and «reconnect» (deaf → the 781-3 heal now). `GET` the state.
- The Pult's main-agent card: «слушает» · «спит — Разбудить» · «не слышит — Переподключить».
- The panel: a red band on top of every panel page while the main agent is deaf — the cause in words, what the node did, «Переподключить»;
  its data in the action window's poll (`/api/node/person-asks` carries `channel`).
- Proofs: `npm run eyes` of the band and of the Pult card in each state; the button turns «deaf» into «hears» (negative: healthy — no band).

### 781-5 · Power on → the node is up, no sudo
- `scripts/serve.mjs autostart` on macOS writes the node's own user LaunchAgent `~/Library/LaunchAgents/ai.fractera.node.plist`
  (RunAtLoad → `pm2 resurrect`, full paths, `AbandonProcessGroup`, logs in `logs/boot-*.log`); `serve:status` names it; `pm2 save`
  only when every on-element is online. The person's consent: a window kind `--action autostart` («Включить автозапуск» button → the
  core writes it) and the Pult row «Автозапуск».
- Proofs: `launchctl print gui/<uid>/ai.fractera.node` loaded + the real reboot with the owner (negative: no plist → nothing starts,
  status says so).

### 781-6 · «Компьютер включился» in Telegram
- At the core's start within 15 minutes of the machine's boot, once per boot (`data/node/boot.json`): one line to the main agent's bot
  through the node's Bot API — the node is up, and whether the agent is back in its conversation or sleeps until a message.
- Proofs: a boot time newer than the record → the line sent once (negative: a core rebuild later → silent).

### 781-7 · The window guard
- `lib/agent-kit/window-guard.cjs` (pure): a person's act in text — a `! command`, `sudo`, `/mcp`, `/login`, an imperative to type, paste or
  send a key, token, password, code or login, «run in the terminal» (ru, en).
- `.claude/hooks/window-guard.mjs`: Stop — the turn's text has an act and the turn ran no `npm run ask-person` → the stop is refused with
  the way (the window with `--copy`/`--hint`, then one chat line); PreToolUse on the Telegram `reply` — the same, denied; a conscious
  deviation is the line «⟦без окна: <why>⟧» in the answer — allowed and logged; every refusal and deviation goes to
  `data/node/window-guard.jsonl`; SessionStart — one line: here the person's act is the window, Claude Code's own `!` advice does not apply.
- `scripts/window-guard.test.mjs` in prebuild; the skill `act-with-the-person` names the guard.
- Proofs: a fixture answer with `! npm run x` and no window → refused (negative: with an ask-person call or the marker → allowed); live:
  my next answer that asks for a command is refused until the window exists.

## 5. Order and the address of the work

781-7 (it guards the rest of this very cycle) → 781-1 → 781-2 → 781-3 → 781-4 → 781-5 → 781-6 → `agent-kit:update` for every group →
prebuild RC=0 → ONE core rebuild → the proofs → the reboot test with the owner. Everything in the core repository, branch `main`.

## 6. Not included

- The guard in element sessions (a template release, on the owner's word).
- Who woke or put the agent to sleep, told in one place (core-back, session-lost, timeout, done).
- macOS automatic login, Wake-on-LAN, staying alive with the lid closed; a dedicated server is the full answer for «the laptop is off».
