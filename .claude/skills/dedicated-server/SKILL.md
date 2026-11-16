---
name: dedicated-server
description: "Build process for the person, work process for you. A Fractera node is LAUNCHED on an Ubuntu VPS of the person's own — a fresh node from their fork that lives there around the clock, by its IP and then on its domain with a certificate for every name; the person's computer changes nothing and can launch one server after another. Load it when the person wants something to work while the computer is off, asks about a VPS, a dedicated server, «запустить сервер», «переехать на сервер», a server's IP and password, the page «Активация выделенного сервера», the records to write at a registrar for the server, certificates, sign-in on a server's domain, or when `npm run server` prints a marked line you must explain."
---

# A node launched on a dedicated server (steps 737, 738)

**The owner, 2026-11-14:** «Никакого переезда нет есть просто запуск сервера … в данном локальном компьютере меняться ничего не должно …
в любой момент перезагрузить эту страницу и пока идёт какой-то из процессов начать работать со вторым … с 10-м и с 100-м сервером».
Everything below is plain code; you call it and read its marked line. No model installs a server.

## Where it lives

- The page «Активация выделенного сервера» of the core (`/architect/hosting/hosting`): on the person's computer — the launch (empty on
  every visit: the IP and the root password, then eight steps); on a server node — that server's own domain steps; on its bare IP — the
  same steps read-only.
- The door `/api/node/launch` (stateless: every call names the server) → the runner `scripts/dedicated-server/launch.mjs` (one act per
  call, awaited; the last line `===LAUNCH=== <json>`).
- **The state of a server lives on that server**: `/root/.fractera/probe.json` (its check and its Fractera version), `launch.json` +
  `launch.progress.jsonl` (the launch), `domain.json` (the domain chosen on the page, who writes the records, the first check, where
  sign-in leads); the server node's own mark `data/node/server.json` (phase `live`, `independent: true`, domain, switched on). Read by
  `state.sh` there.
- The computer keeps NO key to a server (744-3): only the map of pins (`known-hosts.json` + `known_hosts`, one entry per server) and the
  ledger of Let's Encrypt certificates per domain (`le-ledger.json`). Never a run record. Access is a VISIT of at most a day: the root
  password typed by the person makes a key in memory, its line in root's `authorized_keys` carries `expiry-time` by the server's own
  clock (sshd itself refuses it at the deadline), the key lives in the person's browser as an HttpOnly cookie of the launch door. You
  cannot reach a server by yourself — that is the design (the owner: «в случае взлома пользователи получит доступ ко всем серверам»).
  The SSH window (`npm run server -- window --ip`) asks the password in the person's own terminal.

## The eight steps

| Step | What runs | Done when |
|---|---|---|
| 1 the server | 760-1: «Запомнить сервер на 24 часа» (on by default) fills the IP and port in this browser for the visit's day, never the password · the root password → a visit of a day (`openVisit`: the line with the server's own deadline, proven by a second connection, the server's key pinned); a server without password login is named, never worked around | connected by the visit key; «Доступ до HH:MM» |
| 2 check | `probe.sh` as root: system, memory (8 GB and 4 cores recommended — the owner's minimum), disk, ports, other sites, a Fractera install with its commit and «behind N» against Fractera's main (`git fetch` + `rev-list` on the server) | the judge says no «fail» and the verdict (744-4, `lib/hosting/relation.mjs`) is not «unrelated»: clean → install · related (this fork, never a 737 move) → update when its fork is ahead (behind = against ITS fork) or latest · unrelated (a move, another fork, another node, foreign sites or root programs) → only «Удалить прежнее состояние» (`clear.sh --node`: set aside whole in /root/fractera-cleared-…, never erased) |
| 3 domain | the 737-19 ladder: the domain · where its DNS lives · who writes the records — measured since 760-8 (it replaced 759's «registrar only» at the owner's word): DNS in Cloudflare and this node's key sees the zone → the node writes A `@`, A `*` DNS only and removes what is in the way after one confirm naming every record (`records-plan`, `records-write`); otherwise the key first, or by hand where the DNS is kept (the cabinet named by the name servers), with «Отдать агенту» for the person's Chrome (760-9) · the records + a first check from public resolvers | chosen and checked once — the install never waits for DNS |
| 4 installation | `launch.sh` as root, detached: prepare · source (clone of the fork + a fresh `.env.local` + check-origin + fresh-project) · install (`install.sh`) · mark · start (`start.sh live`) · version; an older install: prepare · `npm run node:update` there · mark · start · version | it RUNS (758: step 5 opens beside it); its failure opens it again |
| 5 the server's bot | 758, optional: a BotFather token → the runner's stdin → the server; before the node lives it waits in `/root/.fractera/telegram.json` (0600) and `readState` hands it to the node's channel door at its first answer; the page sees the tail, the bot's name, the invite link; «Позже» kept on the server; 760-10: «Отдать агенту» — the main agent makes the bot in the person's Telegram Web, never reading or typing the token (the person pastes it) | the bot set, its token waiting, or «later» — AND Fractera installed with its node answering |
| 6 records again | the server node's `dns-check` | every required name points to the server — the gate |
| 7 certificates | the server node's `certs` (one per name, a failing name never stops the others), refused past Let's Encrypt's week (50 per domain, 5 per name); then `check` — HTTPS from the internet; the checklist name · DNS · certificate · HTTPS | every required name certified and answering by HTTPS |
| 8 ready | the server node's `activate` (sign-in moves to `auth.<zone>`, nginx regenerated) and the sign-in check from the internet: `https://auth.<zone>/api/auth/providers` 200 and the architect pages redirect there | sign-in leads to `https://auth.<zone>` |

A reinstalled server shows a new key: the page names both fingerprints; the person types the password and trusts the key they saw
(`--trust <fingerprint>`) — never whatever answers. A busy server (other nginx sites, another install's pm2): «Очистить» behind a dialog
(`clear.sh` stops and keeps everything in `/root/fractera-cleared-…`, erases nothing).

## On the server itself — `npm run server -- <verb>`

As the owner at that machine's keyboard (you there, from Telegram): `domain [<name>]` · `dns-check` · `certs` · `check` · `activate` ·
`deactivate` (the server node's door on loopback), `names` · `dns --ip <IP>` · `nginx [--write]` · `phase`. `npm run server -- domain` alone
prints every name with its DNS, certificate and HTTPS state. Never tell the person a name works before `check` said so.

## Laws

- The password goes from the person into the page only; you never ask for it in chat and never type it (a credential in a field is the
  person's act).
- The computer is never stopped, rebuilt or marked for a server (737's move did all three — ✗ 2026-11-13: ten hours of a stopped core
  drawn as «сборка ядра»). A legacy `data/node/moved.json` is set aside by `serve:start`.
- A server gets a fresh node from the fork — its own identity, keys and accounts; this computer's data never travels.
- Root acts only through `/usr/local/sbin/fractera-root` (nginx-apply, cert-issue, cert-list, cert-delete, cert-upload, playwright-deps,
  pm2-startup, firewall-status) — no other root command from the node.
- Behind nginx nobody is «the owner at the keyboard» (the edge mark); the bare IP is read-only like a temporary address.
- The first registration on a server's domain becomes its architect for good — and only with the architect's one-time code (739): step 7
  asks the server's sign-in element for it (its door `/api/claim`, the architect's key, loopback), shows it once; a new code replaces the
  old. Until the domain is switched on, a public name says «Вход ещё не включён» — never a redirect to 127.0.0.1.
- A server to rent: skill `helpful-links` (partner links disclosed). A claim about Let's Encrypt, Ubuntu or a provider — from its primary
  source (letsencrypt.org/docs/rate-limits for the limits).

## Proven and not yet

Proven without a server: the map of pins (two servers, system ssh to the first after the second; a reinstalled key refused until the
seen one is trusted), the launch end to end dry on in-process ssh2 servers, two servers in parallel, the domain kept on the server, the
weekly count, the sign-in check, the silent-core verdict (`npm run test:hosting-launch`, `npm run test:hosting`). Waiting for a reinstalled
Ubuntu (the owner's T2, fractera.ai): the fresh install live, certificates from Let's Encrypt, the switch-on and sign-in there. Say which
side a question is on.
