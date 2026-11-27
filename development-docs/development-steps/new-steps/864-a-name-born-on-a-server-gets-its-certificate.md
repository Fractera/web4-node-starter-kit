# 864 — a name born on a server with an active domain gets its certificate, and the panel can issue a missing one

**Asked:** fractera.ai's main agent through Roma, Telegram 1579, 2026-11-27 12:54 UTC (intake `pre-steps/2026-11-27-new-name-no-cert.md`):
the node update to its core dd3105e4 brought the native element `market` (862-1 — live proof that an update brings it:
https://market.fractera.ai/api/health 200, checked from the Mac 12:55). Its name market.fractera.ai got only the port-80 placeholder
(503 «certificate is not issued yet»), no 443 block; `npm run server -- domain` still said `ok … active`; the panel's «Адрес в
интернете» had no button to issue it. Repaired there by hand: `server -- dns-check` → `certs` → `check`.

**State:** queued — after the marketplace path (Roma 1496: the one focus), unless a server update that adds a name comes first.

**To build (plan with substeps before code):** (1) a name born on an active server domain starts `certs` for that name, then `check`;
(2) a required name without a certificate makes `server -- domain` say it is unfinished, and the panel shows «Выпустить сертификат» for
that name. **Proof:** a test name born on a server reaches HTTPS 200 with no manual command; one name's certificate removed → the warning
line and the button (negative). Load `dedicated-server`, `server-wall` and `before-a-build` first.
