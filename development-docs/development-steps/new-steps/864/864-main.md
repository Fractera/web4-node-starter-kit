# 864 — a name born on a server with an active domain gets its certificate, and the panel can issue a missing one

**Asked:** fractera.ai's main agent through Roma, Telegram 1579, 2026-11-27 12:54 UTC (intake `pre-steps/2026-11-27-new-name-no-cert.md`):
the node update to its core dd3105e4 brought the native element `market` (862-1); its name market.fractera.ai got only the port-80
placeholder (503 «certificate is not issued yet»), no 443 block; `npm run server -- domain` still said `ok … active`; the element's card
«Адрес в интернете» said «Имя подключено, но адрес не отвечает (код —)» with nothing to press. Repaired there by hand (`server --
dns-check` → `certs` → `check`). The same on aifa.dev after its update to bbb30a5a: market.aifa.dev — TLS «unrecognized name» (curl 35,
measured from the Mac 2026-11-27 23:17 UTC), port 80 — nginx 503.

**Roma's word, 2026-11-27 23:15 UTC (Telegram 1733), verbatim:** «Блин я не хочу частный случай я хочу системное решение я хочу эту
проблему закрыть если она существует». 23:18 (1737/1738): «Следом после этого создавай как мы с тобой договорились покупку элементов …» ·
«я на полчаса пойду отдыхать ты продолжай делай все что сможешь». The plan below is carried on that word; no manual repair is the answer.

## 1. Retelling and decisions

- The defect is a missing EVENT, not a missing mechanism: `name-up.mjs` (737-16) already gives a new name nginx, DNS and its
  certificate, but only the element-address door starts it (`/api/node/reach` POST — a birth by `npm run create`, a rename, an own
  domain). A birth by an update (`services-install` inside `node:update`) never calls that door, so its name stays at 503.
- **Decision (mine): heal at the node's own events, not at the birth path.** Every start and the one end of every build on a live server
  with its domain switched on asks «which required names have no certificate?» and starts `name-up.mjs` once. One place covers every road
  a name can arrive by — an update, a birth that failed to connect, a certificate deleted or lapsed — instead of patching each road. No
  timer: the start is the event (CLAUDE.md §6: behaviour nobody ordered is never built).
- **Decision (mine): the certificate run asks public DNS first and checks HTTPS after.** ✗ The «Проверить и дополнить» button issued
  nothing for a name born after the last DNS check (its DNS read «unchecked») — exactly why fractera.ai needed a hand-run `dns-check`.
- **Decision (mine): Let's Encrypt's limit is respected by the automatic road only.** «Up to 5 authorization failures per identifier …
  by one account every hour» (letsencrypt.org/docs/rate-limits) — a name failed within the hour waits for the next start; the person's
  button is never held by it.
- I assume an optional name never makes the domain unfinished, and an element switched off still needs its certificate (744-9).

## 2. What is reused (paths that open)

`scripts/dedicated-server/name-up.mjs` (nginx learn → `names-ready.mjs` → `certs.mjs` → HTTPS check) · `lib/hosting/server-domain.mjs`
(`domainState`, `namesToIssue`, `runDnsCheck`, `runHttpsCheck`, `certList`) · `lib/hosting/certs.mjs` (`coverage`) · `scripts/serve.mjs`
(`reapplyServerEdge` — the 741-1 edge at every start and build) · the root helper verbs `cert-issue`, `cert-list`, `nginx-apply` (unchanged)
· `components/services/service-reach.client.tsx` and its POST (`serverReach` → `name-up.mjs`) · `scripts/hosting.test.mjs` fixtures.

## 3. Known limits

- The wall (skill `server-wall`): everything here runs as the node's user and reaches root only through `fractera-root` — no element's
  folder is touched, no new helper verb. · The machine never leaves its edge half-written: nginx is regenerated before the heal.
- No timer, no polling beyond the person's own press (the card follows its press for at most 3 minutes, then nothing runs).
- The core is Fractera's: the change ships in a Fractera release; servers take it by «Обновить сборку ядра».

## 4. The case matrix (skill `before-a-build`)

| Cell | Touched? | Proof |
|---|---|---|
| this computer | no — `healServerNames` returns off a live server; the card's server branch never draws here | unit test: no helper → nothing |
| a server, domain on | yes — the heal, the runner's order, the CLI verdict, the card | unit + CLI process tests; aifa.dev live after its update |
| a server, domain not on yet | no — the launch's own certificate step decides | negative in the unit test |
| cuid / renamed address / own domain | all are rows of the one names table — the heal treats them alike | the table is shared (737-1 tests) |
| the person's browser | the card: «нет сертификата» + «Выпустить сертификат», follow after the press | types + guards; seen on a server |
| an element's keyed call · the internet | not touched | — |
| just born · deleted element | born: the heal's case; deleted: its name leaves the table | the unit test; 737 delete test |

## 5. Substeps

| Substep | Result that can be shown |
|---|---|
| 864-1 | a required name of an active server domain without a certificate gets one with no command: at every start and the end of every build (`healServerNames` → `name-up.mjs`); the runner asks DNS first and HTTPS after |
| 864-2 | what is unfinished is said: `server -- domain` prints «не закончено» and `===SERVER_DOMAIN=== unfinished … uncertified <names>`; the element card «Адрес в интернете» on a server says «нет сертификата» and offers «Выпустить сертификат», then follows the run |

Work address: the core (fork `main` → Fractera `main` by Roma's window), one release for both substeps; aifa.dev is the live case.
**Live proof after the update:** https://market.aifa.dev answers HTTPS 200 with no command typed on the server (negative before: curl 35,
23:17 UTC). On the way: `scripts/element-wall.test.mjs` was red since 825-8 (efb105b0, `unzip` after `acl` in prepare's apt line) — its
regex fixed here so the wall tests are green before a server update (skill `server-wall` §6.6).

**Not in 864:** the state file's length guard (Roma 1733 on the same evening) — its own step 867; the paid purchase path (862).
