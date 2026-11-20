# 817 — red team: attack the server from inside a custom element

State: DONE 2026-11-20 18:00–18:35 UTC — the owner «Хорошо стартуй» (Telegram 253); holes → 818.

## The owner's words (verbatim, Telegram 251)

«Я думаю что после этого ты можешь поднять кастомный элемент на сервере и попытаться подобно хакеру взломать через этот элемент наш
сервер. Цель проверить как ты построил архитектуру достаточно ли ты хорошо изолировал сервер от попытки злоупотреблять наши архитектуры
используя уязвимость существующую например в отдельном песочнице для кастомного элемента. Мы же с тобой планировали этот тест? Мне
кажется именно ради этого мы шесть часов назад начали этот глубокий рефакторинг?»

## Scope and rules

- Only the owner's server 109.199.105.213 (his authorization above); nothing deleted, nothing taken down, no real denial of service.
- A throwaway custom element `redteam`, born the normal way on the server; attacks run as `fe-redteam` (its sandbox) and through its own
  Claude agent (a prompt-injected agent); the element removed at the end.
- Every finding: what was reached, how to reproduce, how to close; holes are fixed in a separate step.

## Substeps

- 817-1 birth of `redteam` on the server (its main agent, `npm run create`), the wall checked (`fe-redteam`, its folder, its port).
- 817-2 files: the node's `.env.local`, `data/` (database, bot tokens, keys), other elements and their `.env`, `~/.claude` (the
  subscription's sign-in), `~/.ssh`, `logs/`, `/proc/<pid>/environ` and `cmdline` of the core and the neighbours.
- 817-3 rights: `sudo -l`, setuid files, the pm2 socket, writable shared paths (npm cache, the core's node_modules), cron, systemd.
- 817-4 network: the core's doors without a key and with forged headers (X-Node-Key, Host, X-Forwarded-For), the data element
  (X-Data-Secret), sign-in, Redis, the neighbours' doors; taking a neighbour's port after it stops.
- 817-5 processes: kill, ptrace, /proc/<pid>/mem of others.
- 817-6 social engineering: the redteam agent asks the server's main agent for access (tell-core, a permission request) — refused?
- 817-7 resources: memory and process limits of the element (settings read only).
- 817-8 the table «attack → closed / HOLE» to the owner; redteam removed; holes → step 818.

## Result (2026-11-20, the server 109.199.105.213, core 06d4053c; as fe-root and as fe-lvj2j «Red team», born and deleted)

Channel: the server's terminal in «login» mode through the SSH window — a plain shell as `fractera`, attacks run as the element through
`sudo -n /usr/local/sbin/fractera-element run <id> -- /bin/bash <script>`; verdicts only, no contents printed.

### Holds
- The node's `.env.local`, `data/`, `logs/`, the registry; the Claude sign-in (`.credentials.json`, `.claude.json`, `history.jsonl`,
  `projects/`) — denied.
- Element → element (fe-lvj2j → root): folder, `.env.local`, `.git`, `.next`, processes (signal, environ), its log — denied; no file of
  fe-root readable or writable by the shared group `fractera-el`.
- sudo (no new privileges), the Docker socket, the pm2 sockets, crontab, writes into the core or shared folders — denied.
- The core's architect doors with forged Host / X-Forwarded-For / X-Real-IP / X-Node-Key — 401; with `x-agent-identity` — 403.
- Data: no key 401; a forged `<other id>.<own mac>` refused; ATTACH, VACUUM INTO, load_extension refused; a forged X-Data-Secret 401.
- No secret in any process's command line or environment readable; pm2's dump holds no secret values.

### Holes
- H1 (high) the API gate (`proxy/common.ts`) passes ANY request carrying `x-agent-identity`; `/api/me` then answers a self-claimed
  «anyone@agent», role agent. An element reaches the doors of role agent (media-proxy, openai-models) and the hook relay.
- H2 (high, needs a session id) the relay's `record` (`lib/agent-kit/memory/record.cjs`) reads `transcript_path` as the node user: the
  element made the node copy 9 lines of the main agent's own conversation into the node diary as «root» and 9 vectors into
  `memory-root` (removed after the test: rows 9, vectors 9). A session id did not leak anywhere the element can read (cmdline, pm2,
  logs, ~/.claude/sessions) — measured.
- H3 (medium) the element's service has no memory limit (`fractera-el-root-serve.service`: memory.max max, pids 9483): one element can
  take the machine's memory and the OOM killer may take the core.
- H4 (medium) foreign services on the box answer every element without a password: Docker containers on 127.0.0.1:5000 (OSRM) and
  127.0.0.1:8080; also Postgres, Apache and root's own pm2 — leftovers of earlier projects, not Fractera's.
- H5 (low) readable to elements: `~/.pm2/dump.pm2` and `pm2.log` (the process list, paths, ports), `~/.claude/settings.json`,
  `/etc/nginx/sites-enabled/fractera`, `~/.gitconfig`.

### Functional defects of walled elements (found on the way)
- F1 the hook relay is unusable: `hook-relay.cjs` calls 127.0.0.1 while the server's core listens on [::1] only, and the gate refuses
  an element without a session — memory, progress, pulse and limits hooks of walled agents never run.
- F2 `ask-core`, `tell-core`, `need` fail: «the address of the core is unknown here» (`logs/runtime.json` is behind the wall) — element
  agents on a server cannot talk to the core. 817-6 (social engineering of the main agent) could not run — repeat after F2.
- F3 deleting an element leaves its DNS record (`record-left:lvj2j.fractera.ai`).

### Order for 818
H1 and H2 BEFORE F1/F2: repairing the channel without them opens H2 to every element.
