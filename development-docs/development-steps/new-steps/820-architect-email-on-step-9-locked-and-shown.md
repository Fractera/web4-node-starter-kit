# 820 — the architect's e-mail on step 9 «Сервер готов»: what was sent is shown, the field locks, a change is deliberate

## The owner's words (verbatim, Telegram 337, 2026-11-20 22:56 UTC)

«Проблема на следующем шаге сервер готов: я написал текст с ошибкой и видимо случайно нажал клавишу ввод а затем я смог исправить e-mail
то есть после моей отправки поле ema осталось не заблокированы при этом я сделал опечатку и вернуться исправить ошибку я не могу
во-первых а во-вторых я не знаю с каким доменом я зарегистрировался потому что сейчас я вижу тот домен который я исправил а какой я
отправил на сервер я вообще не понимаю тут нужен прям полноценный этап планирования»

Then (Telegram 339, 22:57): «Все это будущее шаги но прямо сейчас я смог зайти в административную панель» — he did sign in on the server.

## Measured (code, 2026-11-20)

- `components/hosting/server-launch-claim.client.tsx`: the field keeps `email` state editable after a send; `confirmed` = the last sent
  address equals the field's current text — when he edits the field, the «Сервер ждёт регистрации … {email}» line disappears and the
  page no longer shows what was sent. Enter submits (a form). «Передать ещё раз» re-sends the field's text.
- The server's door (`app/api/node/server/domain/route.ts` `claim`): POST with an e-mail to the sign-in element's `/api/claim`; 409 once
  an architect exists. Whether a second POST replaces the pending e-mail — to be measured (the sign-in element's own code).

## To plan with the owner (a full planning stage, his word)

- after a send: the field locks and shows the address sent, with the time; «Изменить e-mail» unlocks it deliberately (a confirm naming
  the old and the new address); the server's pending address is read back from the server, never from the browser's memory;
- no accidental send: Enter does not submit, or submits only after a confirm;
- after the architect exists: the step says which address registered (masked), never the field's text.

Plan with substeps and the owner's yes before code.
