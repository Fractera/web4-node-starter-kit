# 739 — sign-in on an own domain, and the architect's claim on a server (plan, waits for the owner's yes)

Planned 2026-11-14. Repositories: the core (Fractera/web4-node-starter-kit, main) and the sign-in template (Fractera/fractera-auth-starter,
main, a release by the skill `release-template`). One node update at the end.

## 1. The owner's words (verbatim, 2026-11-14)
- The error `http://127.0.0.1:24681/api/auth/error` on aifa.dev — «можешь её запланировать как отдельный шаг».
- The test domain: «http://throughsongs.com».
- «да, D23 в 739, порядок 739 → 741 → 740».
- I assume that the throughsongs.com test runs on THIS computer through «Активация домена» (the tunnel), with his Cloudflare key typed by him.

## 2. What is reused (paths that open)
- The core: `lib/domain/public-auth.cjs` (`publicAuth`, `authEnvOverrides`), `lib/auth-base-server.ts` (`authBaseFromHost`), `lib/domain/auth-env.ts`
  (`applyDomainToAuth`), `app/api/domain/activate` (the tunnel switch-on), `lib/hosting/server-domain-switch.ts` (the server switch-on),
  `scripts/dedicated-server/launch.mjs` (`signinCheck`, the `door` verb), `components/hosting/server-launch-end.client.tsx` (`ReadyStep`).
- The template: `lib/auth/register.ts` and `lib/auth/sqlite-adapter.ts` (the first node user becomes the architect — two places),
  `app/(auth)/register/_components/register-placeholder.client.tsx`, the lock `x-architect-token` = `ARCHITECT_TOKEN` on loopback
  (`app/api/node-users/README.md` — only the core and the sign-in element hold it), `NEXTAUTH_URL` readers (`app/(auth)/page.tsx`,
  `app/api/auth/sso`, `app/logout`, `lib/auth/apps.ts`).

## 3. Known limits
- The element boundary: the core never writes into the sign-in element's folder — the claim goes through the element's own door.
- CLAUDE.md §2: «The first registered account is the architect for good … created on this computer before an own domain is connected» —
  the computer keeps today's rule; the claim exists only where no account exists and a public name is about to open (a server).
- A template change reaches nodes only by a release (tag, the core's pin, the rollout to every auth element) — skill `release-template`.
- Personal data never in git; the code is kept hashed, never in a log.

## 4. Observable results
1. A server's first registration is refused without the code and accepted with it as the architect; a second one is an ordinary user.
2. On a computer (no claim) the first registration is the architect, as today.
3. On throughsongs.com the sign-in button leads to https://auth.throughsongs.com; before a switch-on no public name ever leads to 127.0.0.1.
4. The launch page's last step shows the code once, with the address to register at.

## 5. Substeps
| # | result | proof (two planes, one negative) |
|---|---|---|
| 739-1 | template: the claim — door `POST /api/claim` (lock `x-architect-token`, loopback) keeps a hash; `register` and the OAuth/magic-link `createUser` refuse the first node user without the code while a claim waits; the register page shows a code field; the claim ends with the first registration | template tests: no code → refused, wrong → refused, right → architect, second → user; negative: no claim → first user architect (computer path) · the door without the token → 401 |
| 739-2 | template: never loopback — with `NEXTAUTH_URL` on loopback and a request from a public name, the sign-in pages say «вход ещё не включён» instead of redirecting | test of the decision function; negative: a loopback request keeps working |
| 739-3 | template release + the core's pin + the rollout to this node's sign-in element | the element answers `/api/health` with the new version; `check:*` of the template green; CI of both repositories |
| 739-4 | core: `authBaseFromHost` never returns a loopback base for a public request host; the core's sign-in redirect says «вход ещё не включён» there | unit test: public host without `domain.json` → no loopback; negative: localhost → the registry's address as today |
| 739-5 | core: the claim from the launch page — the runner asks the server node to issue a code (its core calls the sign-in element's door), the page shows it once with «https://auth.<zone>/register»; «Выдать новый код» replaces it | dry test on the in-process ssh2 server (the code reaches the door hashed, never a file of the computer); live in 738-9 |
| 739-6 | the live proof on throughsongs.com on this computer: «Активация домена» (his key), then the sign-in button | eyes on https://throughsongs.com: the button's address is https://auth.throughsongs.com; curl of the core's redirect from outside; negative: the temporary address keeps sign-in closed |

## 6. Decisions (my pick first)
- **D27** where the code lives: a hash in the sign-in element's own data, set only through its door with `ARCHITECT_TOKEN` (pick); not the core.
- **D28** the code is shown once on the launch page; a reload or a lost code → «Выдать новый код» replaces the old one (pick).
- **D29** while a claim waits, Google and the magic link cannot create the first node user — only the form with the code (pick).
- **D30** the claim only on a server launched from the page; a computer keeps «first registration is the architect» (pick).

## 7. Not in it
- 741 (one record of where the node lives), 742 (the certificates page), 740 (the danger zone).
- The root element's own sign-in button code (its template is the root starter): checked in 739-6 by eyes, changed only if it fails.
