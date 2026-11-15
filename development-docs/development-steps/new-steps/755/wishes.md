# 755 — the wishes found during 753 (the input of a plan, not planned)

Found while 753 ran (2026-11-15); by the branch rule they were not fixed inside it. W1 of 752 was done inside 753 by the owner's word.

- W2 (measured 2026-11-15 before 17:22 in the root starter, by reading the same line in the custom template and the core) — `npm run parts --
  <words>` without `--kind` drops the first word of the query: `scripts/parts.mjs` filters `i !== ki + 1`, and with no `--kind` `ki` is
  −1, so index 0 goes («npm run parts -- voice» answers with its usage). The same index mistake 735 fixed in `tool:take` (D12). The way:
  `(ki < 0 || i !== ki + 1)` in the core's and the templates' `scripts/parts.mjs`, one release each.
