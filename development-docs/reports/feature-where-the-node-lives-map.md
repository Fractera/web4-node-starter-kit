# Where the node lives — the map of every behaviour that differs between a computer and a server (step 741-7, 2026-11-14)

The owner's question (2026-11-14 11:18, verbatim): «ты уже решил каким именно образом гарантировано архитектура определяет живёт она на
локальной машине или на удалённом сервере?». The answer since 741: **one record, written by the act that installed the node, bound to
its machine, checked by a measurement, read by one reader** — `data/node/place.json` version 2, `lib/hosting/place.mjs`
(`nodePlace` for the full answer, `placeKind` for the request path), `/api/node/place` and `useNodePlace()` for the browser. The guard
`check:place-readers` (in the prebuild) refuses a new file that decides it from the address bar or from the server's launch mark.

| # | Behaviour | On a person's computer | On a dedicated server | Who decides (path) | Proof / owner |
|---|---|---|---|---|---|
| 1 | The record of the place | `npm run launch` writes «home» | `install.sh` stage `place` writes «server» | `lib/hosting/place.mjs` `writePlaceRecord`, `scripts/place-record.mjs` | 741-2 tests (installed / migrated / foreign / mismatch) |
| 2 | Nodes installed before 741 | first `serve:start` writes it from the measurement (the 276-3 declaration replaced) | first `serve:start` writes it from the launch mark | `migratePlaceRecord`, `scripts/serve.mjs` `start` | 741-2 tests; live: this Mac after its update |
| 3 | The public face | the quick tunnel (temporary address), then the named tunnel of an own domain | nginx: the bare IP shows a card + `/api/health`; names with certificates | `lib/hosting/nginx.mjs`, `scripts/serve.mjs` (`tunnelAllowed`) | 741-1 tests + `nginx -t` on the server; 741-4 tests |
| 4 | The name a request carries | Cloudflare routes by name — a forged Host gets 403 there (measured) | nginx passes only the name it matched; a 443 default server refuses unknown names | `lib/hosting/nginx.mjs` | probes `host-forgery.sh`, `tunnel-forgery.sh` |
| 5 | The owner at the keyboard | loopback, no Cloudflare headers, no edge mark | the same rule: a process on the server or the SSH window (no nginx, no edge mark) | `lib/auth/owner-at-machine.ts`, `lib/hosting/edge.mjs` | 741-5 live: window → `owner@machine`; Host localhost from the internet → 000 |
| 6 | The temporary address trade (243: read-only panel by the link) | the quick-tunnel name and (theoretically) an IP | never — a tunnel name or an IP literal is a forgery there | `lib/auth/request-signs.mjs` `temporaryFor` ← `placeKind`; in the proxy only `proxy/computer.ts` has it — the proxy is two files since 744-1 | 741-3 tests; `test:proxy-split` (744-1) |
| 7 | The showcase | only a node configured as `https://fractera.ai` AND reached by that name | the same | `lib/showcase.server.ts` `isShowcaseRequest` | 741-3 tests; live probe before: forged name → all roles |
| 8 | The old IP-mode switch `FRACTERA_IP_NODOMAIN_MODE` | not read | not read | `lib/auth/auth-bypass.ts` — development only | 741-3 |
| 9 | Reaching the panel before a domain | localhost | `npm run server -- window --ip <IP>` from the computer that launched it | `lib/hosting/window.mjs` | 741-5 |
| 10 | The hosting page | the launch view (also through the tunnel — read-only) | the server's own domain ladder | `components/hosting/server-place.client.tsx` ← `useNodePlace` | 741-6 eyes |
| 11 | The online bar (top) | shown on loopback; hidden once this computer launched a live server (D36) | never | `components/node-state/online-bar.client.tsx`, `lib/hosting/launched.mjs` | 741-6 eyes |
| 12 | Temporary / dead address alarms, «open on this computer» | as before | never | the alarms ← `useNodePlace` | 741-6 eyes |
| 13 | The GitHub alarm («элементы хранятся только на этом …») | «компьютере» | «сервере» — the same logic | `components/node-state/github-token-alarm.client.tsx` | 741-6 eyes |
| 14 | The place card on «Дашборд → Этот компьютер» | «Приложение работает на локальном компьютере» (orange token) | «Приложение работает на удалённом сервере» | `components/dashboard/machine-board.client.tsx` | 741-6 eyes |
| 15 | The owner band | «Вы на этом компьютере» | through the window: «Вы смотрите пульт сервера через SSH-окно» | `owner-band.client.tsx` | 741-6 |
| 16 | Node updates | `node:update` merges the synced fork with the person's own git identity | the same command; the node's neutral identity «Fractera node» when none is set; every start and rebuild re-applies nginx | `scripts/node-update.mjs`, `lib/deploy/git-identity.mjs`, `scripts/serve.mjs` `reapplyServerEdge` | 741-8 tests (the server's rollback reproduced); 741-1 |
| 17 | The fork sync before an update | the main agent of the computer (Chrome or a token) | the same — the server pulls the person's fork | memory «Fork sync is mine» | — |
| 18 | The closed lid of a core build | Cloudflare page copies serve the sites | nginx serves the 503 page «the node is updating» | `lib/deploy/quiet-build.cjs`, `lib/hosting/nginx.mjs` (`MAINT_PAGE`) | 737 |
| 19 | A new element's public name | a Cloudflare subdomain on the named tunnel | an nginx name + DNS record + certificate | `lib/web4-items/element-domain.ts`, `scripts/dedicated-server/name-up.mjs` | 737-16 |
| 20 | Certificates | Cloudflare's | Let's Encrypt per name, renewed by certbot | `scripts/dedicated-server/certs.mjs` | 742 (the page, server only) |
| 21 | Agent wakes during a rehearsal | — | refused in the phase `silent` (737) | `lib/hosting/phase.cjs`, the agent kits' `telegram.cjs` | phase, not place — allowed by the guard |
| 22 | Memory, survival, the load rule | measured | measured | `lib/free-memory.cjs`, `scripts/load-rule.mjs` | same on both |
| 23 | Telegram bots | one poller per token — the computer's | a server node needs its own bot (two pollers of one token conflict) | — | named, not built |
| 24 | Eyes and Chrome | eyes and the person's Chrome with the extension | eyes only | `scripts/eyes.mjs` | — |
| 25 | The tab «Этот компьютер» itself | true | its name is not true on a server | — | the owner's call when he sees the card |

## Not built here, named
- HTTPS by bare IP (Let's Encrypt IP certificates, certbot ≥ 5.4) — D32: not now, an option for 742.
- The elements' own second wall (their templates carry showcase / temporary / owner signs; nginx closes the hole for all of them) — D33:
  each template's next release (BACKLOG).
- A server node's own Telegram bot (row 23); the name of the tab «Этот компьютер» on a server (row 25).
