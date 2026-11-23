---
name: server-wall
description: "Work skill for the main agent. The wall between elements on a dedicated server (step 811) — each custom element runs as its own Linux user fe-<id>, and what crosses the wall and how. Load it before changing anything an element on a server calls or runs (its doors to the core, its agent pages, terminal, login, Claude account, files, processes, the proxy gate, next.config redirects), before asking the owner for a server update that touches such code, and when an element on a server shows an empty page, an empty 404 or 500, Permission denied, «not-on-a-node» or an agent that will not start."
---

# The wall of a dedicated server — how it works and how to cross it

The owner, 2026-11-22 (Telegram 849): «Ты построил стену для того чтобы защитить проекта в итоге сам ей пользоваться не умеешь? … запусти
отдельные исследования … добавь навык … В случае появления проблем связанных с этой стеной обновляет этот навык». Sources: step 811
(`development-docs/development-steps/new-steps/811-a-wall-per-element-on-a-server.md`), 812, 818, 833–837. **A home computer has no wall:
one person, one user — and the «owner at the machine» rule there lets through what a server refuses. A change proven only on the Mac is
not proven for a server.**

## 1. Who runs as whom

| What | User | How it starts |
|---|---|---|
| the core, native elements | the node's user (`fractera`) | pm2 |
| every custom element, root included | `fe-<id>` (no login, no sudo, group `fractera-el`, home `/var/lib/fractera-el/<id>`) | the helper `/usr/local/sbin/fractera-element` (`unit-start`, the element shim under pm2) |
| an element's agent (`claude`) | `fe-<id>` | helper `agent <id> --unit agent -- <claude …>`: `systemd-run --pty`, `ProtectProc=invisible`, UMask 0007 (`lib/agent-kit/walled-session.cjs` walledLaunch) |
| an element's login shell | `fe-<id>` | helper `agent <id> --unit shell [CLAUDE_CONFIG_DIR=…] -- /bin/bash -l` (walledShell) |
| a short command as the element | `fe-<id>` | helper `run <id> [KEY=VALUE …] -- <program>`: its folder, `env -i`, umask 007, waits |

`lib/hosting/element-wall.cjs`: `wallOn(root)` (a server with the helper), `walled(entry)`, `userExists(id)`, `asElement`, `unitOf`,
`walledEntryAt(root, cwd)`; the helper's verbs — `scripts/dedicated-server/fractera-element.sh` (add, remove, run, unit-start, agent,
unit-stop, signal, stop, claude-share, walls, list). Environment keys refused by the helper: LD_*, BASH_ENV, ENV, PATH, HOME, USER,
LOGNAME, SHELL, NODE_OPTIONS.

## 2. What is open to whom

- The element's folder `WEB4-ITEMS/user/<id>` and its data `data/services/<id>`: owner the node's user, mode 2770, ACL `u:fe-<id>:rwX`,
  `g:fractera:rwX`, other `---`, the same as DEFAULTS for every new file. So the core may create inside (a new folder inherits the
  ACL), and `fe-<id>` may write there.
- The node's folder 0711, the core's files without «other» rights, `.env*` 0600. An element user reads only `element-readable.txt`:
  `lib/agent-kit/hook-relay.cjs` and the node window `data/node-window/logs/{domain.json,runtime.json}` (818-8, written by the core at
  every start — `lib/hosting/node-window.cjs`; a walled element's `NODE_DOMAIN_FILE` points there, so its `coreUrlOf()` works).
- A file an element user writes with its own mode (Claude writes its credentials 0600) masks the ACL: the core may see that it EXISTS
  (the folder's x), not read it. Read such state by existence (`lib/agent-kit/claude-account.cjs` ownSignedIn) or as the element (`run`).

## 3. How an element reaches the core (and what refuses it)

- Always on loopback, `http://localhost:24680` from the node window — the core listens on `[::1]` only, the elements on 127.0.0.1;
  `127.0.0.1:24680` answers nobody. With its OWN key `X-Node-Key: <its SETTINGS_SECRET>`; `server.js` stamps the connection of an element
  user (`x-fractera-peer`, 811-5g); the door names the caller by the key (`lib/node/caller.ts`) and lets it only its own affairs.
- The core's proxy (`proxy/server.ts` → `proxy/common.ts`) on a server:
  - `/api/*` → `apiAuthGate`: a door in `ELEMENT_DOORS` (`lib/node/element-doors.mjs`) passes with a key and not `fromInternet`
    (818-7a); any other `/api` door wants a session — an element has none.
  - every `/<lang>/…` is an architect page → `architectPagesGate`: owner at the machine (never on a server), showcase, a host with
    sign-in, the kit doors (`isKitDoor`, 837-0c), else an EMPTY 404.
  - `fromInternet` = `cf-*` or `x-fractera-edge` (nginx sets it on every proxied request) — no key is honoured from there.
- **next.config runs BEFORE the proxy**: `/:lang/architect/:path*` → `/:lang/:path*` (307). The gate sees the redirected address, and
  Node's fetch cannot follow a 307 with a body (POST → «detached ArrayBuffer», the caller throws, an empty 500). So an element's keyed
  call is neither redirected nor rewritten (`missing: x-node-key` on BOTH the redirect and the `afterFiles` rewrite, 837-0e — the
  rewrite runs before dynamic routes and would double «architect») and lands on the route file itself.
- The element's agent pages (836, template `app/api/agent-kit/[...path]/route.ts`) forward four kit doors — `ticket`, `session`,
  `channel`, `claude-auth` — to `<core>/en/architect/<id>/agent-api/<door>`, and its terminal's voice to `/api/transcribe?item=<id>`.
  The terminal itself: the browser opens `wss://architect.<zone>/pty/<id>` with the ticket — no origin rule, the ticket decides.

## 4. An element's Claude on a server

- Its own account ONLY (811-5b; an app of its own on any node, 834-10): never the node's login, never a choice between them. Its folder
  `data/services/<id>/claude` (= `CLAUDE_CONFIG_DIR`) is created by the core when missing (the ACL makes it the element's); the page
  shows one button, «Войти по подписке Claude» (837-0e). `claude-auth` answers `canOwn: false` for such an element — the choice island
  (`claude-own-login.client.tsx`, core and template) draws nothing then.
- Login: the bridge types `claude auth login` into the walled `bash -l`; the link window comes from `terminal-auth.mjs` (837-0).
- Signed in = its `.credentials.json` exists or `.claude.json` has `oauthAccount` (`claude-account.cjs` ownSignedIn / accountOf) —
  never a `claude auth status` run as the node's user against the element's files.
- The agent starts only with its folder; before sign-in Claude shows its own login inside the terminal.

## 5. Traps already paid for (newest first; add every new one here with its date and fix)

- 2026-11-22 839-12: past the first-run marks a walled element's session stood on Claude Code's trust question for its data folder («Adding
  a new directory … Your answer holds for this session») — its own Claude home never trusted the node's repository, so the `--add-dir`
  of `data/services/<id>` asks on EVERY session, and the node's trust watcher answers once per session and only on a Telegram-confirmed
  wake. Fix: before every session the bridge marks the element's own home as itself (`telegram.markOwnHome`) — onboarding, theme,
  `projects[<its folder>]` and `projects[<its data folder>]` `hasTrustDialogAccepted` (measured on Claude Code 2.1.330 with a scratch
  home: the record removes the question, without it the question) — never the repository root. Rule: what Claude Code asks before its MCP
  servers start is settled in the element's own home before the session, or a Telegram wake never gets its channel.
- 2026-11-23 839-13: 839-12 itself broke the element — `walledAt` answers `{ id, dir, wall }` or null, never `true`; compared with
  `=== true` the node always took the element as unwalled, marked its 0600 `.claude.json` AS ITSELF, read EACCES as «empty» and wrote its own
  file over it; the element could not read it and started fresh on the theme screen (found by the server's main agent, Telegram 1073).
  The test's stub answered `true`. Fix: truthiness; the node's user never replaces a file it cannot read; stubs keep the real shape (a
  negative proves the old check fails the test). Rule: a stub of a wall function returns what the real one returns.
- 2026-11-22 839-10/11: a walled element's channel never came up — no MCP log after 18:11, `.claude.json` without onboarding and trusted
  folders: the NODE had run `claude plugin install` with the element's CLAUDE_CONFIG_DIR, could not read its 0600 `.claude.json` and wrote a
  fresh one over it; every session then stood on Claude Code's first-run screen before its MCP servers. Fix: behind the wall every `claude`
  and `bun` call into the element's Claude home runs AS the element (`asWalled` → helper `run`), the first-run marks (onboarding, theme —
  never a consent) are set in its own file as itself before the channel, and a failed channel logs the last line of the screen. Rule: the
  node never runs a program against an element's Claude home as itself — not even «just to install».
- 2026-11-22 839-6…8: a walled element's bot said «not signed in» (`claude auth status` as the node cannot read fe-<id>'s 0600 files → read
  by existence); its own gates in settings.local.json were core scripts (→ the relay; boundary closes on silence); its channel never came up —
  the plugin `chmod 0600`s `.env` first and swallows EPERM on a file it does not own (→ `.env` handed to the element as itself, the node keeps
  `.token.node`). Rule: anything a walled session's own program writes or chmods must be the element's file, not a node file opened by ACL.
- 2026-11-22 17:20: I declared «uuy30 born without a wall» from an empty `getent passwd fe-uuy30` — the element had been deleted at
  17:06 UTC, and `remove` takes the user and the record away. Before reading the wall, prove the element is alive (registry, its port).
- 2026-11-22 837-0f: after the 837-0e update a NEW element (uuy30) still got «Подписка узла» — `claude-account.cjs` loaded the wall by
  `require(path.join(root, …))`; the core's Next bundle compiles that into «Cannot find module 'unknown'», the `catch` answered «not
  walled». Unit tests passed (unbundled). Fix: static requires; guard `check:bundle-requires` between the build and the restart.
- 2026-11-22 837-0e: every POST of an element's page (switch, ticket, session) → empty 500 — the 307 of next.config, Node fetch cannot
  resend the body; the own-only element was offered «Подписка узла» and its own folder did not exist → no «Войти», no terminal.
- 2026-11-22 837-0d: the gate rule matched `/en/architect/<id>/…`, the gate sees `/en/<id>/…` (curl showed the 307) — one wasted update.
- 2026-11-22 837-0c: an element's kit doors got an empty 404 from the page gate on a server; on the Mac «owner at the machine» hid it.
- 2026-11-22 837-0b: the core and natives typed into the node user's zsh (no rc → Debian's newuser menu); walled shells were bash -l —
  one shell rule now (`claude-cli.cjs` shellCandidates/loginShellArgs).
- 2026-11-20 811-6: the node touching what now belongs to the element — `cpSync` into its standalone folder (EPERM), git «dubious
  ownership» (safe.directory per call), a closed path above its folder (open_way). Inside a walled element, act AS the element (`run`).

## 6. Before asking the owner for a server update that touches the wall

1. Name every caller and the exact address and method it uses (GET and POST separately).
2. `curl -s -o /dev/null -D - https://architect.<zone>/<that path>` on the live server — follow every redirect to the final location;
   the proxy rule must match THAT.
3. A POST across the wall: reproduce the call with Node's fetch locally (a body over a redirect throws). A routing rule (redirects,
   rewrites, `has`/`missing`) — prove it on a scratch Next app in the scratchpad: the core's `node_modules` linked, `next build --webpack`
   with `env -u TURBOPACK` (Turbopack refuses a link out of the project), `next start` on a scratch port, the exact calls. EVERY command
   of it inside `cd <scratch> && [ "$(pwd -P)" != <the core> ] && …` — ✗ 2026-11-22 a failed `cd …;` ran `printf > package.json` and
   `next build` in the core: package.json and tsconfig.json overwritten, the core's `.next` wiped (repaired by git and a core build).
4. Through the Claude in Chrome extension, on the element's own pages: the door's status for each action (`fetch('/api/agent-kit/…')`),
   not only the screen.
5. Rights: anything the core writes inside an element's folder — will `fe-<id>` read it, and will the core read what `fe-<id>` writes?
6. Tests: `scripts/node-key-split.test.mjs` (gate rules, the redirect), `scripts/element-wall.test.mjs` (helper, dry:
   `FRACTERA_ELEMENT_DRY=1`), `scripts/terminal-auth.test.mjs` (shells, the login link) — each new trap gets its negative here.
7. A rule the core's routes run — read it in the BUILT code (`.next/server`), never only in `lib/`: `npm run check:bundle-requires`.
8. Look from inside before and after (the owner, 2026-11-22, Telegram 875: «спросить … изнутри»): the server's main agent sees what this
   computer cannot — `getent passwd fe-<id>`, `/etc/fractera/elements`, the built chunk, the door's answer on loopback.
9. On the server itself only through the owner's hands or the server's agent (read-only): `sudo -n /usr/local/sbin/fractera-element run
   <id> -- <cmd>` proves what the element can see.
