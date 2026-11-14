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
