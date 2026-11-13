---
name: dedicated-server
description: "Build process for the person, work process for you. The node moves from the person's computer to an Ubuntu VPS of their own and lives there around the clock — first by the server's IP, later on their domain with a certificate for every name. Load it when the person wants the node to work while the computer is off, asks about a VPS, a dedicated server, «переехать на сервер», a server's IP and password, the tab «Выделенный сервер», the records to write at a registrar for the server, certificates, «вернуть узел на компьютер», or when `npm run server` prints a marked line you must explain."
---

# The node on its dedicated server (step 737)

**The owner, 2026-11-13:** «нужно собрать инструмент который перенесёт полностью настроенный проект на VPS на Ubuntu … шаг за шагом
автоматически и по возможности без искусственного интеллекта … запускается там сначала по IP-адресу … получает сертификаты на каждый из
существующих поддоменов». Everything below is plain code; you call it and read its marked last line. No model does the move.

## Where it lives

- The tab «Выделенный сервер» of the core (`/architect/hosting/hosting`): on the person's computer — the move ladder; on the server — the
  domain's five steps; on the server's bare IP — the same five steps read-only (the records to write).
- One command: `npm run server -- <verb>` (`scripts/server.mjs`); every verb ends with `===SERVER_…===`.
- The runner `scripts/dedicated-server/move.mjs` (one rung per call, detached), its state `data/node/server/move.json`; the server's mark
  `data/node/server.json` (phase `silent` | `live`, ip, user), this computer's mark after the move `data/node/moved.json`.

## The move — seven rungs, each measured, each resumable

1. **connect** — the server's IP and root password, typed by the person **in the tab** (never in chat, never by you): the password is used
   once, the node puts its own key on the server and pins the server's key; from then on only the key.
2. **probe** — the server measured against this node's own needs (memory the node really holds, disk the copy really takes, ports 80/443,
   Ubuntu, systemd) → a verdict with numbers; a warning is not a refusal.
3. **prepare** — as root: swap, packages, Node 22, pm2, certbot, the user `fractera`, nginx, the firewall (22/80/443), the root helper
   with fixed verbs and one sudoers line.
4. **copy** — the silent copy (no bot tokens, no named tunnel) and the install and build there.
5. **claude** — Claude Code signed in on the server: its link shown in the tab, the code pasted in the tab.
6. **rehearse** — the server's node starts **silent** (every agent wake refused there, bots asleep) and is checked from outside and inside
   while this computer keeps working.
7. **move** — this computer's agents and node stop, the last changes are copied, the server starts whole and takes Telegram; a failed
   check brings this computer back by itself.

`npm run server -- status` — the rungs and where it stopped. A rung is started from the tab, or by you after the person's yes:
the door `POST /api/node/server {rung}`. Before the move rung, warn: the agents' conversations here end; on the server they start
fresh from their records, and this terminal stops with this computer's node.

## After the move

- This computer keeps a cold copy; `npm run serve:start` refuses while `moved.json` stands (`===SERVE_MOVED===`).
- `npm run server -- window` — the server's panel on this computer through SSH, with the owner's rights (before the domain, the only way
  to act on the server from a browser).
- `npm run server -- return` — the server's data comes home by the same rules and this computer starts again.

## The domain on the server — five steps

On the server, as the owner at its keyboard (you there, from Telegram), or in the tab through `window`:

| Step | Command | What decides it |
|---|---|---|
| 1 the domain | `npm run server -- domain example.org` | the server's mark keeps it; changeable until switched on |
| 2 records at the registrar | `npm run server -- dns --ip <IP>` to list, `dns-check` to check | public DNS (Cloudflare, then Google): every required name has an A record to the server's IP; an AAAA elsewhere is named «remove it» |
| 3 certificates | `npm run server -- certs` (minutes, detached), `domain` to follow | one Let's Encrypt certificate per name whose DNS is ok; a failing name never stops the others; an own certificate may be uploaded in the tab |
| 4 HTTPS from outside | `npm run server -- check` | every name answers by HTTPS with strict TLS, under 500 |
| 5 switch on | `npm run server -- activate` · back: `deactivate` | refused until step 4; nginx can refuse and the old site stays |

`npm run server -- domain` alone prints every name with its DNS, certificate and HTTPS state. The records the person writes: give them
the table from `dns --ip`, per domain (each domain at its own registrar), and the `*` shortcut as an option (the `@` line is still
needed). Never tell the person a name works before `check` said so.

## Laws

- The password goes from the person into the tab only; you never ask for it in chat and never type it (a credential in a field is the
  person's act).
- Never two live copies of one node: the server's bots run only after this computer stopped (the move rung does it).
- Root acts only through `/usr/local/sbin/fractera-root` (nginx-apply, cert-issue, cert-list, cert-delete, cert-upload, playwright-deps,
  pm2-startup, firewall-status) — no other root command from the node.
- Behind nginx nobody is «the owner at the keyboard» (the edge mark); the bare IP is read-only like a temporary address.
- A server to rent: skill `helpful-links` (partner links disclosed). A claim about Let's Encrypt, Ubuntu or a provider — from its primary
  source (`development-docs/development-steps/new-steps/737/737-research.md` while the step is open).

## Proven and not yet

Proven without a server: the names table, nginx generation, the edge law, the SSH road on a real in-process ssh2 server, the copy rules
with a real rsync, the runner end to end dry (`npm run test:hosting`, `npm run test:hosting-move`). Waiting for a real Ubuntu server:
prepare → move with real packages, Claude's sign-in there, certificates from Let's Encrypt. Say which side a question is on.
