# 828 — a domain name is checked in its registry before the node touches Cloudflare (closed 2026-11-21)

The owner, Telegram 571–574 (16:14 UTC): «Я не могу пройти этап регистрация домена … почему там уже создалось два домены я не
понимаю» · «Обработай все три скриншота и проведи исследования очевидно наш процесс работает как-то не очень правильно». Measured: the
Mac's main domain was typed «througsongs.com»; Verisign's RDAP answered 404, DNS NXDOMAIN; at 16:06 the node had created a second, empty
zone for the typo. Promised «сразу, без вопросов» (his law 550).

## Commits

| Repository | Commit | What |
|---|---|---|
| core | ae7b38eb | `lib/domain/registry.mjs` (RDAP 200 / 404 / unknown, the closest name, the NS column), `own-zone.mjs`, `cloudflare.ts` zoneHasRecords / deleteZone, `node-domains.ts` wired, the door awaits removal, the domain cards, rung 1, the NS column, words en/ru, `scripts/domain-registry.test.mjs` in the prebuild |
| core | 614dfb59 | «never stops a name» — the first core build failed on the word «blocks» |

Pushed: Fractera/web4-node-starter-kit and the fork aifa-agi at 614dfb59. Core built 17:19–17:27 UTC, /api/health commit 614dfb59.

## Proofs

Plane 1 — `domain-registry.test` 6 ✓: RDAP 200 → registered with Porkbun, 404 → unregistered; negatives — 503, a network failure, a
zone without RDAP → unknown, never «unregistered»; the closest name (one letter → throughsongs.com; a short name two edits away → none);
the NS column's four answers; the zone fate table (only an own, empty, inactive zone leaves; active, with records, another id stay).
Plane 2 — live RDAP through the same function: throughsongs.com `registered` (Porkbun LLC), througsongs.com `unregistered`,
fractera.ai `registered` (GoDaddy), lagrix.dev `registered` (Porkbun).
Not proven live: the refusal on the page (the Mac has its main domain, so its add row is hidden; the server shows it after its update).

## Mistakes

- My green prebuild did not see `lib/domain/registry.mjs`: the words guard reads tracked files only, the file was still untracked — the
  first core build failed and restored the previous build. Commit before the last prebuild.
- The earlier RDAP code cached a failed bootstrap for the life of the process — fixed in `registry.mjs`.

## Evolution of skills

Nothing to change in a skill: the rule «commit, then the prebuild that decides the build» belongs to `rebuild-only-after-green-prebuild`.

## Parts born here

None (edits of `@local` files).
