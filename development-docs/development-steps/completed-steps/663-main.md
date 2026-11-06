# 663 — the node's load: who may sleep, who wakes them, one watcher, the installer weighs the computer (closed)

**The owner, 2026-11-06 (verbatim in the plan, recoverable from git):** the power label and dynamic switching («данные и авторизацию
категорически запрещено включать и отключать … тяжелый embending имеет смысл выключать … при обращении к ним активироваться … пробудить
нужный элемент чтобы в нём отработало Krohn события … за 2 минуты … подходим к пределу»), the thresholds «if free memory is more then 1gb -
с сообщением ваm if less 0.5 gb = auto», the installer check («4 ГБ … лучше даже не начинать … шесть или 8 ГБ нужно предупредить … 16 ГБ …
меньше 3 ГБ … порекомендовать»). His choices: «Привратник (Рекомендую)», «Да, так (Рекомендую)», «Включить в 663 (Рекомендую)».

| Substep | What | Where |
|---|---|---|
| 663-1 | passport `power { default, switch: never/manual/auto, wakeOnCall }` in all 15; the core checks and sees it (`element-props` passed it only for `default: off` — fixed); landing labels by class | 15 repos (auth `54935c7` v2.4.21 … vectors `025147d` v1.2.17); core `f27841bf` |
| 663-2 | `npm run load` — free memory, weights, class, the cost of sleep (calendar, Web4, address, callers) | core `scripts/load.mjs`, `lib/web4-items/element-calendar.cjs` |
| 663-3 | the load rule by the owner's thresholds; proposal / auto-sleep / alarm through the core's notice door (kind `load`); at the core's start and before every agent session; replaces rule 601 | core `scripts/load-rule.mjs`, `instrumentation.ts`, `lib/agent-kit/modes.cjs` |
| 663-4 | the calendar wake 2 minutes ahead in the core's minute tick; the gatekeeper that wakes an asleep element on its first call; the installer starts it | core `lib/web4-items/calendar-wake.cjs`, `scripts/gatekeeper.mjs`, `c16a7a7a` |
| 663-5 | skill `element-power` rewritten | core `.claude/skills/element-power/SKILL.md` |
| 663-6 | one shared health watcher instead of one per element | core `scripts/health-watch.mjs` (`*`), `ecosystem.config.cjs`, `lib/web4-items/elements-watch.cjs` |
| 663-7 | the installer weighs the computer: < 5 GB refuse, 5–12 GB one question, ≥ 12 GB warn below 3 GB free; the install block of `CLAUDE.md` resealed by the owner's word | core `scripts/check-memory.mjs`, `scripts/launch.mjs`, `8bcddf4f` |

Core commits: `9eb880a8` + `8bcddf4f` (663-6, 663-7), `908db625` + `f27841bf` (663-1…5), `c938f5ee` (pins), `c16a7a7a` (gatekeeper by the
installer); CI ubuntu and windows green on every element repo and on the core's last commit.

**Proven.**
1. *Labs:* the watcher — sick element restarted after 3 failures, a stopped one untouched; the installer check — 4096 refuse, 8192 ask,
   8192 + `--memory-ok` continue, 16384/2500 warn, 16384/6000 silent; the passport guard — a wrong `switch` refused (8 problems vs 7);
   the rule — 1500 nothing, 800 a proposal and nothing off, 400 two `auto` asleep and `never` untouched, 1700 both back, 100 «перешёл
   черту», 700 with nothing sleepable «подходит к пределу»; the calendar wake — only the rule-asleep element 1.5 min ahead, no repeat, the
   rule 6 min after; the gatekeeper — an asleep element answered 200 in 1.2 s, a `never` port not held, without it refused.
2. *The owner's node:* the 663 elements installed (`===SERVICES_INSTALL_OK===`), the 12 per-element watchers replaced by one
   (28 → 17 processes; before: 1661 MB, the watchers 603 MB), all 12 elements 200.
**Not proven on a live node:** the new core build (the rule at the core's start, the calendar wake, the gatekeeper started by the
installer) — the owner's test node could not rebuild its core because of a leftover of my install collision (see 662), and the owner is
retiring that machine; the core builds clean in CI.

**Mistakes.** The collided installs of 662-6 left the real element folders aside; the next core build of this node refused. Two commits
went out incomplete (`9eb880a8`, `908db625`) — completed by the next ones; main is whole. A lab replica started its shared watcher in the
owner's pm2 twice — removed by name. Above all: I asked the owner to choose between bad recovery options instead of owning the repair —
the owner, verbatim: «Ты мне это предлагаешь?».

**Evolution of skills.** `element-power` rewritten. Owed by the owner's word: `CLAUDE.md` §3 «Stores are on by default, except Redis»
contradicts 619 (only Stripe off) — sealed, not changed.
