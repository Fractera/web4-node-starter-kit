# 781 — the laptop boots and the main agent's Telegram answers by itself

Status: plan, waits the owner's «да». Repository: the core (`main`).

## 1. Retelling and decisions (verbatim)

- 2026-11-18 ~10:50 UTC, the owner: «Разрабатывай решение, которое ведёт вверху тревожный красный баннер если у нас существует Telegram
  основного агента который не подключился к сессии. Расскажи в нём что нужно делать и реши эту задачу механическим способом»
- 2026-11-18 ~10:55 UTC, the owner: «это не маленькая проблемка это гигантская проблема … ноутбук стоит дома а пользователь с телефоном
  находится на работе. Если мы необходимо включиться он позвонит членов семьи чтобы они открыли ноутбук и включили его. После этого
  через несколько минут должен начать работать в Telegram … аварийные решения мы должны рассмотреть как частный случай но основная
  задача именно такая пользователь вообще должен забыть и существование ноутбука»

So the main result is: power on → a few minutes → the bot answers, with no command typed. The red banner is the emergency case.

## 2. What happened on 2026-11-18 (measured — do not measure again)

1. After the reboot nothing came up: no pm2 autostart on this Mac (no plist in `~/Library/LaunchAgents`); `npm run serve:autostart`
   only prints a `sudo` line (scripts/serve.mjs `autostart()`), nobody ran it. An outside agent did `pm2 resurrect` at 10:15.
2. The bot went deaf. A Claude session opened in the home folder at 10:14:10 started the GLOBALLY enabled Telegram plugin
   (`~/.claude/settings.json` `enabledPlugins["telegram@claude-plugins-official"]: true`, written 2026-11-16 16:19 with the plugin's
   reinstall), it died «TELEGRAM_BOT_TOKEN required», and Claude Code put `plugin:telegram:telegram` into the machine-wide failure
   cache `~/.claude/mcp-needs-auth-cache.json` (10:14:12). The main agent's session then logged «Skipping connection (recent failure
   cached…)». This is the 614-2 failure again: 614-2 relied on the plugin being off globally, and a reinstall turned it back on.
3. `telegram.running(service)` = «session live AND started with the channel flag» — it does not look at the plugin's `bot.pid`. A
   session whose plugin was skipped counts as «bot running», so the node does not read the bot either: the person's messages go nowhere.
4. The domain tunnel's exits (code 1, 00:43–00:48) were DNS lookups failing as the laptop went offline — not a defect.

## 3. Known limits

- Laws: no polling or timers nobody ordered — the watch below is ordered by the owner here; the architect's pages ask nothing without a
  click — the banner rides the existing poll of the action window (`components/architect/person-ask.client.tsx`), no new timer;
  never read `.env.local`; one modal; texts through translations; a component ≤ 250 lines.
- `~/.claude/settings.json` is the person's file: we change ONE key (the Telegram plugin → false), as 614-2 decided, nothing else.
- Autostart is system persistence: written once, after the person's yes in an on-screen window (`npm run ask-person`), never silently.
- macOS with FileVault asks the account password at power-on: the family member types it (or the person turns on automatic login —
  their choice, said aloud, never done by us).

## 4. Substeps (each sliced through all layers, each with something to show)

### 781-1 · One model-free answer to «does the main agent's bot hear?»
- Built: `lib/node/main-channel.cjs` — `health()` → `{ bot, session, flagged, pluginPid, cachedFailureAt, globalPluginOn, state:
  'ok'|'deaf'|'no-session'|'no-bot', cause }`; `telegram.running()` also requires a live `bot.pid` written after the session start;
  `npm run person` uses `health()`; door `GET /api/node/main-channel` (architect, loopback).
- Done when: today's case reads `deaf` with cause `cached-failure` + `global-plugin-on`.
- Proofs: (a) the door on this node now → `deaf`; negative control: after a healthy session start → `ok`. (b) a fixture test of
  `health()` over a temp home with and without the cache key.

### 781-2 · The poison cannot come back
- Built: at `serve:start` and before every session the node spawns with the channel: the Telegram plugin key → false in
  `~/.claude/settings.json` (only that key; a backup of the file first, once); the `plugin:telegram:telegram` key removed from
  `~/.claude/mcp-needs-auth-cache.json`.
- Done when: a Claude session in the home folder no longer starts the plugin, and a poisoned cache never blocks a node session.
- Proofs: (a) poison the cache by hand → spawn the main agent → `bot.pid` alive in ≤ 15 s. (b) `claude` in `/tmp` → no new
  `mcp-logs-plugin-telegram-telegram` file under that folder; negative control: before the fix the same run writes one.

### 781-3 · The node heals a deaf session by itself
- Built: the bridge watches a live session started with the channel: no live `bot.pid` for 20 s → clear the cache key, restart the
  same conversation (`--continue`) once; still deaf → the session is closed, the node reads the bot again (a message wakes a fresh
  session, as today) and the person gets one Telegram line through the node's own Bot API (no plugin needed): what happened, that it
  was fixed or what the node does next.
- Done when: a deaf main session comes back hearing with no hand on the computer.
- Proofs: (a) kill the plugin process of a live main session → within 60 s a new `bot.pid`, a message from the phone answered.
  (b) the node's log lines `[channel] deaf → healed`; negative control: a healthy session is never restarted (log silent for 30 min).

### 781-4 · Power on → the node is up → the bot answers, no sudo
- Built: `serve:autostart` on macOS writes the node's own user LaunchAgent (`~/Library/LaunchAgents/ai.fractera.node.plist`,
  RunAtLoad → `pm2 resurrect` with full paths, logs in `logs/`) — a user agent needs no sudo; `pm2 save` only when the list is
  complete (all registered on-elements online); the first install asks once with a window («Запускать узел при включении
  компьютера?»); after a boot the node sends one Telegram line «Узел включился, пишите» through its own Bot API.
  Linux keeps `pm2 startup` (systemd), Windows keeps its Startup folder.
- Done when: a real reboot of this Mac, no command typed → Telegram line arrives, a message from the phone is answered.
- Proofs: (a) `launchctl print gui/$UID/ai.fractera.node` loaded + the real reboot test with the owner. (b) `logs/boot.log` line
  with the boot time; negative control: plist removed → after a reboot nothing starts and `serve:status` says autostart is off.

### 781-5 · The red banner — the emergency face
- Built: when `health().state === 'deaf'` and 781-3 did not heal it, a red band on top of every panel page: «Telegram главного
  агента не слышит вас» · the cause in plain words · what the node already tried · the button «Переподключить» (the 781-3 action by
  hand) · the line «или введите в терминале /mcp → telegram → Reconnect». Data comes in the action window's existing poll
  (`/api/node/person-asks` returns `channel`), no new timer; the band is a shadcn `Alert` (destructive), `data-block` on it.
- Done when: the poisoned state shows the band within one poll, the button heals it and the band leaves.
- Proofs: (a) `npm run eyes` screenshot of the band on /ru/architect/build/terminal with the cache poisoned and the plugin killed;
  (b) after «Переподключить» the door says `ok` and the screenshot has no band; negative control: a healthy node — no band.

## 5. Order

781-1 → 781-2 → 781-3 → 781-4 → 781-5. One core rebuild at the end of the queue (code of the panel and the bridge), then the reboot test
with the owner (781-4 proof a).

## 6. Not included

- Automatic login of macOS, waking the laptop remotely (Wake-on-LAN), keeping the node alive while the lid is closed — named to the
  owner as the next question; a dedicated server stays the full answer for «the laptop is off» (skill `dedicated-server`).
- Other channel plugins than Telegram.
