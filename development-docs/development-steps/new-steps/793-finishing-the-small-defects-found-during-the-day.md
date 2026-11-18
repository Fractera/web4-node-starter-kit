# 793 — finishing: the small defects found during the day of 2026-11-18

The owner, 2026-11-18 13:00 (Telegram 612): «если появляются незначительные проблемы то мы их не решаем сегодня а собираем все эти проблемы
в один план по доделыванию и будем реализовывать в рамках отдельной сессии только после завершения текущего плана».

Taken only after the day plan 783 (steps 784–792) is closed. One line per defect: what · where · the guessed cause · how it was found.

## Defects

- `npm run ask-person -- --help` puts a real window with the text «--help» (12:3x) · `scripts/ask-person.mjs` · arguments: no help flag,
  any first word is the request's text · found by me, the window dropped at once.
- The bot's «Агент build выключен. Включить его и передать ему ваше сообщение?» (12:52) held messages of yesterday as well as today's ·
  the main bot's held-messages list · held words are not cleared when they reach the agent · the owner forwarded the list (Telegram 604).
- The server launch page says «need-password» when the browser does not keep cookies for localhost (13:41) ·
  `components/hosting/server-launch.client.tsx` connect → probe · the visit lives in an HttpOnly cookie; a profile that blocks site data
  for localhost drops it silently · measured in his Chrome (a JS cookie on localhost is not kept; a clean Chrome passes the whole round on a
  test SSH server) — the page should test a cookie first and name the cause and the setting.
- `npm run eyes` could not open a `file://` page (its theme cookie needs an origin) — fixed inside 788 (a bench page is a file).
- Lesson, not a defect (fixed in 788): the bench page runs unminified source — a check of the BUILT page (`curl` the live Pult page and parse its
  script) belongs in the 788/787 proofs; the test now parses the whole page script.
- 15:00 (the owner, Telegram 699): «нельзя строить так приложение чтобы при ошибке на одной вкладке из него нельзя было выйти» — the panel must stay leavable when one page's island loops or hangs (a guard against effects that call the server without a once-guard; navigation never blocked by busy).
- 15:58 (the owner, Telegram 718, angry: «четвёртая сборка подряд»): step 5 never said in words that the bot speaks only once the server's node lives — the waiting line must say it plainly with the time left, and the invite/«Старт» road appear by itself when the node answers. Lesson: think a step through whole before the first build; no build during a launch except a blocker.
- 16:18 (784): the install stopped at «Пакеты, сборка и элементы» (install.sh, 16:07:36 server clock) and neither the page (a cut tail ending at the install.sh line) nor this computer showed WHY — the page must show the failed stage's whole last lines, and the runner must keep a secret-free failure record in logs/ (stage, last 40 lines) so the main agent reads it without the person's browser.
- 16:35 (784, root of the hrutb failure): Fractera's original registry carries the owner node's born element hrutb since ce3e76d9 (12:3x push of 258 commits; 59c42260 had none) — every fresh fork install 12:3x–16:2x would fail; fb233968 makes the install drop it; asked (738): commit the hrutb deletion + a guard refusing a push to Fractera with any born element in the registry.
