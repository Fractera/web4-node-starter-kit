# 750 — deleting an element leaves nothing alive behind it; names follow an element on a server; no delete for what cannot be deleted

Planned 2026-11-15 14:33 UTC — **Approved 14:37 UTC**: «да, утверждаю 750-1…4 целиком, go , but test only in aifa.dev» — every live proof on aifa.dev only (750-D1 narrowed: no throwaway element on the Mac; the Mac proofs of 750-1 and 750-4 move to aifa.dev). Repository: the core only (Fractera/web4-node-starter-kit, main). The
input: the wishes found during 749 (`wishes.md` beside this file, W1–W5). The owner's word, 2026-11-15 after 749's report: «go to continue,
after 750».

## 1. Measured by reading (2026-11-15, the workshop at `1079785c`)
- **W3a — the agent outlives its element.** `deleteElement` (`lib/web4-items/element-delete.ts`) stops the element's pm2 process and
  watcher, never its agent sessions (`claude` in the element's folder, main and `--work`). After the registry step the core no longer
  knows the element, so `npm run close` / `/api/agents/done` answer `no-agent-kit` and the session keeps running in a deleted folder
  (measured on the Mac 13:05: a live Opus session; its dying agent then asked three permissions hunting its folder — W3c).
- **W3b** — `data/node/supervision.json` (`lib/web4-items/supervision.cjs`) keeps the deleted id; `supervise <id> off` refuses it.
- **W1 — a server keeps the deleted element's name.** Stage 2 of `deleteElement` acts only on a tunnel (`zone && tunnelId`); on a server
  (`via: "server"`) it writes «no-domain». nginx takes its names from the registry (`lib/hosting/hostnames.mjs` `installedElements` →
  `nodeNames`), so a rewrite after the registry step drops the name; the A record stays unless removed (`deleteDnsRecords` exists).
- **W2 — renaming an element's address on a server moves nothing.** `lib/web4-items/element-subdomain.ts:26` returns `nothing-to-move`
  without a tunnel; the new name gets no record, no nginx name, no certificate (`scripts/dedicated-server/name-up.mjs` does all three for a
  new name and is not called).
- **W5** — «Опасная зона» offers «Удалить элемент» for every registry entry; the door refuses all but born custom elements (the site
  element: 404), and the dialog's address line shows `root.aifa.dev` while the site lives at the zone.
- **W4** — named only (`/api/node/online`, the Cloudflare copy): not in this step.

## 2. Substeps
| # | Result | Proof (two planes, one negative) |
|---|---|---|
| 750-1 | Deleting an element first closes its agent sessions (main and work) while the core still knows it, then removes its supervision record; the steps list says so | a test of the stage order over a stubbed kit (close called before the registry step; an unknown id → named, not a crash) · live on the Mac: a throwaway element born, its agent woken, deleted — no `claude` left in its folder, `supervision.json` without it |
| 750-2 | On a server, deleting an element removes its name: nginx rewritten without it (detached, as `name-up`), its A record removed by the node's Cloudflare token when the zone is there, else named in the result | a test: the nginx table built after the registry step no longer holds the name · live on aifa.dev: a throwaway element born and deleted — its name answers 444/no certificate, `nodeNames` without it |
| 750-3 | On a server, a new address of an element gets its record, nginx name and certificate (the `name-up` road); the old name leaves with the rewrite | a test of the road choice (tunnel / server / none) · live on aifa.dev with the same throwaway element before its deletion: the new name answers over HTTPS, the old one does not |
| 750-4 | «Опасная зона» offers deletion only to an element the door can delete; the others get one line why; the address line names the real internet name | Chrome: the site element shows the line, no button; a born element still shows the dialog · the door's refusal unchanged (404) |

## 3. My decisions (one line each)
- 750-D1 — The throwaway element for the live proofs is born by `npm run create` with a name, used, and deleted in the same pass (price: one
  birth ≈ 3–5 min and ≈ 300 MB on each node while it lives; no agent work beyond a wake).
- 750-D2 — An A record outside Cloudflare is never touched: the result names it for the person (as `serverReach` does for a new name).
- 750-D3 — The certificate of a deleted name is left to expire (certbot's own cleanup), not revoked.

## 4. Not in it
W4; the element's own second domain on a server (the open list); any template change.

## 5. Order and price
750-1 → 750-2 → 750-3 → 750-4 → the chain → push → CI → fork sync → aifa.dev's update and its live proofs → warn → the Mac's update →
its live proof of 750-1 and 750-4. Code: one session; two node updates (the Mac ≈ 12 min with a dark terminal, aifa.dev ≈ 5 min).
