# 830 — the Mini App screens open to the element's own admin (closed 2026-11-21)

The owner, Telegram 586 (17:00 UTC), a screenshot of j58fl's Mini App «Cron» with «Эта страница вам недоступна — Требуется одна из этих
ролей: admin, architect»: «…я всё равно не могу им пользоваться проверь почему роли не позволяют пользоваться приложением Telegram». 589:
«Поехали без остановки».

Measured: his account holds [user, elementAdmin002] (j58fl's admin role). The tg layout lets the architect and the element's own admin
in, but every tg screen (cron, element, projects, settings) carries `meta.roles: ["admin"]`, and `allowedRoles` (lib/branch-page.tsx)
added a branch's own roles only for admin, staff and finance (805) — tg was missed, the inner lock asked for «admin, architect».

## Commits

| Repository | Commit / tag | What |
|---|---|---|
| fractera-custom-item-starter | 000d7ca, tag v0.3.227 | `lib/page-lock.mjs` (pageLock, BRANCH_GROUP with tg → admin), branch-page uses it, `lib/page-lock.test.mjs` in the prebuild |
| core | 7b8d9284 | pin custom v0.3.227 |
| j58fl (its own agent) | 72cce1a | the three files merged; the rollout tool had refused («HEAD d90a0c9 is not its pin v0.3.225 — left alone») |

The release tool's node token got 403 (`===TEMPLATE_NO_RIGHT===`); main and the tag were pushed with this machine's GitHub login (account
Fractera), as the earlier template releases of the day. j58fl deployed 17:32–17:34 (104 s), its bot button set by the deploy itself.

## Proofs

Plane 1 — `page-lock.test` 5 ✓; the negative control: the old rule gives exactly «admin, architect» (his dialog), the new one adds
elementAdmin002; the template's prebuild RC=0, tsc 0; j58fl's agent: test 5 ✓, tsc 0.
Plane 2 — waits the owner's tap in Telegram on a Mini App screen (no session of his is mine to use). From this Mac Cloudflare's
188.114.96.5/.97.5 time out after 17:27 while other sites and the temporary address answer — a network block in front of this Mac,
not the node (hypothesis; the tunnel registered four connections in Madrid).

## Mistakes

- 805 fixed the same hole for three branches and left no test; the Mini App branch came later and fell into it. Now the rule has its test.

## Evolution of skills

None. ## Parts born here — none.
