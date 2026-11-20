# 813 — www always redirects to the domain

State: PLAN — proposed to the owner 2026-11-20 16:45 UTC (Telegram 209), after 811-7; waits his «да».

## The owner's words (verbatim, Telegram 208)

«Скажи а почему у нас остается www неиспользуемый и нам нужно сделать чтобы всегда при переходе на домен вместе с www существовал бы
переадресация с www на обычный домен. Что для этого нужно изменить можно это запланировать сейчас или нежелательно?»

## Measured

- The redirect exists: `lib/hosting/nginx.mjs` writes `return 301 https://<zone>$request_uri` for a row without a service and with
  `redirectTo` (hostnames.mjs:106 — `www.<zone>`, kind www, `redirectTo: zone`).
- But www is `optional: true` (hostnames.mjs:106, launch.mjs:311 `row(www, …, true)`): the records step does not require it, the
  certificates skip it, `final-check.mjs` ignores optional rows. On fractera.ai nobody created the record (dig www.fractera.ai: none),
  so https://www.fractera.ai does not answer.

## Substeps

- 813-1 www required in both tables (`hostnames.mjs` kind www → optional false; `launch.mjs` row) — the element mirrors stay optional.
- 813-2 the records step asks for it / writes it where the node writes records; certificates issue it; the final check needs it.
- 813-3 test: the tables (www required), nginx's 301 for www; live — `curl -I http(s)://www.<zone>/` → 301 to the domain.
