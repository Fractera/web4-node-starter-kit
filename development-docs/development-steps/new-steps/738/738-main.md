# 738 — «Активация выделенного сервера»: a server is LAUNCHED, never moved to

Planned 2026-11-14 at max effort (second, deeper pass at the owner's «repeat research more deep»). Execute at normal effort; ONE node
update at the end. Probes that produced the numbers: §9.

## 1. The owner's words (verbatim, 2026-11-14)
- «после так называемого переезда я ночью оказался в состоянии когда ты завис … твой терминал находился в бесконечно процессе сборки
  ядра я прождал несколько часов … В то же самое время сайт возвращал чёрный экран. Это ситуация никуда не годится.»
- Sign-in: `http://127.0.0.1:24681/api/auth/error` — «можешь её запланировать как отдельный шаг».
- «Четыре причины для сервера убери его отсюда и перенеси на вкладку доменных хостин … после раздела какой адрес и какая машина.»
- «называться странице должна активация выделенного сервера … предварительно условия: … сервер как минимум 8 ГБ и четыре ядра если ещё
  не купили можете подобрать здесь партнёркой ссылка. На сервере должна быть установлена операционной системы Ubuntu. Ниже блок
  запустить сервер.»
- «Никакого переезда нет есть просто запуск сервера … в данном локальном компьютере меняться ничего не должно … входит у неё заново
  обнаруживает пустой страницу и до того момента пока он не в ведёт информацию о IP-адресе и пароле странице будет оставаться пустой.
  А после этого ты получишь состояние установлено ли уже Fractera …, если установлена то какая версия … насколько она отстает. От этого
  строится стратегия.»
- Steps: «проверка сервера → активация домена (… первая проверка) → процесс установки сервера → повторной проверки учётных записей … если не
  видны то мы не можем перейти к шагу … проверка установка и обновления сертификатов безопасности который должен заканчиваться чек листом …
  Только после этого … сообщаешь пользователю о том что его сервер готов.»
- «почему на этом шаге компьютера начал обновлять состояние своего ядра … компьютер должен оставаться готовым снова и снова запускать
  развёртывание новых серверов … в любой момент перезагрузить эту страницу и пока идёт какой-то из процессов начать работать со вторым
  … с 10-м и с 100-м сервером поочерёдно возвращаясь на эту страницу когда заново вводит credentials».

## 2. What happened that night — measured, not guessed
| time (UTC) | event | evidence |
|---|---|---|
| 22:42:41 | the rung «Переезд» starts | move.json `rungs.move.startedAt` |
| 22:44:55–22:45:03 | `stopAll()` stops all 17 processes of THIS computer — the core at 22:45:01, the tunnel at 22:45:03 | ~/.pm2/pm2.log lines 26839–26905 |
| 22:45 → | the main agent's terminal dies with the core; the open terminal page shows «идёт сборка ядра» and never stops | `core-build-watch.client.tsx` `detect()`: core silent + build reader silent → `{ mode: "bare" }` (rule 675-4) — ANY silence of the core is drawn as a build, forever |
| 23:14:09 | the move ends «done»; `moved.json` written; `forget()` = pm2 delete of every node process + save | move.json, `moved.json.paused-…` birth 23:14:09 |
| 23:14–23:44 | a read-only status page on the core port, then nothing | `serveStatusPage` closes after 30 min; heartbeat 23:44:03 |
| 22:45 → 08:40 | pm2 journal silent; the Mac did NOT reboot (boot time 2026-09-27) | pm2.log 26924→26925; `sysctl kern.boottime` |
| before 08:40 (11-14) | `data/node/moved.json` set aside as `data/node/server/moved.json.paused-2026-11-14` — not by any code of the node (only `return` removes the mark) | find + git grep |
| 08:40:05 | all 17 processes started again (new pm2 ids 0–16); the session-lost return woke the main agent at 08:40:16 | pm2.log 26925+, logs/agent-return.log |
The «black screen» is NOT reproduced. Candidates: the server's 503 page «Сайт обновляется» is near-black in a dark system theme (`updating.html`:
`@media (prefers-color-scheme: dark) { background: #111 }`) and is served by nginx while the server's core is down or rebuilding; the
computer's temporary address after its tunnel stopped at 22:45:03; the computer's panel after its core stopped. → ask the owner which
address he looked at (or a screenshot) before naming it.

## 3. Sign-in to 127.0.0.1:24681 — the root cause (separate step 739)
- On the server: `data/node/server.json` = phase live, domain aifa.dev, **no `domainActive`**; `logs/domain.json` absent.
- `publicAuth()` (lib/domain/public-auth.cjs) reads only `logs/domain.json` (+ `authRouted`) → null → `authBaseFromHost()` falls back to the
  registry's loopback `http://127.0.0.1:24681` — a visitor's OWN computer.
- The switch-on (`activateServerDomain`, lib/hosting/server-domain-switch.ts) writes `logs/domain.json` (via server), the APP-CONFIG url,
  the auth env for `auth.<zone>`, rebuilds the elements whose env changed (minutes) and regenerates nginx. It lived only in the server's own
  panel after the move; the move ladder never reached it.
- It is refused until every required name answers HTTPS (`steps.check`) → today blocked by data.aifa.dev (no certificate: its name still
  answered the old address when the move issued certificates; nothing retries).
- Missing too: a public name with no `logs/domain.json` must never send a visitor to loopback — say «вход ещё не включён».

## 4. The checklist — what is wrong in 737 (each with its evidence)
1. **The move model.** `stopAll` + `forget` + `moved.json` + serve's refusal = the computer is stopped and blocked by design (§2).
2. **One run per computer.** `data/node/server/move.json`; after a finished move `restart` and `cancel` answer 409 `order` (route.ts) → no next
   server. The page shows the last run on every visit.
3. **State on the computer.** A server's progress is known only through this computer's record.
4. **One host pin.** `known-host.json` and `known_hosts` hold ONE server (lib/hosting/ssh.mjs `pinHost` overwrites): connecting server #2
   forgets #1's key (system ssh/rsync with `StrictHostKeyChecking=yes` to #1 then fails); an OS reinstall on the same IP gives
   `host-key-changed` with no way out on the page.
5. **Copy of this node as the source.** Its HEAD is a node-local commit: the server runs `87f5a242`, which GitHub does not know —
   `compare/87f5a242...main` → 404 on Fractera and on the fork; version knowledge is impossible that way.
6. **No version knowledge** in the probe («nodeThere», «an earlier copy» only).
7. **The fresh road was never run live.** `freshClone` (clone + ensure-env + check-origin + fresh-project, then install.sh) passed only dry
   tests. The registries it installs from (the fork's and Fractera's) are the clean 11: 10 natives + root, all from Fractera templates.
8. **Rungs that are the server owner's** (Claude sign-in, Telegram) were driven from this computer.
9. **The domain never switched on** (§3).
10. **No final certificate checklist, no retry** — data.aifa.dev.
11. **The first account on a public domain.** «The first registered account is the architect for good». New names appear in public
    Certificate Transparency logs the minute their certificates are issued — before any switch-on; a fresh server with open registration
    can be claimed by a stranger. The core has no claim mechanism (git grep); the SSH window cannot help while this computer's node runs —
    `window` shifts only the core's port (+10000), the auth element's port stays busy here, and the core's pages point sign-in at the
    registry's 127.0.0.1:24681 = this computer's own auth.
12. **The terminal lies about silence** (675-4): any core outage is drawn as «сборка ядра» without end.
13. **Two live copies of one node identity** today: the aifa.dev server is a full copy (accounts, node code, memory) of this computer, and
    this computer runs again. Resolved by the reinstall (D25); impossible in the new model (fresh installs).
14. **Let's Encrypt budget is not counted.** Primary source (letsencrypt.org/docs/rate-limits, read 2026-11-14): 50 certificates per
    registered domain per 7 days (refill 1 per 202 min); 5 per exact set of names per 7 days (refill 1 per 34 h). The node issues one
    certificate per name (~15 per domain): one clean reinstall = ~15 of 50. aifa.dev already holds 13 issued 2026-11-13 ~20:44. Public CT
    search (crt.sh) lags — its newest aifa.dev entry is 2026-09-27 — so the node must count its own issues.

## 5. The new architecture
- **The computer** holds only the node's SSH key and a MAP of host pins (`known-hosts.json` {ip:port → fingerprint, keyLine, pinnedAt} +
  a multi-line `known_hosts`). No run record, no per-server state. It never stops, never rebuilds, never forgets itself for a server.
- **Each server holds its own state**: `/root/.fractera/launch.json` (written by a server-side `launch.sh`, run as root, detached): stages of
  prepare · fetch/clone · install · start · version; plus what the server's own node already keeps (its mark `data/node/server.json`,
  certificates, DNS and HTTPS checks under `data/node/server-side/`).
- **Every step is a server command over SSH**: probe (exists), `launch.sh` (new; wraps prepare.sh + clone/update + install.sh + start.sh),
  `npm run server -- domain <name> | dns-check | certs | check | activate` (exist: loopback calls of the server's own domain door).
- **Version** measured on the server: `git fetch https://github.com/Fractera/web4-node-starter-kit.git main` then
  `git rev-list --left-right --count HEAD...FETCH_HEAD` → «N behind» (measured on 213.199.61.7: 1.4 s, behind 1, local-only 348) — works
  for any install and costs no GitHub API quota.
- **Parallel servers**: one detached runner per server ON the server; the page asks by IP; reload-proof.

## 6. The page «Активация выделенного сервера» (address kept: /architect/hosting/hosting; title changes)
- **Preconditions card**: a server with ≥ 8 GB RAM and 4 cores (partner link, skill helpful-links), Ubuntu installed (24.04 LTS recommended).
- «Четыре причины для сервера» → «Домен и хостинг», right after «Какой адрес и какая машина» (hosting-notes).
- **«Запустить сервер»** — empty on every visit: IP, SSH port, root password → [Проверить сервер]. The password installs the node key once;
  later the key alone (D24). A changed host key: shown with both fingerprints and «Сервер переустановлен — доверять новому ключу» (re-pin).
- **The ladder**:
  1. **Сервер** — connect.
  2. **Проверка сервера** — OS, RAM, cores, disk, ports, another install (the 737-7 «busy» → «Очистить» stays); Fractera present, its version,
     «behind N» against Fractera main, a launch running there now. One line of strategy: «Установить» / «Обновить (отстаёт на N)» /
     «Уже последняя — к домену».
  3. **Активация домена** — the 737-19 ladder (detect · who · records), its state on the server (`domain`, `domainWay`, `detect.json`); a
     first check; the next step does not wait for DNS.
  4. **Установка сервера** — `launch.sh` detached (fresh from GitHub, or the server's own `node:update` for an older install); progress from
     launch.json; leave and come back.
  5. **Повторная проверка записей** — every required name → the server on two public resolvers; the gate.
  6. **Проверка, установка и обновление сертификатов безопасности** — `certs` with retries for names that woke late, renewals for expiring
     ones, the week's issue count per domain against 50/5; ends with the checklist: name · DNS · certificate (issuer, expiry) · HTTPS ✓/✗.
  7. **Сервер готов** — the architect claimed (D23) → `activate` → the sign-in button verified to lead to `https://auth.<zone>` → links (site,
     panel, sign-in) and what the server's owner does next in its own panel (Claude subscription, Telegram bot).
- **Removed**: the road «Переезд» and all it needed (stopAll, forget, moved.json and serve's refusal — a legacy mark is moved to
  `data/node/server/done/` by the update, `return`, rehearse/silent phase, «Копировать заново», the commit check, the status page), the rungs
  claude and telegram, `move.json` as the page's state, the one-slot host pin.

## 7. Stages (each with a proof reading code cannot pass)
| # | result | proof |
|---|---|---|
| 738-1 | texts: title, preconditions card, «Четыре причины» moved after «Какой адрес и какая машина» | eyes on both tabs (light, dark), check:i18n |
| 738-2 | host pins as a map + «trust the new key» | test: two test SSH servers in turn, then system ssh to the first still works; negative: a changed key refused until trusted |
| 738-3 | server-side `launch.sh` + launch.json + version (fetch/rev-list) | dry test on the in-process SSH server; live probe numbers on 213.199.61.7 |
| 738-4 | the door `/api/node/launch` (by IP; reads launch.json, the server's mark, its checks) and the stateless ladder island | test: two «servers» launched in parallel, a reload shows each by its IP; negative: nothing per server written under data/node/server/ except pins |
| 738-5 | domain steps through `npm run server -- …` over SSH; certificates with retries + the checklist + the weekly count | test: a name pointing elsewhere, then here → issued on retry; the counter refuses past the budget |
| 738-6 | the architect claim (D23) + switch-on + sign-in check | live: the sign-in button leads to https://auth.<zone>; negative: before the switch-on «вход ещё не включён», never loopback |
| 738-7 | removal of the move road and its guards; legacy `moved.json` set aside on update | grep-proof; tests updated; serve:start never refuses here |
| 738-8 | the terminal names a silent core truthfully after N minutes without a build record (675-4 corrected) | test of `detect()` with silent core + reader: «ядро не отвечает», not «сборка» |
| 738-9 | clean run on a reinstalled Ubuntu: fresh install, domain, certificates, ready; then a second server from the same page while the first installs | the owner's T2 (fractera.ai) |

## 8. Decisions (my pick first)
- **D21** source of a new server: fresh Fractera from GitHub (pick) — measured: a copy's version cannot be compared (404) and it duplicates
  this node's identity; a copy of this node only as an explicit later option.
- **D22** «latest»: Fractera/web4-node-starter-kit main (pick).
- **D23** the architect of a fresh server: a one-time claim in the auth template — the launch prints a one-time sign-up code over SSH, the
  auth element accepts the first registration only with it (pick; needs a release of fractera-auth-starter, skill release-template);
  alternative: the launcher asks the architect's email and the auth element accepts only that address first.
- **D24** the password on later visits: optional once the node key is on the server (pick).
- **D25** aifa.dev now: leave as is; the clean run of 738 starts after an OS reinstall; the new page trusts the new host key itself.
- **D26** certificates: keep one per name (a failing name never blocks the others), add the weekly counter; a single certificate for all names
  only if the count nears the limit (pick).

## 9. Probes (2026-11-14)
- `~/.pm2/pm2.log` lines 26839–26957; `sysctl -n kern.boottime`; `find data logs -newermt …` → `data/node/server/moved.json.paused-2026-11-14`.
- SSH (node key) to 213.199.61.7: `data/node/server.json`, `logs/domain.json` (absent), `git rev-parse` 87f5a242, fetch Fractera main →
  `rev-list --left-right --count` 348 / 1 in 1375 ms, `fractera-root cert-list` → 13 certificates, notAfter 2027-02-11 21:44–21:46.
- `gh api repos/{Fractera,aifa-agi}/web4-node-starter-kit/compare/87f5a242...main` → 404; `compare/e2466632...main` → ahead 1.
- Registries of the fork and Fractera (contents API) → 11 services each (10 natives + root, Fractera template repos).
- letsencrypt.org/docs/rate-limits (fetched); crt.sh `%.aifa.dev` newest 2026-09-27.
