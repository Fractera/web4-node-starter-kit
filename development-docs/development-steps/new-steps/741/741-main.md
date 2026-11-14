# 741 — where the node lives: one record, and an edge that trusts only its own names

Planned 2026-11-14 at max effort as a PLAN ONLY (the owner's rule: the maximum model plans, Opus executes). Research behind it:
`development-docs/reports/feature-proxy-for-a-server-node-research.md` (both passes). Probes and their before-numbers: `./probes/`.
Repositories: the core only (Fractera/web4-node-starter-kit, main). No template release in this step (D33). Replaces the queued file
`new-steps/741-one-record-of-where-the-node-lives.md` (deleted in the same commit; its text is §1 and §2 here).

**Status: WAITING for the owner's approval of the substeps and D31–D37.**

## 1. The owner's words (verbatim)
- 2026-11-14, the queue of 741: «решил ли ты на фундаментальном уровне проблема разделения например это точно приложение запущенные на
  локальном компьютере поэтому его надо отметить и как приложение запущен на локальном компьютере. А это точно приложение запущенное на
  удалённом сервере поэтому его надо отметить как приложение запущенные на удалённом сервере потому что нам нужнов зависимости от этого
  строить абсолютно разные стратегии во многих вещах». Order: «739 → 741 → 740».
- 2026-11-14 11:18: «версия на удалённом сервере также смогут поддерживать обновления … баннер который уведомляет об отсутствии
  отставания и давать возможность обновиться» · «дополнительные верхнее меню которое показывает сайт в интернете по временному адресу
  автоматически скрывается если у нас существует удалённая версия» · «ты уже решил каким именно образом гарантировано архитектура
  определяет живёт она на локальной машине или на удалённом сервере?»
- 2026-11-14 11:22: «Процесс самоопределение: я живу на локальной машине || я живу на выделенном сервере становится самое важная задача на
  текущем этапе не так ли? Хочу заказать тебе исследование на тему насколько меняется или как должен измениться proxy.ts для того чтобы
  стать чистым вариантом для удалённого сервера который к тому же дополнительно возможность обхода защищенного соединения при
  использовании ip вместо домена».
- 2026-11-14 ~12:10 (after the first pass of the research): «repeat more deep , to do plan for this step».

Assumptions:
- I assume that a server's bare IP is a launching stage, not a lasting address of the node (D31, D32 decide it).
- I assume that «the top bar hides when a remote version exists» means the COMPUTER's online bar with its temporary address, once this
  computer has launched a live server (D36 — two readings).
- I assume that every server node keeps being launched by the page (738); a hand install on a VPS is a computer by its record (D35).

## 2. Measured state (2026-11-14, numbers in `probes/README.md`)
- **Forgery through a server's nginx (live, 213.199.61.7):** nginx passes the client's `Host` (`$host`) to the core and the elements; the
  IP's default block and the 443 blocks therefore accept any name. Forged `Host: fractera.ai` → the showcase session with every role
  (core: node/state, node/machine, node/passport 200); forged `x.trycloudflare.com` or any IP literal → the architect read of the
  temporary address; on 443 the first named block (the root element) answers forged names the same way. Control `nobody.invalid` → 401.
  `/api/users` stayed 401 (the sign-in element's own cookie check). Loopback names → 444; a forged `X-Forwarded-Host` is replaced.
- **The computer plane is clean:** forged names through the quick tunnel → 403 from Cloudflare.
- **The bare IP serves the whole architect layer read-only** to anyone who knows the IP (a permanent, scanned address — unlike the random,
  hour-lived tunnel name the owner accepted the trade for). 49 GET doors do not refuse a temporary address themselves.
- **Elements:** all 15 templates in `~/fractera-dev/fractera-*-starter` carry their own showcase, temporary and owner signs; none knows the
  edge mark `x-fractera-edge`. Their owner sign holds behind nginx only because nginx drops loopback names (444) and overwrites
  `X-Forwarded-Host`.
- **A running server keeps its nginx file after a core update:** only `start.sh` (launch), `name-up.mjs` (a new element name),
  `certs.mjs` and `server-domain-switch.ts` regenerate it. `node:update` merges, then runs the NEW `serve.mjs rebuild`.
- **Where the node lives today:** a server writes `data/node/server.json` `phase: live` at the END of its launch (`launch.sh` `do_mark`);
  the computer writes nothing — `lib/hosting/place.mjs` measures (macOS/Windows → computer; Linux + public IPv4 on an interface → server;
  NAT clouds read «computer», a Linux desktop with a public IP reads «server»). This Mac still holds the retired declaration
  `data/node/place.json` = «server» (2026-11-13 10:15), read by nothing since 737-18.
- **Places guessed from the address bar:** `components/hosting/server-place.client.tsx:23` renders the SERVER ladder when the computer is
  opened through its quick tunnel; the online bar, the alarms and «open on this computer» decide by `window.location.hostname`, which on an
  SSH window says `localhost` on a server.
- **No quick tunnel on a server** rests on `logs/tunnel.json` `unpublished` — the same flag as «the person removed the site» (371-1);
  `serve:publish` rewrites the file without it.
- **Dead switches:** `FRACTERA_IP_NODOMAIN_MODE` (old server line) still makes `getSession` grant the architect role to everyone and opens
  the proxy gate if anyone writes it into `.env.local`; the proxy's `/projects` bridge and the `:3001`/`:3003` addresses point at nothing.
- **The SSH window is gone** (`scripts/server.mjs:4`) while `lib/hosting/edge.mjs`, `app/api/node/server/domain/route.ts` and
  `components/hosting/server-domain.i18n.ts` still send the person to it.
- **Primary sources:** Next.js 16.2 runs `proxy.ts` in the Node.js runtime (`node_modules/next/dist/docs/01-app/03-api-reference/
  03-file-conventions/proxy.md:219`); nginx routes an unmatched name to the default server of the port and has `ssl_reject_handshake`
  since 1.19.4 (nginx.org); Ubuntu 22.04 and Debian 11 ship nginx 1.18.0, Ubuntu 24.04 1.24.0, Debian 12 1.22.1 (packages.ubuntu.com,
  packages.debian.org); Let's Encrypt IP certificates are generally available, 160 hours, http-01 or tls-alpn-01 only, certbot ≥ 5.4
  with `--webroot --ip-address`, 50 per IPv4 per 7 days (letsencrypt.org 2025-07-01, 2026-01-15, 2026-03-11, docs/rate-limits);
  cookies are not isolated by port (RFC 6265 §8.5).

## 3. What is reused (paths that open)
`lib/hosting/nginx.mjs` (`nginxSite`, `http2Directive` — the version branch pattern), `scripts/server.mjs` (`nginx --write`),
`scripts/dedicated-server/fractera-root.sh` (`nginx-apply`, unchanged), `lib/hosting/place.mjs` (`nodePlace`, `isPublicIpv4`),
`lib/hosting/phase.cjs`, `lib/node-state/place.ts` + `app/api/node/place/route.ts` (the door already exists), `lib/hosting/edge.mjs`,
`lib/auth/{temporary-address,owner-at-machine,get-session,auth-bypass,auth-bypass.edge}.ts`, `lib/showcase.ts` +
`lib/showcase.server.ts` (`isShowcaseBuild` — the node configured as fractera.ai), `proxy.ts`, `scripts/serve.mjs` (`start`,
`publish`, `rebuild`), `scripts/launch.mjs` (`logs/launch.json` stamp), `scripts/dedicated-server/install.sh` (`stage marks`),
`lib/hosting/ssh.mjs` (`connect`, pins, the node key), tests `scripts/hosting.test.mjs` (in the prebuild chain).

## 4. Known limits
- CLAUDE.md §2: the temporary address is read-only and its trade is the owner's — the computer's tunnel keeps it untouched (negative
  control in every substep).
- CLAUDE.md §2: «The node does not listen on the computer's network IP» — unchanged; the core keeps `HOST=localhost`.
- CLAUDE.md §6: «self-healing that changes the address is forbidden» — no proof may run `serve:publish` on this computer.
- CLAUDE.md §6 + `edge.mjs`: two walls, either enough — the edge (nginx) AND the core's own signs; neither substep may rely on one.
- `check:shell-kits`: `components/shell/` is copied byte for byte into every element — 741 does NOT edit it (an edit makes 15 elements
  «ДОЛГ» until their releases); server-side decisions wrap it in `lib/auth/`.
- The element boundary: 741 never edits an element; elements get the edge fix from nginx, their own second wall waits for D33.
- `ANTI-PATTERNS.md` «All systems» before the core build; one push, one node update here (memory: batch before a rebuild).
- The test server is never patched by hand (memory: test from scratch): its proof is a node update or a launch from the page, observed.

## 5. Observable results
1. On a server, a request carrying a name the server does not own never reaches the core or an element: `probes/host-forgery.sh` shows
   000 (444), a refused handshake or the static card on every forged row; the real names keep answering.
2. Even with nginx misconfigured, the core grants no showcase or temporary identity on a server (loopback call with a forged name and the
   edge mark → 401).
3. Every node answers «computer» or «server» from a record its own installation wrote, bound to its machine; the measurement only checks
   it, and a disagreement is said aloud.
4. A server never opens a quick tunnel, whatever is run.
5. The pages decide computer or server from the node, not from the address bar: on this computer's tunnel the hosting page shows the
   launch view; on a server the online bar and the computer alarms are absent.
6. The owner reaches a server's panel before its domain by `npm run server -- window` (his key, loopback, no nginx).
7. One map of every behaviour that differs, and a guard that refuses a new place guess outside the reader.

## 6. Substeps, order, address
All in the core, branch main of the working copy `~/fractera-dev/web4-node-starter-kit`, one push at the end (or 741-1 first — D34).

| # | result (one line) | file |
|---|---|---|
| 741-1 | the edge: nginx forwards only the name it matched, the IP shows a card, unknown names on 443 are refused, every start on a server re-applies nginx | `741-1.md` |
| 741-2 | one record of where the node lives, written by the installation, bound to the machine, measured only as a check | `741-2.md` |
| 741-3 | the core's second wall: showcase only on a node configured as fractera.ai, no tunnel or IP identity on a server, dead switches removed | `741-3.md` |
| 741-4 | a server never opens a quick tunnel; the `unpublished` mark keeps one meaning | `741-4.md` |
| 741-5 | the SSH window comes back as a verb; the three texts that name it become true | `741-5.md` |
| 741-6 | the browser learns the place from the node: hosting page, online bar, alarms, update banner on both places | `741-6.md` |
| 741-7 | the map of every behaviour that differs, and the guard `check:place-readers` | `741-7.md` |

Dependencies: 741-3, 741-4 and 741-6 read 741-2's reader; 741-6's server proof needs 741-5 (eyes through the window before sign-in);
741-7 maps what 741-1…6 left. 741-1 depends on nothing.

Live proofs on the server need the core on it: Fractera push → fork sync (aifa-agi, Chrome or a token — mine) → `node:update` on the
server (its own update banner or `npm run server -- …` from the computer) — the update's NEW `serve.mjs rebuild` applies 741-1's nginx.

## 7. Decisions (my pick first)
- **D31 — what the bare IP of a server shows before its domain.** (a) a static card from nginx — «this Fractera node is being
  connected; its address will be https://<domain>» — plus `/api/health` proxied; the core is not reachable by IP (pick: the launch
  page and its links never use the IP, measured; the IP is permanent and scanned). (b) today's read-only panel. (c) the core with an
  allow-list of status pages (more code, the same result as (a)).
- **D32 — HTTPS by IP («обход защищенного соединения»).** (a) not now; recorded in 742 as an option (pick: it only shortens the minutes
  before DNS answers, and costs a sign-in template release plus a 6-day renewal that darkens the IP on failure). (b) the core and
  sign-in by an IP certificate before the domain (certbot ≥ 5.4, a second TLS port for sign-in, host-only cookies shared across ports
  by RFC 6265 §8.5). (c) a permanent IP-only node — elements on ports, the old abandoned IP line; not recommended. A password over plain
  HTTP and a self-signed certificate are refused in every variant.
- **D33 — the elements' own second wall.** (a) a BACKLOG entry: each template's next release brings zone-aware showcase,
  place-aware temporary sign and the edge mark (pick: nginx closes the hole for all 15 now). (b) one coordinated release of all 15
  templates inside 741 (15 tags, pins and rollouts, hours).
- **D34 — 741-1 as a hotfix.** (a) 741-1 pushed alone first, the test server updated, then 741-2…7 in the second push (pick: a live
  security defect of every server node, aifa.dev included; costs one extra node update here). (b) everything in one push.
- **D35 — a Linux machine installed by `npm run launch` that measures as a server.** (a) its record says computer (the installation's
  word) and the indicator shows the disagreement with the reason (pick). (b) the launch refuses and points to the launch page.
- **D36 — «the top bar hides when a remote version exists».** (a) the launch runner keeps on the computer
  `data/node/server/launched.json` {ip, domain, readyAt}; with a live entry the computer's online bar hides its temporary address and
  «Домен и хостинг» names the server (pick — his words «автоматически скрывается»). (b) the bar stays and says where the node lives.
  Either way it breaks 738's «this computer keeps only the key and the pins» by one small record — his call.
- **D37 — the record file.** `data/node/place.json` version 2 replaces the retired declaration (pick: one name for one meaning, the stale
  «server» on this Mac disappears by the migration) — or a new name beside it.

## 8. Not in it
- An IP certificate and sign-in by IP (D32 → 742 or its own step); the certificates page itself (742); the danger zone (740).
- The 15 templates (D33); the agent kits' `telegram.cjs` copies (they ask the PHASE `silent`, not the place — correct as they are).
- The 49 GET doors one by one: with D31 (a) the IP never reaches the core, and on the tunnel the owner's trade stands.
- 739-6 (his Cloudflare key for throughsongs.com) — independent, can run any time.

## 9. Acceptance of this plan (skill `use-development-steps` §4)
Retelling with verbatim words and assumptions ✓ · reused paths ✓ · limits with what breaks ✓ · observable results ✓ · vertical
substeps with files ✓ · order, dependencies, address ✓ · every substep unfolded with two planes and a negative control (`741-k.md`) ✓ ·
decisions with picks ✓ · the owner's approval — waiting.
