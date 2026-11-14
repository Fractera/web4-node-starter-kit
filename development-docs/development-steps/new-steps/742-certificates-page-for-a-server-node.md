# 742 — «Сертификаты безопасности»: a page of a server node only (queued)

The owner, 2026-11-14 (verbatim): «Также нужно добавить опции только для режима выделенный сервер на вкладке домены хостинг ниже чем
активация домена: сертификаты безопасности. Там будем решать вопрос обновления сертификатов в случае возникновения форс-мажора а также
мониторинга их состояние». Comes after 741 (the page shows only where the record says «server»).

## To plan
- Under «Домен и хостинг», below «Активация домена», visible only on a server node: every name's certificate (issuer, expiry, days left,
  the last renewal and its result), certbot's own renewal timer seen, a warning before expiry.
- Force majeure: renew now (one name or all), re-issue after a failure, the Let's Encrypt weekly budget shown (738-5 ledger), the person's
  own certificate uploaded, what to do when Let's Encrypt is unreachable.
- Monitoring: a check on a schedule only by the owner's word (no timer nobody ordered); its alarm through the core's notice door.

## The plan agreed 2026-11-14 ~22:10 UTC (the owner: «your choosse» to the open choices; found by the live test of aifa.dev)
Measured on aifa.dev (domain on, sign-in working): the menu item «Домен и хостинг» red — `/api/domain/state` says `active: false`
(the computer's Cloudflare logic) on a server whose domain runs through nginx; «Активация домена» shows the computer's Cloudflare ladder
and «Адрес узла: http://localhost:24680»; the server's own ladder with its certificate buttons hides inside «Активация выделенного
сервера»; the element's «Домен» tab names neither its public address nor its certificate; `/ru/super-node` 404 from the menu.
- 742-1 the domain state on a server is read from the server's own mark — the red goes.
- 742-2 «Активация домена» on a server = the server's own domain ladder; no Cloudflare key, no localhost, no home-computer texts.
- 742-3 «Активация выделенного сервера» is hidden on a server (D-742a, the agent's choice by the owner's word: servers are launched
  from the computer; on the server the item only confuses).
- 742-4 «Сертификаты безопасности», a server-only page under «Домен и хостинг»: every name — issuer, expiry, days left, the last
  renewal and its result; certbot's renewal timer; renew now (one / all), re-issue, own certificate; the Let's Encrypt weekly budget.
  No schedule (no timer nobody ordered).
- 742-5 the element's «Домен» tab shows its public address and its certificate where the node has a domain.
- 742-6 small: `/ru/super-node` 404 from the menu; the server ladder's «HTTPS отвечает на N из M» counts by httpsDue; Claude Code on
  the server «Auto-update failed: no write permission to npm prefix».
- 742-7 live on aifa.dev: every page seen; one name renewed (its new notBefore by openssl).
- 742-8 the core sync of a server both ways: the server's own panel update first, then the launch page's «Обновить» on the next edit;
  proof — the server's /api/health commit contains 742, the new page appears; before the update it is absent.

## State 2026-11-14 22:31 UTC — 742-1…6, 742-9 live on aifa.dev; 742-8 path 2 PROVEN
Pushed `6745d3c2` (CI green), the fork synced. The server updated ITSELF from its panel (banner «Проверить снова» → «Обновить сборку
ядра» → «Обновить узел из форка (5)» → «Развернуть»): 1c260370 → `b01e811c` (built 22:24). Negative control before: /ru/hosting/certificates
404, /api/domain/state active:false; after: 200 «Сертификаты безопасности», active:true, server:true, nodeUrl:null. Seen: the menu
«Домен и хостинг» no longer red, «Активация выделенного сервера» hidden (data-place=home, html[data-node-place=server]), «Активация домена»
= the server's ladder (the Cloudflare ladder display:none), the certificates table 13 names (Let's Encrypt, 88–89 d., HTTPS by httpsDue),
«Живой сайт» frames https://hrdvz.aifa.dev/ru and «Подсветка» outlines blocks on hover («awaiting-title · Нажми для обновления»).
The FIRST load after the build served the old prerender (no 742 at all) — a reload brought it: the open wish «stale page after a core
build» is real and bites every update; it belongs before fractera.ai.
OPEN: 742-8 path 1 (the launch page «Обновить») on the next edit; this computer's node not yet updated to 742; forced renewal + certbot
timer (root-helper verb and its delivery); Claude Code auto-update on the server (npm prefix); the hosting overview text; monitoring page;
the element's own second domain on a server; the server ladder's HTTPS rung shows open (hrdvz not yet checked — press the check).

## 742-10 — the owner's yes 2026-11-14 ~22:50 UTC: «Да, начинай 742-10»
His words (verbatim, 22:35–22:48): «https://architect.aifa.dev/ru/hosting/domain // В какой-то причине здесь опять написано что авторизация
не отвечает почему?»; «Ну также я увидел на вкладке активации домена текст Pro Cloud Flyer которые очевидно не должен существовать в потоке
выделенного сервера?»; the orange highlight of the hosting cards — «cancel for last task was my error» (NOT built); «https://architect.aifa.dev/ru/hosting/monitoring
// Это часть у нас уже реализовано и подсвечивается на вкладке Dashboard продублируй информацию сюда а в дашборд она не нужна».
Measured on aifa.dev before the code (22:37–22:47):
- the HTTPS rung showed the check of 19:33:58Z (sign-in 503 before the switch-on, by design); `steps.active` true; hrdvz `https: null`
  (born after the check) → the rung undone → «Включение» locked «Откроется после шага выше». «Проверить HTTPS» 22:37:33 → auth 307,
  hrdvz 200, 7 of 7 rungs done; cache and stripe (off by the registry) still a red «не отвечает» per row although `httpsDue` skips them.
- THE STALE FIRST LOAD, CAUSE PROVEN: his Chrome's HTTP cache held /ru/hosting/hosting stored 21:36 (pre-742, no `data-place`); the
  first navigation after the update: SW-controlled (workerStart 8 ms), `deliveryType: "cache"`, `transferSize: 0` → the pre-742 page; 2 s
  later the cache entry was 22:46:29 with 742 (a background revalidation); the second navigation fresh. The HTML carries Next's
  `Cache-Control: s-maxage=600, stale-while-revalidate=31535400`; the SW's «network first» `fetch(req)` goes through the HTTP cache,
  and Chrome serves the stale copy within the SWR window. The SW's own promise (public/sw.js: «старая страница при живой сети не
  отдаётся НИКОГДА») is broken one layer below it.
Substeps of 742-10 (one batch, one build):
- a. «Мониторинг сервера» = the machine board (`machineBoard`, the content of Dashboard → «Этот компьютер»); the folder
  `dashboard/this-computer` is deleted, its address redirects (307) to `hosting/monitoring` (`next.config.ts`, both address forms);
  the monitoring lead says what is there; README; CLAUDE.md §3 «Dashboard (Projects, This computer)» → the new place, sealed.
  Proof: curl /ru/dashboard/this-computer → 307 → /ru/hosting/monitoring, the monitoring HTML holds the board (before: 200 + «скоро
  будет построено»); eyes on aifa.dev: the board on «Мониторинг сервера», «Этот компьютер» gone from the Dashboard menu and list.
- b. One rule for «not due» HTTPS rows — `httpsWaits(r, active)` in `lib/hosting/final-check.mjs` (the launch page's 744-9 rule moved
  there); the server's own rung shows grey «выключен» / «после включения домена» and the note, as the launch page does.
  Proof: final-check.test.mjs (off, auth before/after the switch-on, a due name failing — negative); eyes: cache/stripe grey.
- c. «Включение» takes the HTTPS check again once sign-in answers (`checkAfterSwitch`, ≤ ~60 s inside the door's 170 s).
  Proof: a test with a fake fetch (auth 503, 503, 307 → the record says auth ok; without the wait — false, negative control).
  Live: only with his yes (it means «Вернуться на IP» and on again on aifa.dev).
- d. A name born on a server gets its HTTPS answer: `name-up.mjs` takes the check again after its certificate.
  Proof: the next element born on a server (owed); code read.
- e. «Активация домена»: a lead true on both places; «Почему не Cloudflare?» on the server's own panel only when the domain's DNS is at
  Cloudflare (the launch page keeps it always — the computer lived on Cloudflare's tunnel).
  Proof: curl of the lead; eyes on aifa.dev «Записи» (Porkbun — no button).
- f. The preface of «Домен и хостинг» true on a computer and on a server.
- g. The SW takes documents with `cache: "no-cache"` (a conditional request; offline unchanged); `check:pwa` refuses a document
  fetch without it; `scripts/sw.test.mjs` runs public/sw.js in a fake worker. Proof: the test (negative: the old file from git
  fails it); live after the NEXT update — a navigation of a page held in the HTTP cache has transferSize > 0 (before: 0, «cache»).
  Takes effect from the update after the one that ships it (the first visit is still served by the old worker).
Not in it: the elements' templates' own sw.js (a template release, only by the owner's word); «Вернуться на IP» re-check; the
hosting cards' highlight (cancelled).
Parts born here: none (Badge, the machine board and the words of the launch page are reused).
