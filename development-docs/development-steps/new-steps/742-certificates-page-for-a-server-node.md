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
