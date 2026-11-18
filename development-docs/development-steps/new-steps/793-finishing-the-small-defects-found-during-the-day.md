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
