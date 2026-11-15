# 750 — wishes found during 749: element deletion and names on a server (NOT planned — waits for the owner's word)

Found while 749 ran (2026-11-15); by the branch rule they were not fixed inside it. Each is a candidate for a plan, not a task yet.

- W1 (by reading, not measured) — deleting an element on a server: `lib/web4-items/element-delete.ts` (~line 117) removes only the
  tunnel's route and DNS; on a server its nginx name and A record would stay.
- W2 (by reading, not measured) — changing an element's address on a server: `lib/web4-items/element-subdomain.ts:26` answers
  `nothing-to-move` without a tunnel, so the new name would get no record and no nginx name.
- W3 (measured on the owner's Mac, 2026-11-15 13:05, when he deleted two elements) — (a) the deleted element's agent session kept
  running (a `claude` process in the deleted folder; `npm run close` → no-agent-kit; `/api/agents/sessions` did not list it — stopped by
  hand); (b) `data/node/supervision.json` keeps records of deleted ids (`npm run supervise -- <id> off` refuses an unknown id); (c) the
  dying agent asked to cross its boundary three times in a minute, looking for its vanished folder.
- W4 (by reading) — `/api/node/online` and the Cloudflare static copy also read «no tunnel = no domain»; on a server the online bar is
  hidden (741-6) and the copy is Cloudflare's — named only.
- W5 (seen on aifa.dev 14:12–14:16 UTC, 749-1's live proof) — «Опасная зона» of the site element offers «Удалить элемент» although the door
  refuses it (not a born element), and the dialog's line names its address `root.aifa.dev` while it lives at the zone itself
  (`aifa.dev`, `hostnameFor` of the reach door).
