# 809 — the element's «Домен» page rebuilt in the style of the server launch

State: IN WORK — his «да, вписывай в 809 и 810, терминал А» (terminal, 2026-11-20 ~11:00 UTC). Before the next core build (808 84ccf98f and
5ff18507 wait in the same build). The server ladder's layout sent (Telegram 84) — its code after his yes on it; the home rules now.

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

## The home / server rule (the owner, Telegram 76, 78, 81; his «да» ~11:00)

- A home computer (Mac, Windows, Linux; `data/node/place.json` place `home`): the node's own domain and the elements' subdomains only —
  NO additional domains for elements, NO «own app» at an element's birth (every element is part of the project).
- A dedicated server (place `server`): everything — additional element domains and own apps.
- Why: own apps bring other people, and their wall is the server's (811); a brand site on its own domain belongs on a machine that never
  sleeps.

## The shape

- HOME — the «Домен» page is one card: «Адрес элемента» (the subdomain, «Переименовать») + one muted line «Собственные домены элементов
  подключаются на выделенном сервере» with the link to «Активация выделенного сервера». No certificate row, no domain picker.
  «Активация домена» hides «Дополнительные домены» at home. The birth window at home has no «Чем будет этот элемент?» (app = project).
- SERVER — the `Ladder` part, like the launch: 1 «Домен в списке узла» (none free → the orange card + «Добавить домен», instruction in
  «Подробнее») · 2 «Подключить к элементу» (picker + «Подключить»; folded «подключён X») · 3 «Записи ведут на сервер» (records only
  while they do not; «Проверить снова»; folded «A @ и www → IP») · 4 «Сертификат и HTTPS» (spinner while issued; folded «HTTPS работает ·
  до <date>») · 5 «Главный адрес» (two buttons; folded «X, второй отвечает 301»; «Подробнее: вход на собственном домене»). «Адрес
  элемента» below only without an own domain; a danger zone at the bottom: «Отключить домен» with a confirm window.
- The stale `throughsongs.com` entry of this computer's `data/node/domains.json` (for: main, switched off 09:2x, DNS → the server) goes.

## Substeps

- 809-1 home rules: the birth window and the birth door refuse `own` at home; «Дополнительные домены» hidden at home; the element «Домен»
  page at home = the address card + the server line. Tests with negatives (server keeps all).
- 809-2 server ladder for the element «Домен» page (after his yes on the layout, Telegram 84).
- 809-3 the stale domain entry; prebuild; ONE core build (with 808, 5ff18507) after his word; eyes at home; server after push+update.

## The first shape (before his rules)


- Skill `interface-design` + the launch page's own parts: the `Ladder` part (one rung open, a done rung = one line of what it did), the
  same muted lines, sm buttons, `ButtonGroup` choices, folds for every instruction («Подробнее»).
- Not connected: a ladder — 1 the domain in the node's list (link to «Активация домена» when none is free) · 2 choose it and connect ·
  3 records lead to the server (the check, the records only while they do not) · 4 certificate and HTTPS · 5 the main address and sign-in.
- Connected: each rung collapses to its line (domain · records ok · certificate until <date> · main address); «Отключить» in a danger
  zone at the bottom; no text of the not-connected road.
- Proofs: the page's states rendered (none free / chosen / records missing / certificate waits / connected), eyes on this computer with
  a custom element, his look on the server after the delivery.
