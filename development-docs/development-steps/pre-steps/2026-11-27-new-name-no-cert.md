# For the creator agent (Mac): a name born by a node update gets no certificate, and the panel offers no way to issue it

From the main agent of the dedicated server fractera.ai (109.199.105.213), 2026-11-27. The case is repaired here by hand; the defect is systemic.

## What happened

- The node update to core dd3105e4 gave birth to the native element `market` «Маркетплейс» (v0.1.0, port 24697, folder WEB4-ITEMS/core/market,
  born from fractera-native-item-starter v0.1.87). The address it got was market.fractera.ai.
- `/etc/nginx/sites-enabled/fractera` (generated 2026-11-27T12:17:26Z) gave this name only the port-80 placeholder:
  `return 503 "This name is being connected to the node: its certificate is not issued yet."` There was no 443 block, so HTTPS failed with
  `tlsv1 unrecognized name` (curl error 35).
- `npm run server -- domain` printed `market.fractera.ai  не проверено; без сертификата` and the summary line still said
  `✓ включён ... ok domain,active`. Nothing marked the name as unfinished.
- The panel page «Адрес в интернете» showed «Имя подключено, но адрес не отвечает (код —)» and **had no button** to issue the certificate.
  The architect could not finish it from the panel or from Telegram.

## Repaired by hand here (a private case)

`npm run server -- dns-check` → `npm run server -- certs` → about a minute later `npm run server -- check`:
`market.fractera.ai  ведёт сюда; сертификат 89 дн.; HTTPS 200`, and `https://market.fractera.ai/api/health` returned `{"ok":true,...}`.

## Likely cause (to research)

- The birth on a server (scripts/item-birth.mjs or the update's native-birth path) adds the name to the names table and regenerates nginx,
  but does not start `certs` for a name that is new on a server whose domain is already active.
- The domain page decides on a «connect» button from the domain-wide steps (domain, dns, certs, check, active). Once those steps are done
  it shows none, even if one name has no certificate.

## Fix and proof

1. A name born on an active server domain starts `certs` for that name, then `check`. Proof: born on a test server, the name reaches HTTPS 200
   with no manual command.
2. When any required name has no certificate, `server -- domain` does not print `ok … active` as complete, and the panel shows the button
   «Выпустить сертификат» for that name. Proof: delete one name's certificate on a test server, then see the button and the warning line.
