# 663 — the node's load: who may sleep, who wakes them, one watcher, and when to ask for a stronger machine (plan)

## 1. The owner, 2026-11-06 (verbatim, abridged by «…»)
«сделай лейбл в качестве отдельного раздела является ли этот элемент по умолчанию включён, или выключен а также есть у него возможность
динамического включения выключения в зависимости от нагрузки. Например данные и авторизацию категорически запрещено включать и отключать. А
вот например тяжелый embending имеет смысл выключать при недостатке памяти … каждый элемент должен иметь в своем own service props json эти
характеристики в том числе и кастомные элементы могли бы отключаться если памяти мало и при обращении к ним активироваться … если например
кастомные элементы имеют Krohn события, то при их отключений крон событий не сработает это означает что главный агент должен … пробудить
нужный элемент чтобы в нём отработало Krohn события и сделать это например за 2 минуты … взвешивать насколько ценным этот элемент остается в
статическом режиме, насколько важно поддерживать его рабочие автоматизации? И в эпоху Web4 … не случится ли так что мы отключим этого агента а
он не сможет принять заявку а2а … именно он должен сказать что мы подходим к пределу в котором нужно поднимать вычислительные мощности
сервера … особенно тревожно сообщать если мы подошли к чёрте вплотную или даже пересекли её». The thresholds: «if free memory is more then
1gb - с сообщением ваm if less 0.5 gb = auto» — read as: free above 1 GB — nothing; 1–0.5 GB — the agent proposes and waits for the yes;
below 0.5 GB — an `auto` element is turned off by itself, with a message. «go to 663 after check» (2026-11-06).

**The owner's choices in the window, 2026-11-06, verbatim:** waking on a call — «Привратник (Рекомендую)»; the classes — «Да, так
(Рекомендую)» (never: auth, data, root, storage; manual: stripe; auto + wake on call: embeddings, graph, memory, vectors, cache, config,
design, blocks, every custom element); the watchers — «Включить в 663 (Рекомендую)» (one shared health watcher instead of one per element).

## 2. Measured (2026-11-06, the owner's Mac 16 GB, `ядро 35c3f965`)
- Available 5485 MB (`lib/free-memory.cjs`, macOS free + inactive + speculative). The node: **2054 MB in 28 processes** (`pm2 jlist`):
  the core 164, 13 elements 72–121 MB each, **13 health watchers ~51 MB each (~660 MB, a third of the node)**, the tunnel 51.
  An element asleep frees its server and its watcher: 120–170 MB.
- The switch exists: `lib/web4-items/element-power.cjs` (567) — `off: { reason, at }` in the registry, the process and its watcher not
  started (`ecosystem.config.cjs` asks `isOff`); `seedPower` reads only `power.default: off` (Stripe); `powerAuto` marks what a rule turned
  on. `scripts/memory-by-free.mjs` (601) — only the memory, only at the core's start and after a build, 2-minute dedupe.
- **An element's clock ticks inside its own server** (`lib/cron/`, once a minute over `data/cron.json`) — asleep, its calendar never
  fires. The core has its own minute clock (`lib/main-agent-cron/runner.ts`, started in `instrumentation.ts`) — waking 2 minutes ahead can
  ride on it, no new timer.
- **Neighbours and A2A call an element straight on its port** (`127.0.0.1:<port>/api/<door>`, `X-Node-Key`) — asleep, «connection
  refused», nobody wakes it.
- `scripts/health-watch.mjs` (232-3) — one process per element, HTTP checks with patience (several failures before a restart).

## 3. Known limits
- A resident process is named with its price (CLAUDE.md §6): the gatekeeper ~50 MB, the shared watcher ~50 MB; together they replace
  13 watchers (~660 MB).
- No polling timer for the rule (§6 «behaviour nobody ordered»): it runs on events — the core's start, after a build, before an agent
  session, on a calendar wake. A load spike between events is not seen — said aloud in the alarm's words.
- `CLAUDE.md` §1–8 change only by the owner's word (sealed); §3 «Stores are on by default, except Redis» contradicts 619 — fixed in 663-5
  with his word.
- Ports are asked from `logs/runtime.json` / the registry, never remembered (§2).

## 4. Substeps
| # | Substep | Plan file |
|---|---|---|
| 1 | the passport field `power` in 15 repositories, the guard, the landing label reads it | `663-1.md` |
| 2 | `npm run load` — weights and the cost of sleep | `663-2.md` |
| 3 | the rule by the thresholds, the proposal, the alarm | `663-3.md` |
| 4 | waking: the calendar 2 minutes ahead and the gatekeeper on a call | `663-4.md` |
| 5 | the words: skill `element-power`, `CLAUDE.md` lines (the owner's word) | `663-5.md` |
| 6 | one shared health watcher instead of 13 | `663-6.md` |

Order: 6 → 1 → 2 → 3 → 4 → 5 (the watcher first: the gatekeeper and the rule must know which processes exist). Repositories: the core
(`Fractera/web4-node-starter-kit`, main) for 2–6; the 15 element repositories for 1; one delivery — one «Sync fork».

## 5. How it is proven (named in advance)
Lab with `--free` substitutes on a copy of the node's registry: 1500 MB → nothing; 800 MB → a proposal, nothing turned off (negative
control); 400 MB → `auto` elements off, heaviest with least loss first, `never` untouched; a lab element asleep with a calendar entry →
woken 2 minutes ahead, the entry ran, asleep again; a call to a sleeping element through the gatekeeper → 200 after the cold start (seconds
measured), a call to a `never` element never goes through it. On the owner's node: `npm run load` read aloud; `pm2 jlist` before/after the
shared watcher (expected about −600 MB); the power label on every landing from the passport.

## 6. Not in it
Moving the node to another machine (only the consultation and the alarm); Lagrix's real A2A traffic (simulated today — the gatekeeper serves
whatever reaches the port); turning off the core or the tunnel.
