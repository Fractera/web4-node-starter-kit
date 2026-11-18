# 793 — finishing: the small defects found during the day of 2026-11-18

The owner, 2026-11-18 13:00 (Telegram 612): «если появляются незначительные проблемы то мы их не решаем сегодня а собираем все эти проблемы
в один план по доделыванию и будем реализовывать в рамках отдельной сессии только после завершения текущего плана».

Taken only after the day plan 783 (steps 784–792) is closed. One line per defect: what · where · the guessed cause · how it was found.

## Defects

- `npm run ask-person -- --help` puts a real window with the text «--help» (12:3x) · `scripts/ask-person.mjs` · arguments: no help flag,
  any first word is the request's text · found by me, the window dropped at once.
- The bot's «Агент build выключен. Включить его и передать ему ваше сообщение?» (12:52) held messages of yesterday as well as today's ·
  the main bot's held-messages list · held words are not cleared when they reach the agent · the owner forwarded the list (Telegram 604).
