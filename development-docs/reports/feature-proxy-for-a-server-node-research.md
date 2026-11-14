# Research — `proxy.ts` for a node on a dedicated server, and access by bare IP (2026-11-14)

The owner's order, verbatim (2026-11-14 11:22): «Процесс самоопределение: я живу на локальной машине || я живу на выделенном сервере
становится самое важная задача на текущем этапе не так ли? Хочу заказать тебе исследование на тему насколько меняется или как должен
измениться proxy.ts для того чтобы стать чистым вариантом для удалённого сервера который к тому же дополнительно возможность обхода
защищенного соединения при использовании ip вместо домена».

Method: model-free reading of the working copy at `82a074ed` — `proxy.ts` (654 lines) whole, `lib/auth/owner-at-machine.ts`,
`lib/auth/temporary-address.ts`, `components/shell/temporary-host.ts`, `lib/auth/get-session.ts`, `lib/showcase.ts`,
`lib/auth-base-server.ts`, `lib/domain/public-auth.cjs`, `lib/hosting/{edge,nginx,place}.mjs`, `scripts/server.mjs`,
`scripts/dedicated-server/{launch.sh,prepare.sh,fractera-root.sh}`, the GET doors of `app/api`. Primary source for certificates:
letsencrypt.org (posts of 2026-01-15 and 2026-03-11, docs/profiles). Findings marked ⚠ began as readings; F1–F3 were then measured
on the test server (§1a). The second, deeper pass (§8) measured the elements, the computer plane and the update path, and corrected the
pick on the IP certificate; the plan built on both passes is `development-steps/new-steps/741/`.

## 1. Answer in one paragraph

`proxy.ts` decides access by four signs read from the request: loopback name without Cloudflare headers and without the nginx edge mark
(owner at the keyboard), a temporary name (`*.trycloudflare.com` or a bare IP), the showcase name `fractera.ai`, and the connected
domain in `logs/domain.json`. All four were designed for the person's computer behind Cloudflare, where the client cannot choose the
`Host` the core sees. Behind a server's nginx the client can: nginx passes `$host` from the request into `Host` and `X-Forwarded-Host`,
so two of the four signs — temporary and showcase — become forgeable on a server. The clean server variant does not need a second
proxy: it needs **one answer to «where do I live» read by the proxy** (step 741), **nginx that tells the core the name it matched, never
the client's**, and on a server the two «computer only» signs switched off. Access by bare IP over plain HTTP should shrink to a status
card; the lawful way to act before a domain is an SSH window. A Let's Encrypt IP certificate (160-hour, certbot ≥ 5.4) could turn the
IP into a real HTTPS address — after the second pass my pick is NOT to build it now (§8, D32 of the plan): the launch flow never uses
the IP, and the certificate would only shorten the minutes before DNS answers, at the price of a sign-in template release and a
renewal every few days whose failure darkens the IP.

## 1a. Measured on the test server 213.199.61.7, 2026-11-14 ~11:55 UTC (read only, nothing changed there)

| Request (plain HTTP to the IP → the core's default block) | `/api/me` | `node/state` | `node/machine` | `node/passport` |
|---|---|---|---|---|
| `Host: nobody.invalid` (negative control) | 401 | 401 | 401 | 401 |
| `Host: <IP>` (the bare IP itself) | `owner@temporary`, architect | 200, 588 B | 200, 2398 B (`machine`, `memory`, `tier2`) | 200, 4899 B |
| `Host: fractera.ai` (forged) | `visitor@showcase`, ALL roles | 200 | 200 | 200 |
| `Host: x.trycloudflare.com` (forged) | `owner@temporary`, architect | — | — | — |

`/api/users` stayed 401 in every case — the sign-in element checks the cookie itself (the second wall held). Over HTTPS to the IP the
first 443 block answers (an element, not the core): core doors 404 there, but `/api/me` with `Host: fractera.ai` still returned the
showcase session. **F1, F2 and F3 are therefore facts, not readings.** F1/F2 are a defect of the live product on every server node;
F3 is the accepted tunnel trade applied to a permanent, scanned address.

## 2. Findings that change the plan

- ⚠ **F1 — Host forgery through nginx opens the showcase mode on any guest server.** `isShowcaseRequest` reads `x-forwarded-host` or
  `host`; nginx sets both from `$host` (`lib/hosting/nginx.mjs:44,48`). On port 443 the site file has **no `default_server`**, so a
  request with an unknown `Host` is served by the first 443 block and proxied with that `Host`. `curl -k https://<server IP>/api/users -H
  'Host: fractera.ai'` would reach the core as a showcase GET → `getSession` grants `ALL_ROLES` (`lib/auth/get-session.ts`) → the users
  list of a live guest server. Holds after the domain is switched on (port 80's default redirects then; 443 has no default).
- ⚠ **F2 — the same forgery with a temporary name.** `Host: x.trycloudflare.com` (or any IP literal) to a server makes
  `isTemporaryPublicAddress` true → architect role for every GET, the architect pages open. A server never has a quick tunnel
  (`install.sh` writes `unpublished`), so on a server this sign can only be a forgery.
- **F3 — the bare IP of a server is not a «temporary address» in the sense the law was accepted for.** The owner accepted a read-only open
  panel on the quick tunnel because its name is random, lives hours and is not indexed (`temporary-address.ts`). A server's IPv4 is
  permanent and every public IPv4 is scanned around the clock. Today, from launch until `domainActive`, `http://<IP>/` serves the whole
  architect layer read-only to anyone: 49 GET doors do not refuse a temporary address themselves (list in §6), among them `users`,
  `node/state`, `node/machine`, `agents/permission`, `node/a2a-log`, `node/element-orders`.
- **F4 — the SSH window is named but gone.** `lib/hosting/edge.mjs`, `app/api/node/server/domain/route.ts` and
  `components/hosting/server-domain.i18n.ts` tell the person to act through `npm run server -- window`; `scripts/server.mjs:4` says the
  verb was removed with the move (738). The only working way to act on a server before its domain is the main agent's CLI over SSH.
- **F5 — dead branches of the old server line.** `shouldBypassAuthEdge` reads `FRACTERA_IP_NODOMAIN_MODE`, which a node never sets
  (`services-install.mjs:463` blanks it); `authBaseFromHost` keeps `<IP>:3001` and `projectsBaseFromHost` keeps `<IP>:3003` (ports of the
  old line, outside the node's range); Job 0.5 bridges `/projects` to a service the node does not have. On a server by IP they would
  produce dead links.
- **F6 — the refusal pages speak of a tunnel.** On a server's IP `/login` shows `temporaryAddressPage` («временный адрес»), and write
  refusals say `reason: "temporary-address"`. The person on a server needs its own words: «the server is reached by IP; sign-in opens on
  the domain / with the IP certificate».
- **F7 — `proxy.ts` already runs in the Node runtime** (Next 16.2: `mirrorTarget` reads `node:fs` on every request), so it can read the
  741 record from a file; the comment of `auth-bypass.edge.ts` about Edge is outdated.

## 3. Every branch of `proxy.ts` — today and what it must do

Columns: **C** = the person's computer (loopback, quick tunnel, own domain through the Cloudflare named tunnel); **SD** = a server by its
domain (nginx 443 with a certificate); **SI** = a server by its bare IP over plain HTTP.

| # | Branch (line) | Today | C | SD | SI |
|---|---|---|---|---|---|
| 1 | Job −2 `mirrorTarget` (361) | 301 secondary names of an element to its primary | keep | keep (nginx rows also redirect; one owner — keep the core's, it reads the element's record) | n/a |
| 2 | Job −1 showcase write refusal (387) | by `Host` = `fractera.ai` | keep (Cloudflare fixes Host) | only when THIS node's zone is `fractera.ai` — F1 | never — F1 |
| 3 | Job −1б temporary write refusal (409) | tunnel name or IP literal | keep | a temporary name on a server is a forgery → refuse the request outright (421/404), not «read-only» — F2 | keep read-only refusal, own words — F6 |
| 4 | Job 0 `AUTH_FORM_PATHS` (419) | tunnel → warning page; owner → domain auth or loopback port; others → `authBaseFromHost` or the 739 closed page | keep | `https://auth.<zone>` (already via `publicAuthBaseFor`) | without IP certificate: a server page «sign-in opens on the domain»; with it: the IP sign-in (§5 D) |
| 5 | Job 0.5 `/projects` bridge (538) | redirect to `projects.<apex>` / `<IP>:3003` | delete (F5) | delete | delete |
| 6 | Job 1 `apiAuthGate` public prefixes (154–214) | open | keep | keep | keep |
| 7 | gate: `isOwnerAtMachine` (225) | loopback, no `cf-*`, no edge mark | keep | keep: on a server loopback = a process on the server or an SSH window — both the owner's | same |
| 8 | gate: `isTemporaryPublicAddress` (235) | read passes | keep (tunnel) | never (forgery) | status-only allow-list (§5 A), not the whole layer — F3 |
| 9 | gate: showcase GET (270) | read passes | keep | only if own zone is `fractera.ai` | never |
| 10 | gate: `shouldBypassAuthEdge` (274) | dev or old IP flag | `NODE_ENV=development` only; drop the flag (F5) | same | same |
| 11 | gate: session cookie / `x-agent-identity` (275–292) | cookie presence | keep | keep | no cookie can exist without HTTPS — falls to 401 |
| 12 | Job 1.5 architect pages gate (605) | owner / bypass / temporary / showcase / domain with sign-in → pass, else 404 | keep | domain with sign-in → `AccessGate` | without certificate: the status page only; with it: same as SD |
| 13 | Job 2 language router + `withLangCookie` (300) | `prefCookieDomain` returns null for IP | keep | keep | keep (host-only cookie on IP is correct) |
| 14 | `authBaseFromHost` `<IP>:3001` branch | old line | delete (F5) | — | — |

## 4. What changes, in one picture

1. **One reader of «where I live»** (741): `lib/hosting/where.cjs` → `{ place: 'computer' | 'server', zone, showcase }`, written by the
   installation (`npm run launch` → computer, `launch.sh` → server), cached by file mtime, read by `proxy.ts`, `get-session.ts` and the
   doors. `place.mjs`'s measurement stays only as a check that warns when record and measurement disagree.
2. **The name the core trusts comes from nginx, never from the client.** In every proxied location: `proxy_set_header Host
   $server_name` for named blocks; the IP block passes a fixed marker (`X-Fractera-Edge-Host: ip`); a `default_server` on 443 with
   `ssl_reject_handshake on;` (nginx ≥ 1.19.4) so an unknown SNI never reaches a named block. On the computer Cloudflare already does this.
3. **On `place = server` two signs are off:** the temporary-name sign (no tunnel exists there) and the showcase sign unless the node's own
   zone is `fractera.ai`. That alone closes F1 and F2 even if nginx is misconfigured — two walls again, as in `edge.mjs`.
4. **The bare IP of a server gets its own small sign** (`isServerIp`), separate from the tunnel: an allow-list of what the IP shows —
   the launch status, the records to write at the registrar (already read-only on the domain door), `/api/health`. Nothing of the
   architect layer.
5. **Dead branches removed** (F5) and the refusal texts split: tunnel words for the computer, server words for the IP (F6).
6. **The SSH window comes back as a verb** (F4), or the three texts stop naming it — one or the other in the same step.

## 5. «Bypassing the secure connection» by IP — the variants

| Variant | What it gives | Risk / price | Verdict |
|---|---|---|---|
| A. IP read-only over HTTP (today, narrowed) | the person sees that the server is up and which records to write | nothing secret on it after the narrowing; plain HTTP can be read and altered on the way — only public facts may be shown | **narrowed further: a static card from nginx, nothing of the core** (plan D31) |
| B. Password / architect code over plain HTTP | sign-in before a domain | the code or password crosses the internet readable; the session cookie cannot be `Secure`; browsers mark the form «not secure»; contradicts the law «a password never crosses plain HTTP» (`temporary-host.ts`) | **reject** |
| C. SSH window (`ssh -L` to the server's loopback) | full architect rights before a domain, by the owner's key; the edge mark is absent, so `isOwnerAtMachine` already admits it | needs the computer that holds the key — not from the phone; nothing new to secure | **restore now** (F4) |
| D. Let's Encrypt IP certificate | `https://<IP>` is a real secure origin: the 739 architect code can be claimed and the panel used from the phone in the first minutes, before DNS | 160-hour certificates (letsencrypt.org, 2026-01-15: IP certificates must be short-lived, IPv4 and IPv6); certbot ≥ 5.4 with `--webroot --ip-address` (letsencrypt.org, 2026-03-11 — the nginx plugin does not support IP yet, renewal needs a `--deploy-hook` that reloads nginx); renewal failure = the IP goes dark in ≤ 6 days, so it needs the monitoring of 742; the sign-in element is built for `auth.<zone>` and needs an IP mode (host-only cookie, a second port such as 8443 under the same certificate — a template release) | **not now** — an option for 742 (plan D32; §8 F15, F17) |
| E. Self-signed certificate on the IP | encryption | the browser's red warning on every visit; trains the person to click through warnings | reject |

The server already installs certbot from the snap «5.x … IP certificates and profiles need ≥ 5.4» (`prepare.sh:39`) and serves the
ACME webroot on the IP block — the ground for D is laid; only issuance, renewal hook, the nginx 443 block for the IP and the sign-in IP
mode are missing.

First-pass pick (superseded by §8 and the plan's D31/D32): A narrowed + C now, D as the destination. After the second pass:
**the IP shows a static card from nginx (A becomes «nothing of the core by IP»), C now, D not now** — the launch flow never uses the
IP (F15), so D only shortens the minutes before DNS answers, for a template release and a renewal every few days.

## 6. GET doors that do not refuse a temporary address themselves (49, by reading)

config-image/[slot] · health · agents/permission · architect/drafts · architect/drafts/[id]/birth · architect/design-config ·
architect/panel-design · architect/menu/elements · architect/menu/ai · me · users · shell-kit/asset/[file] · shell-kit/[lang] ·
skills/suggested · openai-models · node/power · node/own-service-props · node/payments · node/element-docs · node/study/consent ·
node/study · node/tools · node/first-task · node/product-quiz/pdf · node/product-quiz · node/update · node/studies · node/helpful-links ·
node/a2a-log · node/menu-stamp · node/a2a · node/deploy · node/needs · node/projects · node/catalog · node/element-orders ·
node/site-rules · node/web4 · node/state · node/passport · node/element-settings · node/elements · node/official · node/element-design ·
node/type · node/super-node/remote · node/machine · node/messenger-settings · node/automation · node/online · node/reach ·
node/preview-url · media-proxy/[...path] · domain/state · project-types/[lang]/[id] · media/icons/... · media/[id]/file

Many are harmless on the tunnel by the owner's accepted trade; on a server's permanent IP the allow-list of §4.4 replaces the per-door
question.

## 7. How it plugs into 741

Superseded by the plan `development-steps/new-steps/741/741-main.md` (substeps 741-1…7, decisions D31–D37). The first action this
section asked for — measuring F1 and F2 on the test server — was done (§1a, and again with the saved probe in §8).

## 8. Second pass (2026-11-14 ~12:00–12:40 UTC, max effort) — what the first pass missed

Probes saved beside the plan: `development-steps/new-steps/741/probes/` (`host-forgery.sh`, `tunnel-forgery.sh`, the numbers in its
README).

- **F8 — the elements carry the same forgeable signs.** All 15 templates in `~/fractera-dev/fractera-*-starter` have their own
  `lib/showcase.ts`, `lib/auth/{temporary-address,owner-at-machine,get-session}.ts` and `proxy.ts`; none knows `x-fractera-edge`.
  Measured on the test server's 443 (the root element answers there): forged `Host: x.trycloudflare.com` → `owner@temporary`
  (architect), forged `Host: fractera.ai` → the showcase session with all roles; forged `Host: 10.0.0.1` → 401 (that element's shell kit
  predates the bare-IP sign). Their owner sign holds behind nginx only because nginx drops loopback names (444, measured for
  `localhost`, `localhost.`, `127.0.0.1:24680`, `[::1]`) and replaces a forged `X-Forwarded-Host` (measured).
- **F9 — the fix can live at the edge for everyone at once.** nginx is generated by the core (`lib/hosting/nginx.mjs`). If every proxied
  location passes its block's own name instead of `$host`, and a 443 `default_server` drops unknown names, no forged name reaches the core
  or any element — without one template release. nginx routes an unmatched name to the default server of the port (nginx.org, request
  processing), so the default block is the closing piece; `ssl_reject_handshake` exists since 1.19.4 (nginx.org) — Ubuntu 22.04 and
  Debian 11 ship 1.18.0 (packages.ubuntu.com, packages.debian.org), so a fallback is needed there (the first real certificate +
  `return 444`).
- **F10 — a running server keeps its nginx after an update.** Only the launch (`start.sh`), a new name (`name-up.mjs`), certificates
  (`certs.mjs`) and the domain switch regenerate it; `node:update` merges and then runs the NEW `serve.mjs rebuild` — the place to
  re-apply nginx.
- **F11 — the computer plane is clean (negative control).** Forged `Host` through this node's quick tunnel → 403 from Cloudflare; the
  tunnel's own name → `owner@temporary` as accepted in 243.
- **F12 — the hosting page decides «server» from the address bar** (`components/hosting/server-place.client.tsx:23`): through the
  computer's quick tunnel it renders the server ladder.
- **F13 — the old IP-mode switch still opens everything.** `FRACTERA_IP_NODOMAIN_MODE=true` in `.env.local` makes `getSession` grant the
  architect role to every caller and opens the proxy gate; a node never sets it — a dead switch that opens the whole node is removed, not
  kept.
- **F14 — a stale declaration on this Mac.** `data/node/place.json` = «server» (2026-11-13 10:15), unread since 737-18; a record with the
  same name must replace it (version 2), never trust it.
- **F15 — the bare IP is not needed by the flow.** The launch tooling reaches the server only by SSH and loopback
  (`launch.mjs:127`, `state.sh:76`); the launch page links only `https://<zone>`, `https://<architect>` and `https://auth.<zone>`. The
  server's ports 24680/24681 are closed from outside (measured). So the IP can show a static card from nginx and nothing of the core.
- **F16 — Next.js 16.2 runs `proxy.ts` in the Node.js runtime** (bundled docs `proxy.md:219`): the proxy can read the place record from
  a file.
- **F17 — no phone path to a fresh server before its domain** (no Telegram bot is set up by the launch). The IP certificate would open one;
  so would the server's own bot. Named for 742 and the strategy map, not built in 741.
