# 801 — the element's domain page, its certificate, root on the node's domain, Messenger hidden, Marina's working process

State: APPROVED («go», 2026-11-19 terminal) — in work. Collected at the owner's word («Аккумулировать все мои задачи для финального планирования этого шага»).
waits his «да». Code so far: 800-2 committed 65dcaf72 (not pushed); 801-1 written in the working tree, unchecked, uncommitted.

## The owner's tasks (verbatim, 2026-11-19)

1. «по умолчанию вкладка свой домен для сервера была схлопнута в аккордеон. Сейчас она раскрыта и не видно где добавлять домен
   кастомный» → 800-2 (coded).
2. «у нас отсутствует верхнее меню … во-первых должна быть верхнее меню на этой странице с доменом, во-вторых в нижней части страницы
   должна моргать стрелочка … в третьих карточки расположи … по одной ряд» → 801-1.
3. «на вкладке домен должна появиться вкладка сертификат безопасности … переделай вкладку домен»; «нужно чтобы всплыло какое-то
   уведомление … идёт установка сертификата»; «пользователь захочет загрузить собственный сертификат безопасности, по крайней мере
   должен видеть, когда он устаревает» → 801-2, 801-3.
4. «из вкладки … для руут нужно убрать выбор другого домена, так как руут всегда остаётся на домене для ядра» → 801-4.
5. «раздел Messenger закомментировать, он не должен быть доступен до появления Lagrix, то есть не удаляй его, а скрой» → 801-5.
6. «переноси на вкладку кастомного [элемента] Марина логику рабочего процесса, которую мы создали для руут» → 801-6.
7. Then: «как мы должны регистрировать администраторов этих доменов» — the next step (802), with the deferred registration defect.

## Facts measured (2026-11-19)

- The server's element «marina» (ay3tz): throughsongs.com connected as its main mirror; ay3tz.fractera.ai 301 → it. The certificate
  (Let's Encrypt YE1, until 2027-02-17) came ≈10 min after «Подключить»; the page said nothing meanwhile.
- The server already has «Сертификаты безопасности» (742-4, @part server-certificates): every name with its certificate, days left,
  issuer, HTTPS; «Проверить и дополнить»; a person's own certificate (CertsStep upload). Missing: the end date, the element of a name,
  the renewal state, a forced renewal, and anything on the element's own page.
- The apex goes to the element with id `root` in the names table (`lib/hosting/hostnames.mjs:86`, `byId.get('root')`) — the core's
  existing id-rule (named; §3 says no element gets a place by its id).
- The element's «Домен» page = `ElementDangerZone` cards mirror · address (· signIn) in two columns, shared with «Опасная зона».
- Messenger = one node of `lib/web4-items/item-tree.ts` (slugs messenger, h2h, h2h/native, h2h/telegram, h2a, h2a/native, settings);
  the 706 pattern hides a Lagrix section by commenting it out and sending its addresses through `MOVED_PAGES`.
- The core pins custom v0.3.215 on purpose; v0.3.216 (the Mini App drawer, door tg-menu) and v0.3.217 (common items outside the modes)
  are root's working process (root merged both); the server's Marina was born from v0.3.215.

## Substeps

- 801-1 The element's «Настройки → Домен»: the page's own top menu (sticky under the site header), a blinking arrow at the bottom
  (motion-safe bounce, shown while a card lies below, takes the person to the next card), the cards one per row. A new part
  `components/nav/page-anchors.client.tsx` (@part page-anchors, its card in `components/nav/parts.json`); `ElementDangerZone nav`;
  words `pageNav` (en, ru). «Опасная зона» unchanged. Scrolling by `scrollIntoView` (a bare `#` does not move these pages, 264-4).
- 801-2 The card «Сертификат безопасности», last on the page and in its menu. On a server: each name of the element's own domain (the
  domain and www) from the server's door rows — state, issuer, valid until (date and days), HTTPS; «Проверить и дополнить»; «Загрузить
  свой сертификат» (the existing CertsStep); a link to «Сертификаты безопасности». On a computer: one line — Cloudflare issues and renews
  it. No own domain yet: «Сначала подключите домен».
- 801-3 The notice while a certificate is issued: after «Подключить» a toast «Домен подключён. Выпускаю сертификат — обычно несколько
  минут; до этого адрес не открывается»; the certificate card shows «выпускается…» and follows the server's state every 5 s until
  the certificate and HTTPS answer («HTTPS работает · до <дата> · продлится сам»); a failure in red with «Повторить» and «Загрузить
  свой». The same line on the extra domain's card of the server's «Активация домена». The server's certificates page gains the end date
  and the element of each name.
- 801-4 The element that holds the node's apex keeps the node's domain: its «Главное зеркало» card says that it is the site at the
  root of the node's domain and shows no choice of another domain. The holder is asked of the names table, never `id === 'root'` in a
  page; the id-rule stays in its one existing place.
- 801-5 Messenger hidden until Lagrix: its node commented out in `item-tree.ts` (706 pattern), its addresses → «Telegram-бот» in
  `MOVED_PAGES` (and `h2a/native-chat`). Every element at once. CLAUDE.md §3 lists Messenger in the element's menu — its sentence
  changes only by the owner's word (resealed).
- 801-6 Marina takes root's working process: release the custom template from main (v0.3.216 + v0.3.217 + the showcase removal — the
  same cleanup as root v3.0.69, closing the forged-header hole for custom elements), pin it in the core, bring it into the server's
  Marina (the template rollout: one commit of those paths, its patch tag, its pin; or its «Обновить»), rebuild it there.
- 801-7 Delivery: the core's prebuild → the core build here (eyes on http://localhost:24680/ru/root/settings/domain) → the push (fork +
  Fractera: his permission rule or his push) → the server update (the hosting page, step 4) → Chrome on architect.fractera.ai, signed in
  by him.

## Test checklist (run and marked by me; the negative first where there is one)

- [ ] 801-1 eyes: the menu under the header, a press scrolls to the card; the arrow shows with a card below, hides at the bottom; one card per row
- [ ] 801-1 «Опасная зона» still two columns, no menu (negative)
- [ ] 801-2 server: the card lists throughsongs.com and www with «до 17 февраля 2027», HTTPS ✓; computer: the Cloudflare line
- [ ] 801-3 a fresh test domain: the toast after «Подключить», «выпускается…» until HTTPS, then green with the date
- [ ] 801-4 root: no choice of another domain; Marina: the choice is there (negative)
- [ ] 801-5 no «Messenger» in root's and Marina's menus; /<lang>/<id>/messenger opens «Telegram-бот»
- [ ] 801-6 Marina's menu has «Мои проекты | A2A · Web4», «Подписки», «Крон-автоматизация»; its /api/me with a forged
      X-Forwarded-Host → 401
- [ ] 801-7 the fork and Fractera at the last commit; the server's core at it; every check above on the server too

## Not in this step

- Authorization of the domains' administrators (802), with the deferred defect: on the fresh server a registration without the e-mail
  claim became the architect.
- The native elements' forged-header hole (his decision pending).
- «Переезд на другой сервер» in the server's menu (contradicts «никакого переезда нет», 2026-11-14) — named.
- This computer has no public address since throughsongs.com moved to the server — his word after the test.

## Prices

The core build here ≈5 min (agents stop and come back by themselves); the server update ≈10 min (its sites blink at the restart);
the custom release with Marina's rollout ≈20–30 min. No agent session is needed: everything is code I write and run.
