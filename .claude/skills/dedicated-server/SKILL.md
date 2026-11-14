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
  every visit: the IP and the root password, then seven steps); on a server node — that server's own domain steps; on its bare IP — the
  same steps read-only.
- The door `/api/node/launch` (stateless: every call names the server) → the runner `scripts/dedicated-server/launch.mjs` (one act per
  call, awaited; the last line `===LAUNCH=== <json>`).
- **The state of a server lives on that server**: `/root/.fractera/probe.json` (its check and its Fractera version), `launch.json` +
  `launch.progress.jsonl` (the launch), `domain.json` (the domain chosen on the page, who writes the records, the first check, where
  sign-in leads); the server node's own mark `data/node/server.json` (phase `live`, `independent: true`, domain, switched on). Read by
  `state.sh` there.
- The computer keeps only the node's SSH key (`data/node/server/id_ed25519`), the map of pins (`known-hosts.json` + `known_hosts`, one
  entry per server) and the ledger of Let's Encrypt certificates per domain (`le-ledger.json`). Never a run record.

## The seven steps

| Step | What runs | Done when |
|---|---|---|
| 1 the server | the password once → the node's key in root's `authorized_keys`, the server's key pinned (`installKey`) | connected by the key |
| 2 check | `probe.sh` as root: system, memory (8 GB and 4 cores recommended — the owner's minimum), disk, ports, other sites, a Fractera install with its commit and «behind N» against Fractera's main (`git fetch` + `rev-list` on the server) | the judge says no «fail»; the strategy: install · update · latest |
| 3 domain | the 737-19 ladder: the domain · where its DNS lives · who writes the records · the records (`@`, `*`, or each name) + a first check from public resolvers | chosen and checked once — the install never waits for DNS |
| 4 installation | `launch.sh` as root, detached: prepare · source (clone of the fork + a fresh `.env.local` + check-origin + fresh-project) · install (`install.sh`) · mark · start (`start.sh live`) · version; an older install: prepare · `npm run node:update` there · mark · start · version | `launch.json` → `done` |
| 5 records again | the server node's `dns-check` | every required name points to the server — the gate |
| 6 certificates | the server node's `certs` (one per name, a failing name never stops the others), refused past Let's Encrypt's week (50 per domain, 5 per name); then `check` — HTTPS from the internet; the checklist name · DNS · certificate · HTTPS | every required name certified and answering by HTTPS |
| 7 ready | the server node's `activate` (sign-in moves to `auth.<zone>`, nginx regenerated) and the sign-in check from the internet: `https://auth.<zone>/api/auth/providers` 200 and the architect pages redirect there | sign-in leads to `https://auth.<zone>` |

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
