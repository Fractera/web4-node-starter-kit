# The main agent's bot went deaf after the reboot of 2026-11-18

One failure, measured on the owner's Mac (macOS 12, Claude Code with the Telegram plugin 0.0.7). Written by the main agent on Opus · max
at the owner's word (10:40 UTC): «исследования проблемы нужно сделать глубже … меня беспокоит эти случайные появляющиеся про пробуждение
и засыпания».

## What the owner saw

- The session started with an apology in Telegram that it had been cut off.
- After that, Telegram «started writing some thoughts» while the bot still did not answer his messages.
- Wakes and sleeps that looked random.

## The chain, minute by minute (UTC)

| Time | What | Evidence |
|---|---|---|
| 2026-11-18 00:48 | pm2 stopped cleanly with the laptop (dump of 15 processes saved) | `~/.pm2/pm2.log` (outside agent's report) |
| 00:43–00:48 | the domain tunnel exits with code 1 every 15 s: «Could not lookup srv records … read udp [::1]:53 … connection» — the network was going away | `logs/domain-err.log` |
| boot ~10:10 | nothing starts: this Mac has no pm2 autostart (no plist in `~/Library/LaunchAgents`) | the outside agent's report, `ls ~/Library/LaunchAgents` |
| 10:14:10 | an outside Claude Code session is opened in the HOME folder; the Telegram plugin, enabled for the whole machine in `~/.claude/settings.json` (written 2026-11-16 16:19 with the plugin's reinstall), starts there | `~/Library/Caches/claude-cli-nodejs/-Users-romanbolshiyanov/mcp-logs-plugin-telegram-telegram/2026-11-18T10-14-10-596Z.jsonl` |
| 10:14:12 | it dies «TELEGRAM_BOT_TOKEN required» (that folder has no bot); Claude Code writes `plugin:telegram:telegram` into the machine-wide failure cache — every session of the machine skips the plugin for 15 minutes | `~/.claude/mcp-needs-auth-cache.json` mtime 10:14:12, timestamp 1794996852737 |
| 10:15 | the outside agent runs `pm2 resurrect`; the core starts | its report |
| 10:18:18 | the core sees the main agent's conversation died with it (step 708) and wakes it to continue | `logs/web4-out.log` «[agents/wake] build reason=session-lost → started», `logs/agent-return.log` |
| 10:18:48 | the plugin was skipped (cache), the channel did not come up in 30 s → the node closes the session and sends «Извините…» — **the apology the owner saw** | «канал Telegram не встал за 30 с — сессия закрыта», «[telegram] build: канал не встал — «Извините…» отправлено 1 из 1» |
| 10:21:09 | the owner starts the agent from the core's terminal page; the session is launched with `--channels`, the plugin is skipped again (cache still fresh) — and nobody checks: the terminal page path has no channel watch | `logs/load-rule.log` «session» at 10:21:09; no `[agents/wake]` line; `bridge.cjs` line 417: `watchChannel` only when `hold` |
| 10:21–10:40 | `telegram.running('build')` is true (session alive + launched with the channel flag), so the node's own poller (`idleTick`, every 3 s) stays silent; the plugin is not there either → **nobody reads the bot**; meanwhile the progress hook of every tool call posts drafts to his chat through the node's Bot API — **the «thoughts» he saw from an agent that could not hear him** | `telegram.cjs` `running()` 182, `idleTick` 350; `bridge.cjs` 272 progress hooks for every session but work; `lib/agent-kit/progress.cjs` `sendMessageDraft` |
| 10:40:25 | model switch (Opus · max, `--continue`) restarts the session; the cache is 26 minutes old now → the plugin starts, `bot.pid` 14601 alive | `logs/web4-out.log`, `data/services/build/channel/telegram/bot.pid` |

## Causes (each one alone is enough to make the bot deaf)

1. **The poison: the plugin is on for the whole machine.** Step 614-2 decided «the plugin is off globally, a node session turns it on
   for itself». A reinstall of the plugin (2026-11-16 16:19) turned it back on, and nothing checks it. Any Claude Code session outside
   the node (home folder, another project) starts it without a token, it dies, and the machine-wide cache blocks the node's sessions for 15
   minutes. On 2026-11-18 the outside session (pid 889) is still open: a reconnect there poisons again.
2. **The lie: «running» is a flag, not a fact.** `running()` trusts «launched with `--channels`». A session whose plugin was skipped or
   died is counted as hearing; the node stops reading the bot, so messages wait at Telegram unread.
3. **The gap: only half the start paths check the channel.** `watchChannel` (30 s, then close + the node reads the bot again + a line to
   the person) runs only for `wake(..., hold: true)` — core-back, session-lost, Telegram buttons, doors. The terminal page («Запустить»,
   «Продолжить разговор») and the session command (model switch, `clear --continue`) launch with the channel and never check it.
4. **The confusing face: drafts without ears.** The progress hook writes drafts for every session regardless of the channel, so a deaf
   agent looks alive in Telegram.
5. **No autostart on macOS without sudo.** `serve:autostart` prints a `sudo … pm2 startup launchd` line; nobody ran it, so after the
   reboot the node needed a person at the keyboard.

## Why wakes and sleeps look random to the person

All of them are by design, but nothing tells the person WHO did it and WHY in one place:
- **core-back** — every core rebuild stops every agent and wakes the main agent back (14 times on 2026-11-17, all channels up in 5–17 s);
- **session-lost** — the core starting after a crash or a reboot wakes the main agent into the same conversation (10:18:18 today);
- **channel-failed** — the node closes a session whose channel did not rise in 30 s and says «Извините…» (10:18:48 today);
- **model switch / clear --continue** — the session restarts by the agent's own command (10:40 today);
- **timeout** — a woken session is asked «закрыть терминал?» 60 minutes after the wake (`bridge.cjs` `wakeTimeoutMs`);
- **done** — «Turn it off?» after an element's or the agent's «done».

## What stays measured

- The plugin writes `bot.pid` right before its MCP handshake and erases it on exit (telegram 0.0.7, server.ts :78, :652, :663); a live
  pid written after the session's start = the channel is up (used by `person` and `watchChannel` since 592-2 / 614-1).
- The failure cache: `~/.claude/mcp-needs-auth-cache.json`, `{"plugin:telegram:telegram": {"timestamp": <ms>, "id": "…"}}`, 15 minutes.
- The node's own poller reads the bot only while `running()` is false (`idleTick`, 3 s).

The fix is step 781 (`development-steps/new-steps/781-the-laptop-boots-and-telegram-answers-itself.md`).
