# 737 — research notes (measured 2026-11-13; do not measure again unless the source changed)

## A. The old five-step domain wizard (core history)

- Lives: core commit `999b2f9d` (2026-08-07), removed by `654d8f4c` (2026-08-10, «старая панель снята»). Earlier: born `17ea5b05`
  (2026-05-29); certbot lock wait `b5641206` (2026-08-02, branch `origin/new-step-330`, not on main).
- Read any file: `git show 999b2f9d:bridges/app/_components/coding-workspace/domain-wizard.client.tsx`.
- Steps: 1 «DNS A-records» (a table Type/Name/Value with a note per name; «I added the records — check DNS»; «Missing or wrong» chips;
  «Change domain» before activation) · 2 «SSL certificate» (auto Let's Encrypt, checkbox on by default; or upload PEM chain + key —
  RU МинЦифры RSA yes, GOST no; per-host «in cert / missing»; issue button locked with a countdown; the last error with its cause; a trust
  note «why we do not ask your server password») · 3 «End-to-end HTTPS check» (per name: DNS, strict certificate, HTTPS status < 500;
  optional names amber) · 4 «Activate Secure mode» (env flip in every service, nginx with TLS, firewall 22/80/443, pm2 reload, redirect
  after 10 s, rollback watcher at 30 s) · 5 «You're on your domain» (source and expiry; «back to IP» = deactivate).
- `wizard-state` computes every step from the world each time (resolve4, the certificate file's SANs, the env files) — nothing stored but
  the domain and the certificate source.
- Lessons paid: one shared list of names (197.1 — the wizard wanted 9 names, certbot issued 7, activation deadlocked); certbot holds one
  global lock — a busy lock is a wait (retry ~15 min), not a failure; `/etc/letsencrypt` survives wipes and accumulates stale renewals
  (168 on the test IP); `hostname -I` is the server's first address — the address the person typed is the truth; firewall: 22 first, then
  80/443, then deny; `client_max_body_size 200m`; Hermes needed Host/Origin rewrites (gone with Hermes).

## B. The installer of Fractera easy starter (github.com/Fractera/fractera-easy-starter, cloned 2026-11-13, depth 1)

- `lib/deploy.ts`: `ssh2` `Client` → password auth as root (`readyTimeout` 20 s) → sftp `/tmp/fractera-bootstrap.sh` → `setsid bash script
  args > /tmp/fractera-install.log 2>&1 < /dev/null &`; a per-IP deploy lock (20 min); `testSSHConnection` (15 s).
- `lib/bootstrap.sh` (1434 lines): `step`/`soft_step` run each body in a subshell (`( eval … )`) and report start/finish; apt lock
  timeout 600 s and `wait_for_apt`; hardware probe first (cores, RAM, disk, OS → warning under 4 cores / 6 GB, never a refusal); swap 2 GB
  when RAM < 2 GB and no swap (+fstab, swappiness 10), `NODE_OPTIONS=--max-old-space-size=768` then; apt `git curl nginx build-essential
  dnsutils … certbot python3-certbot-nginx ffmpeg`; NodeSource 22; `npm i -g pm2`; resolver pinned to 1.1.1.1/8.8.8.8 (Contabo's resolver
  returned NXDOMAIN for fresh records and broke certbot); ufw reset+disable for IP mode (a re-bootstrap inherited the lockdown);
  public IP by ipify → ifconfig.me → `hostname -I`; `git config --global http.version HTTP/1.1` (measured: «expected flush after ref
  listing» over HTTP/2 on one provider); clone with 3 retries (`</dev/null`); nginx `default_server` on :80 → :3000; health loop 30×2 s.

## C. Primary sources

- Let's Encrypt rate limits (letsencrypt.org/docs/rate-limits, updated 2026-08-05): 50 certificates per registered domain (or IPv4, or
  IPv6 /64) per 7 days; 300 new orders per account per 3 h; 5 per exact identifier set per 7 days; 5 authorization failures per
  identifier per account per hour; renewals (ARI, or the same identifier set) exempt from the per-domain limit.
- Let's Encrypt profiles (letsencrypt.org/docs/profiles, updated 2026-10-04): `classic` 90 days, ≤100 names, DNS; `tlsserver` 45 days, ≤25
  names; `shortlived` 160 hours, ≤25 names, **DNS and IP identifiers**; revocation information: CRL in all (OCSP is gone — no stapling).
- Let's Encrypt ended expiry e-mails on 2025-06-04 (letsencrypt.org/2025/01/22/ending-expiration-emails).
- certbot CHANGELOG (raw.githubusercontent.com/certbot/certbot/main/certbot/CHANGELOG.md): latest 5.10.0 (2026-11-10); `--ip-address`
  since 5.3.0 (standalone/manual), webroot IP issuance since 5.4.0, IP needs `--preferred-profile shortlived`; `--preferred-profile`
  and `--required-profile` exist.
- Claude Code authentication (code.claude.com/docs/en/authentication): macOS keeps the login in the Keychain (not copyable); Linux in
  `~/.claude/.credentials.json` (0600) or under `CLAUDE_CONFIG_DIR`; `claude setup-token` makes a one-year token printed to the terminal
  (`CLAUDE_CODE_OAUTH_TOKEN`; model requests only; no Remote Control). The node's own login (`claude auth login` in a short terminal, the
  link shown on the page, the code pasted back) was measured on a server on 2026-09-04 (`terminal-auth.mjs`).
- Claude Code permission modes (code.claude.com/docs/en/permission-modes): «On Linux and macOS, Claude Code refuses to start in
  bypassPermissions mode when running as root or under sudo»; auto mode depends on the account and settings (the node runs agents with
  `--permission-mode auto`).

## D. This node (2026-11-13)

- 17 pm2 processes ≈ 2.3 GB: `fractera-web4` 300 MB, `-watch` 51, `-domain` 20, `fractera-gatekeeper` 15, `fractera-elements-watch` 43,
  `fractera-web4-tunnel` 63, auth 134, data 133, storage 133, vectors 131, embeddings 471, config 158, graph 130, memory 134, root 131,
  s8y6x 135, bd5ln 140 (cache and stripe off).
- Elements: auth 24681, data 24682, bd5ln 24684 (no address), config 24685, graph 24689, memory 24690, stripe 24691, storage 24693,
  vectors 24694, cache 24695, embeddings 24696, s8y6x 24697 (no address), root 24683. Core 24680.
- No own domain; temporary address `*.trycloudflare.com` (the core only). `data/services/s3v6y/` outlived its deleted element (a leftover,
  not moved by the tool: only the registry's elements are).
- The Mac: 16 GB RAM, 8 cores, macOS 12 (Darwin 21.6); docker CLI + colima 0.9.1 installed, no colima instance.
- The open skills store (`npm run skills -- market --live`) had nothing for this task (azure-deploy, vscode-sftp-config, llm-gateway);
  a defect seen on the way: a quoted query is refused as «needs English words», and the first word of an unquoted one is dropped.
