# 758 — the server's own Telegram bot as step 5 of «Активация выделенного сервера»

## Why

The owner, 2026-11-16: «куда пропал Telegram который должен был требовать … во время установки сервера» and «Я считаю что Telegram может
быть в пятым шагом то есть в тот момент когда идёт установка сервера у пользователя есть время подключить Telegram».

The server's bot rung existed in the move road (737-11a, `e6961403`) and was removed with it in 738-7 (`ff570015`); the seven launch steps
were built without it. A server without its bot is out of reach from the phone — against the node's goal (CLAUDE.md §1).

## The shape

The ladder becomes eight steps: server · check · domain · install · **telegram** · recheck · certs · ready.
Step 5 opens as soon as the installation STARTED (not when it ended): the person makes the bot while the server installs.

- The token goes browser → the launch door's body → the runner's stdin → the visit's SSH channel stdin → `/root/.fractera/telegram.json`
  (0600) on the server. Never an argv, never a file or a log on this computer (the computer keeps no key to a server — 744-3).
- The installation's `start` stage (and the server node's first start if the token comes later) hands it to the server's main agent bot
  (`bot.json` / `TELEGRAM_BOT_TOKEN` of the build agent's state, the same place the panel's Telegram page writes) and removes the pending file.
- Once the server's node lives, step 5 shows the invite link `t.me/<bot>?start=…` from the server's own channel door (loopback through
  the visit, the relay of `e6961403` reused) and waits for the admission; the server's agent greets after /start (267-3).
- «Later» is allowed: step 5 can be skipped; it never blocks steps 6–8. Its line says «бот не подключён».

## Substeps

- 758-1 the runner: `telegram --put` (token on stdin → pending file), `telegram --state` (pending / applied / admitted / none) — `launch.mjs`.
- 758-2 the server side: `launch.sh` start stage applies a pending token; the server core's start applies one that came after.
- 758-3 the door: `/api/node/launch` actions `telegram-put`, `telegram-state`, `telegram-link` (relay to the server's channel door).
- 758-4 the island: step 5 in `LAUNCH_ORDER`, open while `launch.state` is running or done; the BotFather instruction from the agent
  kit's TelegramChannel words, the token field, the link, «later»; ru/en words.
- 758-5 tests: `test:hosting-launch` cases — the token never in argv or a local file (negative control: a planted argv grep), the pending
  file applied at start, step 5 open during install, skipped step 5 does not block 6.
- 758-6 proof on the owner's server 109.199.105.213: a real bot, the admission and the greeting seen in Telegram; then the core rebuilt.

## Done when

Two planes: the server's channel state says «admitted» for the person's chat, and the greeting is seen in Telegram on the phone.
