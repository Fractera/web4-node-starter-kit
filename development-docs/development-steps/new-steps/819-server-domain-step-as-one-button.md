# 819 — the server's domain step (step 3 of «Активация выделенного сервера») as one button

## The owner's words (verbatim, Telegram 328, 2026-11-20 22:47 UTC)

«Пожалуйста разработайте подходящий план для этого шага очень сложно» — after Telegram 309–324: step 3.3 could not be passed
(www.fractera.ai «нет записи»; «Записи уже верны – дальше» five times, nothing changed), and 312: «почему у меня все поддомены поставились
автоматически а для одного единственного мне нужен этот сумасшедший ребус», «твои названия не совпадают … говорить откройте шаг 3.3».

## Measured (2026-11-20)

- Step 3 today is a ladder of four rungs: 3.1 «Домен» (the name), 3.2 «Где живут записи» (detection), 3.3 «Кто внесёт записи» (a question
  «Есть ли у вас доступ…» or, when the node's Cloudflare key sees the zone, the plan with «Вписать записи» / «Записи уже верны — дальше»),
  3.4 «Записи» (the public DNS check). Four rungs, a question and two buttons that look alike for one fact: do the names lead to the server.
- Two defects found tonight, both fixed in code, waiting for a core build: a name with TXT records of its own (www: Smithery, Yandex) is not
  covered by `*.zone` — the plan now adds its A (ca3ae4df); a saved way «none» was never turned into «dns» by the button (065a48d4).
- Public resolvers cache a «no record» answer up to the zone's SOA minimum (fractera.ai: 1800 s): a check right after a write can fail.

## The proposal (layout to the owner before code — memory compact-ui-folds-instructions)

One card «Домен», no rungs:
- a field with the domain (prefilled when known) and ONE button «Подключить»;
- behind it the node does all by itself: finds where the records live → the node's Cloudflare key sees the zone: writes the missing
  records at once (adding a record to the server needs no question) — asks ONE confirm only when something of another hosting must go,
  naming it; → checks every name in public DNS and repeats by itself for up to 3 minutes (the «no record» cache) → the step closes;
- one line per name — `fractera.ai`, `www`, `architect`, `auth`, `*` — ✓ leads to the server · … waiting for DNS · ✗ what is in the way;
- only when the key does NOT see the zone: a folded card «Записи вручную» — the records to copy, «Claude впишет их в вашем Chrome»,
  «Проверить»; the question «Есть ли у вас доступ…» disappears (the way follows from the key, never from a question).

## Substeps

- 819-1 the door `connect-domain`: detection, the plan, the write of added records, the check with repeats; the answer — one line per
  name; a removal waits for the confirm (`remove` ids). Tests with the fake Cloudflare: adds only → written, no question; a removal →
  confirm; no key → manual; the TXT-shadowed www; the way «none».
- 819-2 the card: the field, «Подключить», the lines per name, the one confirm (AppDialog), the folded manual card; the ladder's four
  rungs of step 3 retired. Eyes: three states on screenshots.
- 819-3 one core build, live on fractera.ai: the step passes with one press; push.
- 819-4 (the owner, Telegram 329, 22:48 UTC: «она восьмом шаге кнопка проверить протокол из интернета бледные а должна быть голубая так
  как на предыдущих шагах сказать даже точнее синие запомни измени потом»): step 8's «Проверить HTTPS из интернета» is the primary
  (blue) button like the earlier steps' — rides in 819's build.

## Not included

The registrar path beyond Cloudflare (writing records at other registrars by their APIs) — the manual card covers it as today.
