# 828 — a domain name is checked in its registry before the node touches Cloudflare

## 1. Retelling and decisions

The owner, 2026-11-21 16:14 UTC (Telegram 571–574): «Я не могу пройти этап регистрация домена. Потому что у меня уже данные записи
существуют внутри регистратора но тем не менее не проходит проверь у тебя есть вход на Cloud player почему там уже создалось два домены я
не понимаю» · «Обработай все три скриншота и проведи исследования очевидно наш процесс работает как-то не очень правильно».

Measured 16:16 (Telegram 576): the Mac's main section held «througsongs.com» (no «h»); Verisign's RDAP answers 404 for it, DNS NXDOMAIN;
the real throughsongs.com (Porkbun, NS ignacio/kay.ns.cloudflare.com) became active at 16:16. At 16:06 the node created a second, empty
zone for the typo. Four holes named to the owner, the fix promised «сразу, без вопросов» (his law 550: choose by the greatest good):
1. the node creates a zone without asking the registry whether the domain exists (`registrarOf` only shows the registrar);
2. no «did you mean throughsongs.com?» while the node's Cloudflare has a zone one letter away;
3. «Убрать из списка» leaves the zone the node itself created;
4. «Сейчас интернет видит: ничего (ещё не замерено)» lies — it was measured, the domain does not exist.

Decisions (mine, by the greatest good):
- RFC 7480 §5.3 (read 2026-11-21): «an empty result set … returns a 404 (Not Found)»; a policy refusal is another 4xx. So 200 —
  registered, 404 — not registered, anything else / no RDAP server for the zone — unknown, and **unknown never blocks** (a registry
  that is down must not stop a real domain).
- The refusal is checked at the add (the earliest point) and again at «Создать зону» (an entry already in the list).
- The closest name: zones the node's key sees and the node's own domains, distance ≤ 1 for names under 8 characters, ≤ 2 otherwise.
  A candidate the node does not have yet — one tap «Добавить <name>»; one it already has — named, no button.
- NOT a soft «did you mean» for a REGISTERED name close to a zone: a registered near-name is usually the person's deliberate second
  domain, and the prompt would be friction in the common case; a typo of a personal brand is almost always unregistered.
- Removal deletes the zone only when all hold: the node created it (its id recorded at creation, `createdZoneId`), the zone with that
  id is still there, it is not active, and it has no DNS records. Otherwise it stays and the answer says why. Deletion: Cloudflare
  `DELETE /zones/{zone_id}`, permission Zone Write (developers.cloudflare.com, «Delete Zone», read 2026-11-21) — the node's key has it.
- The leftover typo zone of today (created before the marker) is NOT touched by this code: its deletion waits the owner's yes (573).

## 2. Reused
`lib/domain/node-domains.ts` (`registrarOf` → replaced, `observe`, `addDomain`, `createDomainZone`, `removeDomain`), `lib/domain/
cloudflare.ts` (`send`, `call`, `zoneByName`, `listZones`), the pattern of `lib/hosting/dns-check.mjs` (pure `.mjs`, `fetchImpl`
injected for tests), `components/domain/domain-cards.client.tsx` (the add row, the one modal), `domain-pipeline.client.tsx` (rung 1),
`domain-ns.client.tsx` (the «now the internet sees» column), `domain-list.i18n.ts`.

## 3. Limits
- The page is prerendered; the list is asked of the door by a press — no polling (comment of `domain-list.client.tsx`).
- Never read `.env.local`; the key is read by `envValue` inside the node only.
- No new interface file (edits of `@local` files); texts only through the dictionary (`check:i18n`); a component ≤ 250 lines.
- A latent defect fixed on the way: the RDAP bootstrap cached a FAILURE for the process's life (`??=` over a `.catch(() => null)`).

## 4. Observable results
- An unregistered name in «+ Добавить домен» → the door answers 409 `not-registered` and nothing is written; the closest name comes back.
- An entry already in the list whose name is unregistered shows the refusal on rung 1 instead of «Создать зону»; the door refuses too.
- «Убрать из списка» on an entry whose zone the node created and which is empty and inactive → the zone is gone from Cloudflare.
- The empty «now the internet sees» column says one of four truths: not measured yet · no such domain · DNS did not answer · no name
  servers.

## 5–7. Substeps (one capability, vertical)
- **828-1 the registry first.** `lib/domain/registry.mjs` (`registryOf`, `closestName`, `nsNothing`), `node-domains.ts` uses it in
  `observe`, `addDomain`, `createDomainZone`; the door passes `closest`; the add row shows the refusal and one tap; rung 1 refuses.
  Done: a typo is refused with its closest name and no zone appears. Proof: `scripts/domain-registry.test.mjs` (stubbed RDAP: 200, 404,
  503, no server; distance; negatives — a registered name passes, unknown passes) · live RDAP for throughsongs.com / througsongs.com.
- **828-2 removal takes the node's own empty zone.** `createdZoneId` written at creation; `removeDomain` async with `zone: deleted |
  kept-active | kept-records | kept-failed`; `cloudflare.ts` `deleteZone`, `zoneHasRecords`; the confirm dialog names the zone's fate.
  Proof: the test's decision table (stubbed Cloudflare — active kept, records kept, other id untouched, empty pending deleted) · after
  the build, the door's GET carries `ownZone` only for marked entries.
- **828-3 the truth in the column.** `nsNothing(d)` → the four keys; `registrarNs` returns `null` when DNS-over-HTTPS failed.
  Proof: the test (four cases) · eyes on the domain page after the core build.

Tasks this needs (parts_find): none — no new interface piece; edits of three `@local` files. Parts born here: none.

## 8. Address
The core, branch main; one core build (with eeb7c201 — the request copy without the hex button); push to the fork and Fractera.
