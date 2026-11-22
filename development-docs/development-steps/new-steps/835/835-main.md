# 835 — an element takes the node's addresses at start, not at build; update and creation wait for a deploy instead of failing

## 1. Retelling and decisions

The owner, 2026-11-22 00:20 UTC (Telegram 680), on his fresh server fractera.ai: «опять как и в прошлый раз мне приходится по кругу
ждать пока поднимутся обновления в элементах … я сразу попытался создать новый кастомные элементы и получила ошибку я попытался сделать
обновление ядра и получил ошибку … почему у нас всё равно продолжают подниматься новые сервера с долгами по элементам?»
00:28 (685): «ты предлагаешь создать огромный шар в котором активация домена, получение сертификатов будет происходить после? Нам
придётся переработать очень сильно лестницу запуска сервера?» → no: the ladder stays as it is (my answer 686).
00:29 (687) → the order agreed (688): build and prove on the Mac (throughsongs.com) → his ordinary «Обновить» on the server → step 827
→ one launch from zero at the end proves both. 00:38 (689): «Ок» — write the plan.

Measured (00:2x): every element's `.env.local` carries `ARCHITECT_URL` and `NEXT_PUBLIC_AUTH_URL`, written by the installer
(`lib/domain/public-auth.cjs`); `lib/domain/stale-addresses.cjs` finds the elements whose values differ from the connected domain and
`lib/hosting/server-domain-switch.ts` (`rebuildStale`) / `app/api/domain/activate` rebuild them all, one by one
(`scripts/deploy-elements.mjs`). `NEXT_PUBLIC_*` is inlined at build; `ARCHITECT_URL`, read at module top in server code of static
(prerendered) pages — the account links, the root's layout banner, the core tab and ~20 more places — lands in the built HTML too.
`scripts/node-update.mjs:186` refuses while `lib/deploy/deploy-lock.cjs` says running. Creation (`npm run create`,
`scripts/item-birth.mjs`) does NOT consult the lock — its error on the server is not measured yet (his visit holds the log).

I assume that: the client side already derives the auth address from the window (`lib/runtime-urls.ts` `authBase()` in the templates),
so only the server branch and the prerendered links are baked.

## 2. Reused
- `lib/runtime-urls.ts`, `lib/site-urls.ts` (window-derived addresses) in every template;
- `proxy.ts` of every template (request time — the place for a redirect);
- `lib/domain/public-auth.cjs` `authEnvOverrides` (one formula for the addresses), `lib/domain/stale-addresses.cjs`;
- `lib/deploy/deploy-lock.cjs` (pid-checked lock), `scripts/deploy-elements.mjs`, `scripts/spawn-free.mjs`;
- skill `release-template` (workshop clones `data/workshop/*`, tag, pin, rollout).

## 3. Limits
- The public layer stays static (`check:static`): no `cookies()`/`headers()`/`force-dynamic` to read an address.
- Elements are never read or edited by me: the change reaches them by a template release and their own merge (rollout).
- The server ladder (IP → install → domain → certificates) is not reordered (the owner, 685/686).
- An element on an older template still needs the rebuild — the switch must tell the two apart, never restart an old one and leave
  it with a stale address.

## 4. Observable results
- On the Mac: disconnect and reconnect throughsongs.com → elements on the new template restart (seconds), `logs/deploy-state.json`
  shows no queue for them; their «Пульт»/«Войти» links lead to the new address.
- `npm run node:update` (and the panel's «Обновить») while a deploy runs → «ждёт окончания развёртывания» and starts by itself after it.
- The creation error on the server named by its cause and fixed or queued the same way.

## 5–6. Substeps, order, address
| # | What | Where |
|---|---|---|
| 835-1 | Templates: one runtime reader of the node's addresses (server env at request time, not `NEXT_PUBLIC_*`); prerendered links go through the element's own `/_node/architect/…` and `/_node/auth/…`, redirected by `proxy.ts` at request time | workshop clones of all six templates → releases, pins in the core |
| 835-2 | Core: on a domain switch an element whose template is ≥ 835-1 gets its `.env.local` rewritten and a pm2 restart with the new env; older ones rebuild as today | core: `lib/domain/stale-addresses.cjs`, `lib/hosting/server-domain-switch.ts`, `app/api/domain/activate` |
| 835-3 | Core: `node:update` and creation wait behind a running deploy (a detached waiter, the panel says «ждёт развёртывания»), never refuse | core: `scripts/node-update.mjs`, `scripts/item-birth.mjs`, the update door |
| 835-4 | The creation error on the server: read its log (his visit), name the cause, fix in the same build | core |
| 835-5 | Rollout into the Mac's elements, one core build, the proof with throughsongs.com; push fork + Fractera; Roma presses «Обновить» on the server | core + elements' own merge |

835-1 before 835-2 (the switch needs a template that reads at start). 835-3 independent. 835-4 needs his server visit.
Then step 827 (fast install) — unblocked: a built archive no longer carries one node's address.

## 7. Proofs (named in advance)
- 835-1: build a template clone with address A, start it with address B in env → HTML link `/_node/architect/x` → 307 to B (curl);
  negative control: the same page of the old tag → a link to A.
- 835-2: reconnect throughsongs.com → `logs/deploy-state.json` has no new queue for a new-template element and its pm2 uptime reset;
  negative control: an old-template element still queued.
- 835-3: start a deploy, run `npm run node:update` → the «ждёт» line, then the update log starts after the deploy's `finishedAt`;
  negative control: without a deploy it starts at once.

Parts born here: none (no new interface file; the panel line uses an existing status row).

## 9. Approval
Waits the owner's «да» (Telegram).
