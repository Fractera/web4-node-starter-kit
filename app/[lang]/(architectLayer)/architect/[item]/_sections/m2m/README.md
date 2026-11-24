# 🪦 Section «Network (M2M)» — removed 2026-10-11 (node step 451-2)

The owner replaced the A2A/M2M split with three protocols (`/code` CLAUDE.md, «Three protocols»). The two tabs of this section moved
into «Build» as the group «Exchange with Fractera (f2f)»: `build/find` (find a ready element in other Fractera projects through
Lagrix) and `build/publish` (offer this whole element to them). Old addresses `web3-store/*` redirect (`MOVED_PAGES` in
`lib/web4-items/item-tree.ts`). f2f is the build process; it goes through Lagrix with the technical characteristics a build needs.

Step 528 (owner 2026-10-18): f2f is a subsection with its own address — `build/f2f` (how it works), `build/f2f/find`, `build/f2f/publish`;
`build/find`, `build/publish` and `web3-store/*` redirect there (`movedPage()`).

Step 854 (Roma 2026-11-24, «по ошибке это реализовано в кастомном шаблоне»): `build/f2f` is one page «Предложить в маркетплейсе» of an
own native element only (born on the node, `ownNative` in the tree context) — a choice Web2 (the Fractera marketplace) / Web4 (Lagrix,
simulated) and a plain application form kept in `data/node/f2f/offers.jsonl` (door `/api/node/market-offer`). `build/f2f/find`,
`build/f2f/publish` and every older address redirect to `build/f2f`; a custom element has no f2f section.
