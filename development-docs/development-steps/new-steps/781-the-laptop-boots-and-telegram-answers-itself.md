# 781 — the laptop boots and the main agent's Telegram answers by itself

Status: plan, rewritten after the deep research (10:40–11:05 UTC on Opus · max), waits the owner's «да». Repository: the core (`main`).
The failure itself, minute by minute, with evidence: `development-docs/reports/errors-the-main-agent-bot-went-deaf-after-the-reboot.md`.

## 1. Retelling and decisions (verbatim)

- 2026-11-18 ~10:50, the owner: «Разрабатывай решение, которое ведёт вверху тревожный красный баннер если у нас существует Telegram
  основного агента который не подключился к сессии. Расскажи в нём что нужно делать и реши эту задачу механическим способом»
- ~10:55: «это не маленькая проблемка это гигантская проблема … ноутбук стоит дома а пользователь с телефоном находится на работе. Если
  мы необходимо включиться он позвонит членов семьи чтобы они открыли ноутбук и включили его. После этого через несколько минут должен
  начать работать в Telegram … аварийные решения мы должны рассмотреть как частный случай но основная задача именно такая пользователь
  вообще должен забыть и существование ноутбука»
- ~10:39: «я периодически вижу как Telegram начинает писать сообщения какие-то размышления наша сессия даже началась с его извинения о
  том что сессия прервалась и тем не менее до сих пор Telegram не включён … меня беспокоит эти случайные появляющиеся про пробуждение и
  засыпания»
- ~10:45: «Аналогичным образом можно подумать о том, если можно чтобы в пульте телеграмма была реализована функция– сейчас бот спит.
  Разбудить бота нужно это сделать?»

The main result: power on → a few minutes → the bot answers, no command typed. Deafness heals by itself; the Pult and the red banner
are the faces of the rare case it cannot.

## 2. Causes (from the report)

1. The Telegram plugin is on for the whole machine again (614-2 broke on the plugin's reinstall 2026-11-16 16:19); any outside session
   starts it without a token and poisons the machine-wide failure cache for 15 minutes.
2. `telegram.running()` trusts the launch flag, not the plugin's live `bot.pid` → a deaf session silences the node's own poller.
3. `watchChannel` covers only `wake(hold)`; the terminal page and the session command (model, clear) never check the channel.
4. The progress hook drafts into the chat even when the agent cannot hear — «thoughts» without ears.
5. No macOS autostart without sudo.

## 3. Known limits

- No timers nobody ordered: the channel watch is ordered here by the owner; it reads one file every few seconds, no network.
- The architect's pages ask nothing without a click — the banner rides the action window's existing poll (`person-ask.client.tsx`).
- `~/.claude/settings.json` and `~/.claude/mcp-needs-auth-cache.json` are the person's Claude Code files: ONE key each (the Telegram plugin
  → false; the `plugin:telegram:telegram` entry removed), a format we do not recognise is left untouched and logged.
- Autostart is system persistence: written once after the person's yes (`npm run ask-person`), never silently.
- macOS with FileVault asks the account password at power-on: the family member types it; automatic login is the person's choice.
- The Pult door is public (phone over HTTPS) — its lock stays the bot token's signature (`app/api/node/tg-app/route.ts`).

## 4. Substeps

### 781-1 · «Hearing» is a fact, checked on every start path
- Built: `running()` = live session AND a live plugin `bot.pid` written after the session's start (the check `freshPid` already in
  `bridge.cjs`); `watchChannel` for EVERY session launched with the channel — the terminal page, the session command (model, clear),
  the wake — not only `hold`; a start without a held task watches too and on failure closes, gives the bot back to the node and tells
  the person. The terminal page and session starts get a log line `[agents/start] build by=<terminal|session|wake>`.
- Done when: a session whose plugin was skipped is never counted as hearing on any path.
- Proofs: (a) poison the cache by hand → start from the terminal page → in ≤ 30 s the log says «канал не встал», `idleTick` reads the
  bot (a phone message gets the node's «Запустить» buttons); negative control: a clean start → «канал встал», the node silent.
  (b) the same through `npm run session -- model opus`.

### 781-2 · The poison cannot come back
- Built: at the core's start and right before every channel launch — the plugin key → false in `~/.claude/settings.json` (614-2 holds
  again, a backup once in `data/node/claude-settings.backup.json`) and the `plugin:telegram:telegram` entry removed from
  `~/.claude/mcp-needs-auth-cache.json`; the progress hook drafts only while the plugin pid is alive.
- Done when: an outside Claude session cannot poison, and a poisoned cache never blocks a node start.
- Proofs: (a) poison by hand → a node start → plugin up ≤ 15 s; negative control: the same with the removal switched off → «Skipping».
  (b) `claude -p hi` in `/tmp` → no new plugin log under that folder's cache; before the fix it writes one.

### 781-3 · A deaf session heals itself
- Built: in a live channel session the plugin pid disappears (plugin crashed, the network dropped it) → 20 s → the cache entry removed,
  the same conversation restarted with `--continue` once; still deaf → closed, the node reads the bot, one Telegram line through the
  node's own Bot API: what happened, what the node did, how to wake it (/on or the Pult).
- Done when: killing the plugin of a live session brings the bot back with no hand.
- Proofs: (a) `kill <bot.pid>` → in ≤ 60 s a new `bot.pid` and a phone message answered; (b) log `[channel] deaf → restarted → up`;
  negative control: a healthy session over 30 minutes — no restart line.

### 781-4 · The Pult: «Главный агент спит — разбудить?» (the owner's idea)
- Built: the Pult's main-agent card gets its state from one model-free answer — «слушает» · «спит» (no session) · «не слышит» (session
  without a live plugin) — and the button «Разбудить» (asleep) or «Переподключить» (deaf): a new action `wake` of the Pult door → the
  781-3 path (or a plain start with `continueLast`). Works while the plugin is down: the Pult talks to the node over HTTPS.
- Done when: from the phone, with the agent off or deaf, one tap brings a hearing agent.
- Proofs: (a) agent off → the Pult says «спит» → «Разбудить» → `bot.pid` alive, a message answered; (b) `npm run eyes` of the Pult page
  with each of the three states; negative control: a hearing agent shows no button.

### 781-5 · Power on → the node is up → «Узел включился», no sudo
- Built: on macOS `serve:autostart` writes the node's own user LaunchAgent (`~/Library/LaunchAgents/ai.fractera.node.plist`, RunAtLoad
  → `pm2 resurrect` with full paths, output in `logs/boot-*.log`) — no sudo; `pm2 save` only when every on-element is online; asked
  once by a window at install and on the panel while it is missing; after a boot the node sends one line «Узел включился — пишите» to
  the main agent's bot. Linux keeps `pm2 startup` (systemd), Windows its Startup folder.
- Done when: a real reboot, no command typed → the Telegram line arrives and a message is answered.
- Proofs: (a) `launchctl print gui/$UID/ai.fractera.node` + the reboot test with the owner; (b) `logs/boot-*.log` with the boot time;
  negative control: the plist removed → nothing starts, `serve:status` says «автозапуск выключен».

### 781-6 · The red banner — the panel's face of the rare case
- Built: when the main agent has a bot and its state is «не слышит» after 781-3 gave up — a red band on top of every panel page: the
  cause in plain words, what the node already did, «Переподключить» (the same action as the Pult), and «или /mcp → telegram →
  Reconnect в терминале». Data in the action window's existing poll (`/api/node/person-asks` carries `channel`); shadcn `Alert`
  destructive, `data-block`, texts through translations.
- Done when: the deaf state shows the band within one poll; the button heals it; the band leaves.
- Proofs: (a) `npm run eyes` screenshot with the band (cache poisoned, plugin killed); (b) after the button the door says «слушает» and
  the screenshot has no band; negative control: a healthy node — no band.

## 5. Order

781-1 → 781-2 → 781-3 (the deafness, the biggest pain) → 781-4 (the phone's face) → 781-5 (the boot) → 781-6 (the panel's face). One core
rebuild at the end of the queue, then the reboot test with the owner.

## 6. Not included

- Who woke or put the agent to sleep, told to the person in one place (core-back, session-lost, timeout, done): a separate step after
  this one, if the owner wants it.
- macOS automatic login, Wake-on-LAN, staying alive with the lid closed — the next question; a dedicated server is the full answer for
  «the laptop is off» (skill `dedicated-server`).
