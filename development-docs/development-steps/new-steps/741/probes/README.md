# 741 probes — what they measured BEFORE 741 (the negative control of every proof)

Both scripts only read (GET and TLS handshakes). Run them again after each substep that touches the edge or the signs; the rows must
change exactly as the substep's file says, and the control rows must not change.

## `host-forgery.sh 213.199.61.7` — the server plane, 2026-11-14 ~12:05 UTC

The test server then: Ubuntu 24.04 (nginx 1.24), node launched by 738, domain aifa.dev not switched on (`http://<IP>/` proxied to the
core), the root element holding the first 443 block (certificate CN=aifa.dev, expires 2027-02-11).

| Request through nginx | `/api/me` | node/state | node/machine | node/passport | `/ru` |
|---|---|---|---|---|---|
| http `Host: nobody.invalid` (control) | 401 | 401 | 401 | 401 | 404 |
| http `Host: <IP>` | owner@temporary, architect | 200 | 200 (2398 B) | 200 (4899 B) | 200 |
| http `Host: fractera.ai` (forged) | visitor@showcase, 15 roles | 200 | 200 | 200 | 200 |
| http `Host: x.trycloudflare.com` (forged) | owner@temporary | 200 | 200 | 200 | 200 |
| http `Host: 10.0.0.1` (forged) | owner@temporary | 200 | 200 | 200 | 200 |
| http `X-Forwarded-Host: fractera.ai` + `Host: nobody.invalid` | 401 (nginx replaces XFH) | 401 | 401 | 401 | 404 |
| http `Host: localhost`, `localhost.`, `127.0.0.1:24680`, `[::1]` | 000 (nginx 444) | | | | |
| https SNI `nobody.invalid` / `fractera.ai` | handshake succeeds with CN=aifa.dev (no 443 default_server) | | | | |
| https `Host: x.trycloudflare.com` → the root ELEMENT | owner@temporary, architect | | | | |
| https `Host: fractera.ai` → the root ELEMENT | visitor@showcase, all roles | | | | |
| https `Host: 10.0.0.1` → the root ELEMENT | 401 (its shell kit predates the bare-IP sign) | | | | |
| `http://<IP>:24680`, `:24681` from outside | 000 (closed — nginx is the only face) | | | | |

`/api/users` answered 401 in every row: the sign-in element checks the session cookie itself.

## `tunnel-forgery.sh https://timothy-textile-actors-donor.trycloudflare.com` — the computer plane, 2026-11-14 ~12:00 UTC

| Request through Cloudflare's quick tunnel | answer |
|---|---|
| the tunnel's own name | 200 owner@temporary (the accepted read-only trade, 243) |
| `Host: fractera.ai` | 403 from Cloudflare — never reaches the node |
| `Host: 213.199.61.7` | 403 from Cloudflare |

Conclusion: the forgery exists only behind a server's nginx; the person's computer is not exposed.
