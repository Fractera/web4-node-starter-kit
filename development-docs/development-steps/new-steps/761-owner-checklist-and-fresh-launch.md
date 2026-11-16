# 761 — the owner's checklist after the first server launch, then a fresh launch from zero

## Why

The owner, 2026-11-16 ~13:05 UTC: «после завершения всех этих шагов я прошу тебя внимательно ознакомиться с теми сообщениями которые я тебе
уже отправил и новыми потому что все ещё остается недостаточным то что мы сделали поэтому проанализируй уже готовы результат и добавь в
план то что я тебе писал но мы ещё не завершили после этого мы должны удалить сервер и перезапустить весь процесс. Я ожидаю полной
интерактивности и всех обновлений по чек листу». And the build window (verbatim in current-steps): a blue window that sometimes shows
nothing, a reload that shows a blank page — an orange collapsed card «!», and the question whether the users of an element build meet it.

## The checklist — one line per ask, its proof, its state

Done and seen live (the fresh launch shows each again):
- [x] `find` keeps its first word — f6716aeb.
- [x] Step 3 names how many names lead to the server — f6716aeb; later 760-8.
- [x] The domain road by measurement (759, then 760-8 at the owner's word): Cloudflare key sees the zone → the node writes after one confirm — 65af93d3; the card shows the zone as it is after the write — 275a6104 (seen 12:33).
- [x] 760-1 the server remembered for the access's day — 7ce420eb (seen: reload → step 1 filled, one click, no password).
- [x] 760-9, 760-10 «Отдать агенту» on the records and on step 5 — seen.
- [x] 758 step 5, the server's own bot — 0c7c667d; the relay follows the panel's address — 47cefe27; @fractera_ai_server_bot admitted (allowed 1).
- [x] The launch end to end on 109.199.105.213: 12/12 names, 12/12 certificate + HTTPS, «Ваш сервер готов», https://fractera.ai 200 from the server.

Done in code, not yet seen live:
- [ ] 762 the orange «!» for a step passed without its result — cc9a4d8a; the bot was set before the page could show it → the fresh launch with «Позже» shows it.

Open — the launch (before the fresh launch, so it tests them):
- [ ] 761-1 The greeting after the launch, as it once was («сразу после завершения установки Telegram писал мне приветственное сообщение»): the server's agent cannot answer until the server's Claude Code is signed in — a launch step «Подписка Claude Code сервера» (or inside step 5), the sign-in stays the person's; done when the agent's greeting arrives in Telegram.
- [ ] 761-2 The server's own line in the bot speaks the person's language and says «this server», not «this computer».
- [ ] 761-14 Every first message of a server's bot names its site with a link (the owner, 2026-11-16: «Сообщение которое приходят первые в Telegram должны содержать ссылку на сайт я же могу одновременно делать несколько развертываний совершенно непонятно какой сайта идёт речь») — the node's own lines and the greeting alike: «Сервер fractera.ai (https://fractera.ai) · …».
- [ ] 761-3 The mono list of step 3 («Добавлю/Удалю») in one font size.
- [ ] 761-4 The build window: an orange collapsed card «!» — «the blue window may stay still; a reload shows an empty page; nothing is broken; after the build, sometimes after 10 minutes and more, the project comes back» (the owner's words) — on the core terminal and on every element's build window where the same can happen.
- [ ] 761-5 Research for 761-4: what an element's build stops (only its process and its subdomain, or more), what a reload shows during it, how long the silent phases of the core build last (measured on this computer), and the facts the card states.

- [ ] 761-15 Haiku drives every connection done in the person's Chrome (the owner, 2026-11-16: «меня расстраивает избыточное прожорливость Claude для хром при управлении подключением … haiku должна стать моделью которая управляет подключением — одной из самых важных в этом обновлении»): «Отдать агенту» (records 760-9, the bot 760-10) starts a Haiku worker with the task, never the main Opus session; the price of one run measured before and after.
- [ ] 761-16 Information windows for interactive work in EVERY element (the same message: «наряду с информационными окнами для интерактивного взаимодействия во всех элементах»): the orange collapsed «!» cards of 761-4 are a part every element's build and agent windows use, not a core-only text.

Open — the domain and the server:
- [ ] 761-6 www.fractera.ai answers 530: a record of another type on `www` keeps `*` away — find it in Cloudflare, the launch's plan names it.
- [ ] 761-7 On the server's domain `/en/architect` sends a stranger to http://localhost:24680 — must lead to https://auth.<zone>.
- [ ] 760-2 the registrar and the renewal date (RDAP) on the domain cards and in the passport tab.
- [ ] 760-3 the plate on the computer: where the project's domains work (this computer / the server), one road per name.
- [ ] 760-4 «На выделенном сервере»: the servers launched from here and their domains.
- [ ] 760-5 a server node's own domain list by the registrar road; «Главное зеркало» on a server.
- [ ] 760-6 a domain added to the server from the computer, through the access.
- [ ] 760-7 the node says where the project lives: this computer, the server and its IP.

Open — the node itself:
- [ ] 761-8 After every core build the system part comes back (01:12, 12:04, 12:28, 13:01): core-started sessions cannot read gh's keychain token. The owner's choice: a GitHub token on the node's page «GitHub» (no code), or the code trusts a fresh cached verdict.
- [ ] 761-9 The fixes reach the fork and Fractera: a clean branch from origin/main (main carries the local «Fresh project» commit).
- [ ] 761-10 The node takes the person's language as `en`; the owner writes Russian (the setter needs the node key — through the node's own door).
- [ ] 761-11 The pre-existing failing case of `test:hosting-launch` «the claim goes server door».
- [ ] 761-12 The first task of this node — the family budget — waits for the owner's choice of shape.

The fresh launch:
- [ ] 761-13 Delete the server and run the whole launch again, step by step with the owner, each step reported against this checklist.

## 761-1 / 761-2 / 761-14 — the plan in detail (the owner: «(а), записи верни на Vercel, начинай с 761-1»)

**Facts measured 13:10 UTC.** The bot's lines are the channel's three texts (`active`, `inactive`, `noSubscription`) that the Telegram page
sends in the person's language with its links (`saveMessages`, action `messages`); the launch relay never sent them → the English
FALLBACK «Claude Code on this computer is not signed in». The server's sign-in state is its own door `/<lang>/build/agent-api/claude-auth`
(`claude auth status`); the sign-in itself is the server's page `/<lang>/build/subscription` — the person's act, reached through the SSH window.

**Shape.** Step 5 is done (blue) only when the bot is set AND the server's Claude Code is signed in — then the agent answers; otherwise
the orange «!» (762). Inside step 5, after the token: (1) the runner sends the three texts in the page's language, each starting with the
site — «Сервер fractera.ai (https://fractera.ai) · …» — and the links of the server's own domain; (2) «Claude Code сервера: не вошёл» with
«Войти на сервере» → the SSH window opens the server's subscription page; the step polls `claude-auth`; (3) signed in → the server's main
agent is woken with one first task: greet the person in Telegram, naming the site with its link.

**Test checklist (run by the agent, marked ✅/❌ with the proof):**
- [x] T1 unit ✅ (`test:server-telegram` 5/5, in the prebuild): the three texts carry the site name and its https link, in ru and en; no «this computer»; negative: a server without a domain names its IP and the panel place.
- [x] T2 runner test ✅ (`test:hosting-launch`, the step 5 case): the lines the token waited with reach the node's channel with it (lang ru); op `messages` resends them; bad lines refused.
- [x] T3 ✅ in code: `claude-auth` → `state.telegram.signedIn`; not signed in → no greeting (0 wakes); signed in → the node line `moved` wakes the server's main agent ONCE (a second read wakes nobody); `telegramWarn` blue only with configured AND signedIn (6 cases). The orange mark itself is seen live only after the core rebuild.
- [ ] T4 live: /start in @fractera_ai_server_bot before the sign-in → the Russian line with «Сервер fractera.ai (https://fractera.ai)».
- [ ] T5 live: the owner signs in through «Войти на сервере» → step 5 turns blue without a reload.
- [ ] T6 live: the agent's greeting arrives in Telegram and names https://fractera.ai.

## Order (my pick)

761-1…761-5 first — they change what the fresh launch shows; then 761-13 with the owner; 761-6, 761-7 on the way when the domain step
meets them; 760-2…760-7 and 761-8…761-12 after.

## 761-16 (first part) — the person's action request, at the bottom of the screen (approved 2026-11-16 ~13:55 UTC)

The owner: «уведомление на экране которое невозможно пропустить в котором ты меня призываешь совершить определённое действие и подтвердить
о его завершении» → «Да, строй так»; mid-build: «вся верхняя часть экрана очень сильно занята многими твоими инструментами поэтому очевидно
уведомление лучше показывать снизу, add to plan».

**Built.** `lib/node/person-asks.cjs` (data/node/person-asks.json) · `npm run ask-person` (put / list / drop) · door `/api/node/person-asks`
(GET open, POST «Готово» → wakes the main agent with the node line `person-done`) · `components/architect/person-ask.client.tsx` in the
architect header: the project's toast at the bottom right, orange, no timeout, «Открыть» + «Готово»; closed by × it comes back in a minute;
fresh on page open, tab return and every 15 s while the tab is visible · the launch page: «no access» on step 1 is an orange «!» card,
not red text · the skill `help-in-browser` names the command. Next part: the same window in every element (through the template).

**Tests:** A1 the request seen on three panel pages and after a reload · A2 «Открыть» leads to the page; «Готово» wakes me, the
confirmation is in the conversation · A3 after «Готово» it is gone everywhere; negative: no request — no window · A4 the launch page
without access shows the orange card on step 1; with access none · A5 keyboard (Tab to «Готово», Enter) and both themes ·
unit `test:person-asks` 5/5 (in the prebuild).

**761-16 seen live 14:06–14:08** (0ec9dd0b): A1 ✅ four pages, A2 ✅ (the owner's press and a keyboard press each woke me), A3 ✅, A5 ✅
keyboard (dark theme not checked), A4 only the negative half. The owner, 14:12: «Я увидел появление информационных окон … это то что надо.
Вопрос в следующем если в этот момент я нахожусь с тобой в чате Telegram можешь ли ты прислать мне соответствующий запрос в чат требующие
перейти на компьютер чтобы выполнить действия? … need create speciao design and auto hidden tools ?»; «ih i work in mobail».

- [ ] 761-16b The same request in Telegram when the person reads me there (`npm run person`): one message with «Готово» (a button that
  closes the same request through the core) and the words «нужно сделать на компьютере» when the act needs the computer; a press in
  either place closes both. Not built — and this node's main agent has no bot yet, so nothing could come today.
- [ ] 761-16c The window's own look (the owner's «special design»): to be agreed.
- [ ] 761-17 Step 5 asks Telegram itself (getMe with the server's token, on the server) whenever the step is read: a bot deleted in
  BotFather is said in words with the way back (make a new one on this step), never «подключён». Found 2026-11-16 14:15: the owner deleted
  @fractera_ai_server_bot «для полного тестирования» at 13:14; the page still said «Бот подключён»; t.me answers as for a free name.
- T4–T6 (761-1) move into the fresh launch 761-13: a new bot on step 5, /start, «Войти на сервере», the greeting.
