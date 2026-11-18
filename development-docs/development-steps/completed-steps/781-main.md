# 781 — the laptop boots, the agent and its Telegram wake by themselves, and every act of the person is a window

Closed 2026-11-18 11:4x UTC, one cycle as the owner asked. Repository: the core, `main`. The failure that started it:
`development-docs/reports/errors-the-main-agent-bot-went-deaf-after-the-reboot.md`. The plan was deleted in the commit of this summary
(`git log --diff-filter=D -- development-docs/development-steps/new-steps/781-the-laptop-boots-and-telegram-answers-itself.md`).

## The owner's words (2026-11-18 UTC)

- ~10:50: «тревожный красный баннер если у нас существует Telegram основного агента который не подключился к сессии … реши эту задачу
  механическим способом»
- ~10:55: «пользователь вообще должен забыть и существование ноутбука»
- ~10:45: «в пульте телеграмма … сейчас бот спит. Разбудить бота нужно это сделать?»
- ~11:10: «есть ли у тебя сторож … Который ловит! В чате … чтобы после следующего пробуждения я всегда видел уведомления»; «все три задачи
  мы решаем одновременно … реши за одну цикл»
- 11:27 (a screenshot of the Pult): «Обрати внимание на отсутствие внутренних отступов в дизайне новой карточки»

## Commits

80e62cf6 (781-7 the guard) · 6b97fd03 (781-1..6, 93 files, the agent kit in 12 copies) · 3e400cef (the Pult's padding, the Telegram mirror
of an action request) · the boot parse fix and this summary — the closing commit. Core builds 49ce4ff3 (11:23, RC=0) and a4dd164a (11:33, RC=0).

## What was done, by substep

- **781-7 the window guard.** `lib/agent-kit/window-guard.cjs` (pure: a `!` command, `sudo` in code, a Claude Code slash command, an
  imperative to type or send a key/token/password/code/login, «run it in the terminal»; ru and en with Unicode word edges);
  `.claude/hooks/window-guard.mjs` — SessionStart line, Stop (exit 2 with the way), PreToolUse on the Telegram `reply` (deny); a turn
  passes with `npm run ask-person` in it or the line «⟦без окна: <why, 8+>⟧»; journal `data/node/window-guard.jsonl`; the skill
  `act-with-the-person` names it; `scripts/window-guard.test.mjs` (15) in prebuild.
- **781-1 «hears» is a fact.** Kit `channel-health.cjs`; the bridge watches every session launched with the channel (terminal page,
  session command, heal — not only `wake(hold)`): 30 s to come up, then deaf after 20 s without the plugin's live `bot.pid`;
  `data/services/<id>/channel-state.json`; `lib/node/main-channel.cjs` cross-checks it with the pid; the log names who started a session.
- **781-2 the poison out.** Before every channel launch and at the core's start: the Telegram plugin's entry removed from
  `~/.claude/mcp-needs-auth-cache.json`, the plugin off for sessions outside the node in `~/.claude/settings.json` (one key, a backup in
  `data/node/claude-settings.backup.json`); progress drafts only while the plugin is alive.
- **781-3 self-heal.** Deaf → wait for the end of the turn → the same conversation restarted once (model, effort, pass kept); deaf again
  within 10 min → closed after the turn, the node reads the bot, the person is told.
- **781-4 reserve buttons.** The panel: a red band on top of every page (shadcn `Alert`, now in `components/ui/alert.tsx` with its parts
  card) riding the action window's poll; `/api/node/main-channel`. The Pult: the main agent's card says «спит — Разбудить» or «не
  слышит — Переподключить сейчас»; the door action `channel`.
- **781-5 autostart without sudo.** `lib/node/autostart.cjs` writes the node's own user LaunchAgent `ai.fractera.node` running
  `scripts/boot.mjs` (up — nothing, down — `pm2 resurrect`), the pm2 list saved only when complete; consent by a press: the window kind
  `--action autostart`, the Pult row, `/api/node/autostart`; `serve:status` names it; `serve:autostart` on macOS uses it.
- **781-6 «the computer is on».** `lib/node/boot-line.cjs`: once per boot, 90 s after the first core start within 15 min of the boot,
  one Telegram line through the node's Bot API with the agent's state; silent after rebuilds.

## Proofs (two planes each, measured live)

- 781-7: Claude Code denied my own Telegram reply with a `!` command — journal line with session ef50fc9b (11:24:47); the replay of this
  morning's real transcript refuses the three answers that asked for hands in chat and passes the others; tests 15/15 incl. negatives.
- 781-2: core start 11:23:28 «плагин выключен для сессий вне узла», settings now `false`, the backup keeps `true`; a hand-poisoned cache
  (11:25:21) was gone after the heal restart (`{}`), the plugin up in 4 s — before the fix the same cache gave «Skipping connection».
- 781-1/3: the plugin killed 11:25:21 → 11:25:42 «Telegram не слышит (плагин пропал)…», state healing → 11:27:56 «перезапуск ради канала —
  тот же разговор продолжен» → 11:28:00 «канал встал за 4 с» → the owner's Telegram message 551 reached the restarted session. Negative:
  core-back wakes at 11:23 and 11:33 came up (8.9 s, 8.4 s) and were never restarted.
- 781-4: eyes `logs/eyes/2026-11-18T11-26-58-983Z.png` — the band on top, visible, no console errors, during the healing state; the
  doors: `person-asks` carries `channel: null` while hearing; the Pult POST without Telegram's signature → `no-data`; the owner's own
  screenshot of the Pult showed the card in the healing state (the padding defect, fixed in 3e400cef, `.abox .chan{padding:2px 14px 14px}`
  served after the build).
Surfaces seen: logs/eyes/2026-11-18T11-26-58-983Z.png (the panel's red band, 781-4); the Pult card — the owner's phone screenshot 11:27
(the padding defect, fixed in 3e400cef).
- 781-5: the owner pressed «Включить автозапуск» in the Pult 11:26:45 → plist written, `launchctl print` loaded, boot.log «already up —
  nothing to do»; the real reboot 11:36:56 → boot.log 11:39:11 «pm2 resurrect» at uptime 135 s, the core up, `serve:status` «автозапуск
  включён».
- 781-6: 11:39:14 «первый старт ядра после включения компьютера», 11:40:46 «строка «узел работает» отправлена 1 из 1»; negative: no line
  after the core builds at 11:23 and 11:33.
- After the reboot: the 708 session-lost wake 11:39:21, the channel up in 8.8 s, the owner wrote from Telegram at 11:40:16.

## Mistakes

- The morning itself: I told the owner to type `! …` commands in the chat — the rule existed only in text; Claude Code's own advice won.
- `\b` in JavaScript does not see Cyrillic word edges — the first test run of the guard missed every Russian phrase.
- The first replay: «: причина» passed as a deviation (the space counted), and two inline spans joined by a newline read as `sudo …`.
- I reformatted the whole `components/ui/parts.json` by dumping it with Python — restored and appended in the file's own format.
- `boot.mjs` and `autostart.cjs` took the first «[» of `pm2 jlist` as the JSON — a fresh daemon prints «[PM2] Spawning…» first; it
  happened on the real boot (resurrect still ran, by luck of the case) and is fixed.
- The first reboot window's «Готово» was pressed before the reboot — the request text said nothing about not pressing it.
- I wrote into the second window's hint that it «closes itself» when the node sees a boot — that is not built; I close it by hand.

## Evolution of skills

- `act-with-the-person` names the guard and the deviation line (done here). Proposed for the review: a request kind «reboot» whose
  window closes when the node sees a new boot time, instead of a «Готово» the person can press too early.

## Parts born here

- `components/ui/alert.tsx` — `ui-alert` (shadcn new-york, its card in `components/ui/parts.json`).
- `components/architect/main-channel-band.client.tsx` — `@local`, the panel's red band.

## Not included (owed, named to the owner)

- The guard in element sessions (a template release, on the owner's word).
- One place that says who woke or put an agent to sleep and why (core-back, session-lost, timeout, done).
- macOS automatic login, Wake-on-LAN, staying alive with the lid closed.
