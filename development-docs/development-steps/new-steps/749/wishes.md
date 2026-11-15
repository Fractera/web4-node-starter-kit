# 749 — wishes: found on the way, NOT fixed in this step

- W1 (2026-11-15, by reading, not measured) — deleting an element on a server: `lib/web4-items/element-delete.ts` (~line 117) removes
  only the tunnel's route and DNS; on a server its nginx name and A record would stay.
- W2 (2026-11-15, by reading, not measured) — changing an element's address on a server: `lib/web4-items/element-subdomain.ts:26` answers
  `nothing-to-move` without a tunnel, so the new name would get no record and no nginx name.
- W3 (2026-11-15 13:05, measured on the Mac when the owner deleted jctu4 and bd5ln) — (a) the deleted element's agent session kept
  running (claude pid 65188 in the deleted folder; `npm run close` → no-agent-kit; `/api/agents/sessions` did not list it — stopped by
  SIGTERM); (b) `data/node/supervision.json` keeps records of the deleted ids (`npm run supervise -- <id> off` refuses an unknown id);
  (c) the dying agent asked to cross its boundary three times in a minute, looking for its vanished folder.
- W4 (2026-11-15, by reading) — `/api/node/online` and the Cloudflare static copy also read «no tunnel = no domain»; on a server the
  online bar is hidden (741-6) and the copy is Cloudflare's — named only.
