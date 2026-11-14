# 744 — the before-numbers (measured 2026-11-14 15:00–16:20 UTC; scratch, read-only reads of the test server, nothing changed there)

## Probe 1 — `expiry-time.sh`: the server itself must hold the 24 hours (a throwaway sshd on this Mac, OpenSSH_8.6p1, no root)
```
A future expiry: accepted   (expiry-time="202611141512")      ← local system time, one minute ahead
B past expiry  : refused    (expiry-time="202611141510")      ← the same key, one minute behind — the negative control
C no expiry    : accepted   (none)                            ← today's persistent node key: forever
D future, Z    : refused    (expiry-time="202611141512Z")     ← 8.6 knows no «Z»: a bad option drops the whole line
```
The test server runs OpenSSH_9.6p1, whose `sshd(8)` says: «YYYYMMDD[Z] date or a YYYYMMDDHHMM[SS][Z] time … interpreted in the system time
zone unless suffixed by a Z». Server clock CET, this Mac WET (one hour apart). ⇒ The deadline is computed BY THE SERVER'S OWN `date`
(`date -d '+24 hours' +%Y%m%d%H%M`, its zone, no Z) — right on every OpenSSH ≥ 8.2 and every zone; a wrong format fails closed (refused).

## Probe 2 — `csrf.sh`: a foreign web page can make this node act on a server as root
```
same   → 200 {"ok":true,"state":{"probe":{"os":{"id":"ubuntu"…      ← the page itself
cross  → 200 {"ok":true,"state":{"probe":{"os":{"id":"ubuntu"…      ← Origin https://evil.example, Sec-Fetch-Site cross-site, text/plain
```
A «simple» cross-site POST needs no preflight; the door ran SSH as root on 213.199.61.7 with the node's key. A foreign page cannot READ the
answer, but every action with a side effect (install, clear, cloudflare-write, upload, activate) would run. `proxy.ts` has no Origin or
Sec-Fetch-Site check; a second door (`/api/node/update`) answered the same cross-site request too (400 for an unknown action — the request
reached its logic). 74 doors of the core take POST. Through the tunnel the launch door refuses (403 `temporary-address`).

## Probe 3 — `server-relation.sh`: what the test server's node is
```
this computer's fork: https://github.com/aifa-agi/web4-node-starter-kit.git
server node origin:   https://github.com/aifa-agi/web4-node-starter-kit.git        ← same fork
vs its fork:          ahead/behind 351  0
vs the original:      ahead/behind 351  6
mark: {'from': 'MacBook-Pro-de-Roman.local', 'movedAt': '2026-11-13T22:45:16Z', 'domain': 'aifa.dev', 'domainWay': 'migrate', 'phase': 'live'}
authorized_keys: 8 lines; ours: 1 (fractera-node, no expiry)   +7 «fractera-project-agent» (old, foreign)
permitrootlogin yes · passwordauthentication yes (sshd -T) · OpenSSH_9.6p1 · clock CET
```
The node there is the 737 MOVE of this Mac's node (`from`, `movedAt`): 351 commits of this computer's own history (its session letters)
sit on that server. `probe.sh` counts «behind» against the ORIGINAL (`github.com/Fractera/...`), the update merges the FORK: the page said
«Отстаёт на 25», the update said «23 изменений форка».

## Other facts the plan rests on (read, 2026-11-14)
- `launch.mjs`: 11 actions open SSH by the persistent key `data/node/server/id_ed25519` (0600); users of `lib/hosting/ssh.mjs`:
  `launch.mjs`, `lib/hosting/remote.mjs`, `lib/hosting/window.mjs` (the 741-5 SSH window, `scripts/server.mjs`), `scripts/hosting-test-ssh.mjs`.
  `readableKeyPair()` already makes an ed25519 pair in memory (with the guard against ssh2's 1-in-235 unreadable key).
- `app/[lang]/layout.tsx:139-145` loads Google Tag Manager on EVERY core page (the panel included) when `cfg.analytics.enabled`: a
  third-party script on the panel's origin reads all of `localStorage` ⇒ the visit key is an HttpOnly cookie, never `localStorage`.
- The ladder: `server-launch.client.tsx` opens «install» right after «check» (738: «The domain holds nothing»); step 3 reads only
  `/root/.fractera/domain.json` (never existed on the test server) while the mark holds aifa.dev / `migrate` = the 737-19 option «Только у
  регистратора»; the part `ladder-step` draws every rung open at once.
- The domain question today is ONE question with four options («Где вы можете менять DNS-записи этого домена?» — Cloudflare / только у
  регистратора / у регистратора или хостинга / нет доступа), not the owner's order «registrar? → if not, Cloudflare?».
- «The computer marks a server launched» (`markLaunched`, 741-6) happens at `activate` and `signin` — inside the last rung, which opens
  after the certificates; the words «Ваш сервер готов» belong to that rung. No rule or test holds this order today.
- `proxy.ts` is one file of 637 lines; the place-dependent behaviour lives partly there (`isTemporaryPublicAddress` ×4) and partly in
  `lib/auth/*` (741-3's second wall). Next.js takes ONE proxy entry file.
- The launch test `scripts/hosting-launch.test.mjs` already runs `launch.mjs` against TWO local test SSH servers with a password
  (`scripts/hosting-test-ssh.mjs`, ssh2 — it does not interpret `authorized_keys` options, so `expiry-time` is proven by probe 1 and live).
- `npm run eyes` cannot type: by design it cannot pass step 1 once a password is required; live rung screenshots come from the owner's
  Chrome (he types the password), saved into `logs/eyes/`.
