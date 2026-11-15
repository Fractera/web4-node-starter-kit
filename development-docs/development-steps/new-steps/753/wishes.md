# 753 — the wishes found during 752 (the input of a plan, not planned)

Found while 752 ran (2026-11-15); by the branch rule they were not fixed inside it. Each is a candidate for a plan, not a task yet.

- W1 (measured 2026-11-15 16:27) — the root starter lacks the tool commands its sealed instruction names. 752 regenerated root's
  `CLAUDE.md` for the first time since step 735, and the custom variant's line «to change it, `npm run tool:own -- <id>` makes the copy
  yours first; nothing fits — `npm run tool:new -- <name> "<the task>"`» came in with it; `fractera-root-starter` v3.0.56 has
  `tool:take` but neither `tool:own` nor `tool:new` (`scripts/tool-own.mjs`, `scripts/tool-new.mjs` of 735 B and
  `lib/parts/node-tools.mjs` of 736 never reached it). Before 752 root's sealed part was simply stale — it lacked the line. A new node
  installs root from this starter, so its agent would meet «Missing script». The way: bring those scripts and their `package.json`
  lines into the root starter as one release (v3.0.57), then into this node's root by the same merge.
- W2 (measured 2026-11-15 before 17:22 in the root starter, by reading the same line in the custom template and the core) — `npm run parts --
  <words>` without `--kind` drops the first word of the query: `scripts/parts.mjs` filters `i !== ki + 1`, and with no `--kind` `ki` is
  −1, so index 0 goes («npm run parts -- voice» answers with its usage). The same index mistake 735 fixed in `tool:take` (D12). The way:
  `(ki < 0 || i !== ki + 1)` in the core's and the templates' `scripts/parts.mjs`, one release each.
