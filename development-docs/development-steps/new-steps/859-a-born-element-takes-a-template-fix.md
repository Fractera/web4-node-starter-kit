# 859 — a born element takes a template fix, and its key is measured, not assumed

Source: the fractera.ai server agent, forwarded by Roma 2026-11-24 ~16:52 UTC (pre-steps/2026-11-24-born-element-key.md, data).
Approved by Roma 1296 («решай это самостоятельно … работай»).

## Measured on the Mac (not again)

- 857 live on cck60 (born native, merged v0.1.82 as ebb2d26, deployed): `storeScope` = `element cck60`; create/insert/select/drop through
  the data service 200 ×4; no app.db in data/, .next-a|b/standalone/data/, SERVICE_DATA_DIR (its own report 16:38 UTC).
- The installer (`scripts/services-install.mjs` 997–1000) writes `ELEMENT_KEY=elementKeyOf(id, DATA_SECRET)` for every `# kind:
  element-key` — the Mac proves it for a born native. lidt5's 401 on the server is what v0.1.81 does (it sends only X-Data-Secret,
  empty for a born element) — expected until it takes v0.1.82. «ELEMENT_KEY empty» is the element's reading, not yet measured with
  `storeScope` (a value is never printed): the first proof after 859-1.

## Substeps

- **859-1 · A road for a born element to take the pinned template** — `npm run template -- offer <id>` (core): the pinned tag of its kind,
  the paths that changed between the element's born/last-taken tag and the pin (from the workshop), and a task to ITS agent to merge
  them (git merge-file, its own commits stay, conflicts its own), run its prebuild, commit, report by reply-core; the core then deploys
  and records the taken tag. The element owns its code; the core never writes into a born element (`updateState()` stays null for born).
- **859-2 · The installer says an empty element key aloud**: a declared `element-key` that comes out empty → a ⚠ line naming the
  element (today silent), and `npm run card` names whether its key is present (never the value).
- **859-3 · Cards of vectors and graph** name what a born element calls with its own key (`X-Element-Key`) — a task to those elements'
  agents (their passports are theirs).
- Proofs: on the Mac a second born element takes v0.1.82 by the road (its commits kept); on the server lidt5 after Roma's update:
  storeScope `element lidt5`, migrate 200, a vector stored and found, a graph insert and query; a preinstalled native still X-Data-Secret.
