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
