# 809 — the element's «Домен» page rebuilt in the style of the server launch

State: PLAN — the owner's order 2026-11-20 10:34 UTC (Telegram 63), to be done BEFORE the next core build (808 84ccf98f and 5ff18507
wait in the same build). Layout goes to him before code (memory compact-ui-folds-instructions).

## The owner's words (verbatim, Telegram 63, with a photo of /ru/a8ifp/settings/domain on the server)

«Поставь в план перед сборкой ядра эту страницу где ты сейчас подключал домен нужно переработать с использованием навыка дизайна
административных панелей в стиле в котором создается подключение сервера. Я сейчас смотрю на эту вкладку и вижу абсолютно бардак
множество текстов полей противоречащих друг друга по смыслу в текущей ситуации»

## Seen on his photo (the server, element a8ifp «marina2», throughsongs.com just connected, HTTPS 200 at 10:31:59)

- The lead says «Подключить второй собственный домен …» while one is connected.
- «Домены узла · Выберите домен» and a blue «Подключить» stay under a connected domain.
- «Впишите эти записи A у регистратора — сертификат появится сам» while the records already lead to the server and the certificate exists.
- «Начать добавление домена» with its two-point instruction and the paragraph «Домен добавляется и доводится …» — the road for a domain
  not yet added, shown after it is done.
- «Главный адрес» (two chips) and «Вход на собственном домене» sit between them; the certificate is a separate row below.

## The shape (to agree with him)

- Skill `interface-design` + the launch page's own parts: the `Ladder` part (one rung open, a done rung = one line of what it did), the
  same muted lines, sm buttons, `ButtonGroup` choices, folds for every instruction («Подробнее»).
- Not connected: a ladder — 1 the domain in the node's list (link to «Активация домена» when none is free) · 2 choose it and connect ·
  3 records lead to the server (the check, the records only while they do not) · 4 certificate and HTTPS · 5 the main address and sign-in.
- Connected: each rung collapses to its line (domain · records ok · certificate until <date> · main address); «Отключить» in a danger
  zone at the bottom; no text of the not-connected road.
- Proofs: the page's states rendered (none free / chosen / records missing / certificate waits / connected), eyes on this computer with
  a custom element, his look on the server after the delivery.
