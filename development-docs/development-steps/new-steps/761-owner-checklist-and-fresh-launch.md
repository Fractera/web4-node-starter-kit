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

## Order (my pick)

761-1…761-5 first — they change what the fresh launch shows; then 761-13 with the owner; 761-6, 761-7 on the way when the domain step
meets them; 760-2…760-7 and 761-8…761-12 after.
