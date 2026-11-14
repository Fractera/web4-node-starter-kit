# 738 — «Активация выделенного сервера»: a server is LAUNCHED, never moved to

Planned 2026-11-14 ~09:10 UTC after the owner's live run of 737 (T1 aifa.dev). Execute at normal effort; one node update at the end.

## 1. The owner's words (verbatim, 2026-11-14)
- «после так называемого переезда я ночью оказался в состоянии когда ты завис … твой терминал находился в бесконечно процессе сборки
  ядра я прождал несколько часов … В то же самое время сайт возвращал чёрный экран. Это ситуация никуда не годится.»
- «при попытке входа адрес на вкладке авторизации очевидно совершенно не соответствует» → `http://127.0.0.1:24681/api/auth/error`;
  «можешь её запланировать как отдельный шаг».
- «Четыре причины для сервера убери его отсюда и перенеси на вкладку доменных хостин … после раздела какой адрес и какая машина.»
- «называться странице должна активация выделенного сервера … предварительно условия: у вас должен быть хостинг который имеет сервер как
  минимум 8 ГБ и четыре ядра если ещё не купили можете подобрать здесь партнёркой ссылка. На сервере должна быть установлена операционной
  системы Ubuntu. Ниже блок запустить сервер.»
- «Никакого переезда нет есть просто запуск сервера … независимо от того поднялся или не поднялся … в данном локальном компьютере меняться
  ничего не должно пользователь после того как выходит с этой страницы и входит у неё заново обнаруживает пустой страницу и до того
  момента пока он не в ведёт информацию о IP-адресе и пароле странице будет оставаться пустой. А после этого ты получишь состояние
  установлено ли уже Fractera …, что тебе возвращают запрос по IP-адресу, если установлена то какая версия установлена последней или
  насколько она отстает. От этого строится стратегия.»
- Steps: «проверка сервера → активация домена (… первая проверка) → процесс установки сервера → повторной проверки учётных записей …
  если не видны то мы не можем перейти к шагу … проверка установка и обновления сертификатов безопасности который должен заканчиваться
  чек листом … Только после этого … сообщаешь пользователю о том что его сервер готов.»
- «почему на этом шаге компьютера начал обновлять состояние своего ядра … если компьютер должен оставаться готовым снова и снова запускать
  развёртывание новых серверов … в любой момент перезагрузить эту страницу и пока идёт какой-то из процессов начать работать со вторым
  … с 10-м и с 100-м сервером поочерёдно возвращаясь на эту страницу когда заново вводит credentials».

## 2. Measured (2026-11-14 08:40–09:05 UTC)
| fact | value |
|---|---|
| T1 result | https://aifa.dev 200, Let's Encrypt YE2 until 2027-02-11; architect.aifa.dev 200; auth.aifa.dev 307; checks health/commit/edge/firewall/elements green; the server's bot greeted 23:14; move 22:42→23:14 (31.5 min incl. the core rebuild on the server); 13 of 15 names certified |
| uncertified | data.aifa.dev — «elsewhere» at the move (an old answer in a cache), points to the server now, no certificate and nothing retries; cache.aifa.dev — element off |
| sign-in error | server `data/node/server.json`: phase live, domain aifa.dev, **no `domainActive`**; `logs/domain.json` absent → `publicAuth()` (lib/domain/public-auth.cjs) null → `authBaseFromHost` falls back to the registry's loopback `http://127.0.0.1:24681` |
| switch-on gate | `activate` requires `steps.check` (every required name answers HTTPS) → blocked by data.aifa.dev while its certificate is missing |
| the computer after the move | by code: `move()` → `stopAll(root)` (every node process incl. the core and the tunnel), a read-only status page on the core port for 30 min, then `moved.json` + `forget(root)` (pm2 delete + save) and `serve:start` refuses while `moved.json` exists. The terminal died with the core; the address went dark — what the owner saw. |
| 08:40 | this computer's node runs again (pm2 started 08:40), `moved.json` is gone, nothing in the code removes it except the road `return` (not run). Unexplained; moot once the move road is gone |
| one record per computer | `data/node/server/move.json`; after a finished move `restart` and `cancel` answer 409 `order` → no way to a next server from the tab |

## 3. Critical analysis of 737 — the checklist of what is wrong
1. **The move model itself.** The tab moved THIS node: the computer was stopped, forgotten and blocked from starting. The owner's model is
   the opposite: the computer is a launch pad that never stops and never rebuilds for a server.
2. **The page keeps a run.** One `move.json` per computer, shown on every visit; unfinished runs need «Начать заново»; after a move nothing
   can be done. Required: an empty page until IP and password; every state read from THAT server.
3. **The state lives on the computer.** The progress of a server is known only to the computer that started it, through a local record.
   Required: the server holds its own launch state (`~/.fractera/launch.json` on the server, written by the server-side runner); the computer
   only starts and reads — any number of servers, in any order, from any reload.
4. **Copy of this node as the source.** rsync of this computer's tree (791 MB, silent phase, data excludes, «Копировать заново», the commit
   check, the rehearsal) exists only for the move. Required: the server installs Fractera itself from GitHub (fresh), or updates an existing
   install; a copy of this node stays an explicit option only if the owner wants it (D21).
5. **No version knowledge.** The probe tells «nodeThere» and «an earlier copy», never «Fractera vX installed, latest is Y, behind N».
6. **Rungs that belong to the server's owner.** «Claude Code на сервере» and «Telegram» were done from this computer; in the owner's model
   the server lives in another person's hands — their subscription and their bot are set in the server's own panel.
7. **The domain was never switched on.** Records (737-15/19) and certificates happened, the switch-on (`activateServerDomain` → `logs/domain.json`
   with `authRouted`, the auth element's env) lived only in the server's panel after the move → sign-in leads to loopback.
8. **No final certificate checklist.** Names that pointed elsewhere at the move got no certificate; nothing retried; the move did not wait for
   all names; nothing told the person which names are covered.
9. **The first account on a public domain.** «The first registered account is the architect for good». Switching a fresh server's domain on
   with open registration lets anyone become its architect. The launch must create or claim the architect before the switch-on (D23).
10. **The agent session dies with the computer's core** (stopAll) — gone with the move road.
11. **Two domain UIs merged in 737-19** (keep): the ladder `server-ladder` becomes the page's «Активация домена» step.

## 4. The new page — «Активация выделенного сервера» (route address kept: `/architect/hosting/hosting`, only the title changes)
- **Preconditions** card: a server with ≥ 8 GB RAM and 4 cores at a hosting provider (partner link, skill helpful-links); Ubuntu installed
  (24.04 LTS recommended; the probe measures it).
- «Четыре причины для сервера» → the tab «Домен и хостинг», right after «Какой адрес и какая машина».
- **«Запустить сервер»** — empty on every visit: IP, SSH port, root password → [Проверить сервер]. The node key is installed on the server
  the first time (the password once); later visits by the same key, the password field then optional.
- **The ladder** (each step reads the server's own state; nothing per server is kept on the computer except the node key and that IP's host
  fingerprint):
  1. **Сервер** — connect (password once, the node key).
  2. **Проверка сервера** — OS, RAM, cores, disk, ports, plus: Fractera installed? its version (the server's /api/health commit + `git describe`),
     the latest version (Fractera's main on GitHub, D22), behind by N commits; an install running there now (its launch.json). Strategy shown
     in one line: «Установить» / «Обновить до последней (отстаёт на N)» / «Уже последняя — к домену».
  3. **Активация домена** — the 737-19 ladder (detect, who, records); a first check; may go on before DNS is ready (it wakes during the install).
  4. **Установка сервера** — the server-side installer, detached, from GitHub (fresh) or an update in place; progress in the server's
     launch.json; reload-proof; the computer can launch the next server meanwhile.
  5. **Повторная проверка записей** — every required name resolves to the server on two public resolvers; the gate.
  6. **Проверка, установка и обновление сертификатов безопасности** — issue the missing, renew the expiring, retry the failed; ends with a
     checklist: name · DNS · certificate (issuer, expiry) · HTTPS from the internet ✓/✗.
  7. **Сервер готов** — the architect claimed (D23), the domain switched on (logs/domain.json + auth env), sign-in verified (the sign-in
     button leads to `https://auth.<zone>`), links: site, panel, sign-in; what the server's owner does next in its own panel (Claude
     subscription, Telegram bot).
- **Removed**: the road «Переезд» (stopAll, forget, moved.json and serve's refusal, return, rehearse/silent phase, «Копировать заново», the
  commit check, the computer's status page), the rungs claude and telegram on this tab, `move.json` as the page's state.

## 5. Stages (each with a proof reading code cannot pass)
| # | result | proof |
|---|---|---|
| 738-1 | texts: the page title, preconditions card, «Четыре причины» moved to «Домен и хостинг» after «Какой адрес и какая машина» | eyes on both tabs (light, dark), check:i18n |
| 738-2 | server-side state: `scripts/dedicated-server/launch-state` on the server (`~/.fractera/launch.json`: version, install, domain, certs, ready) + the probe's version fields; latest from GitHub | test: a fixture server with and without Fractera, behind by N; live probe of 213.199.61.7 prints the numbers |
| 738-3 | the ladder island rewritten stateless: steps 1–7 read the door by IP; no move.json | test: two «servers» (two test SSH servers) launched in parallel, page reload shows each by its IP; negative: no file under data/node/server/ except keys |
| 738-4 | installer: fresh from GitHub / update in place, detached, progress in launch.json | dry-run test + live run on a reinstalled Ubuntu |
| 738-5 | certificates step with retries and the checklist | test with a name pointing elsewhere then here → issued on retry |
| 738-6 | ready: architect claim + switch-on + sign-in check | live: the sign-in button on the server leads to https://auth.<zone>; negative: before the switch-on it is refused with a reason, never loopback |
| 738-7 | removal of the move road and its guards | grep-proof + tests updated; serve:start never refuses on this computer |

## 6. Separate step — 739 «Вход на своём домене» (the owner: «запланировать как отдельный шаг»)
Root cause measured above (no switch-on on the server). On the computer: the owner gives a domain; activate it here through «Активация
домена» (the tunnel) and check that sign-in leads to https://auth.<zone>. On the server: covered by 738-6. Also: a missing `logs/domain.json`
must never send a visitor of a public name to loopback — answer «вход ещё не включён» instead (negative control).

## 7. Decisions (my pick first)
- D21 the source of a new server: fresh Fractera from GitHub (pick); a copy of this node only as an explicit option later.
- D22 «latest version»: Fractera/web4-node-starter-kit main (pick) — not the person's fork, which may lag.
- D23 the architect of a fresh server: claimed in step 7 through the SSH channel before the switch-on — a one-time sign-up link opened on
  the server's loopback through the node's window (pick); alternative: the launcher asks the architect's email and the server accepts only it.
- D24 the password on later visits: optional once the node key is on the server (pick) — the owner said «заново вводит credentials».
- D25 this run on aifa.dev: leave as is; the clean run of 738 starts after an OS reinstall (the old host key forgotten by the new page itself).
