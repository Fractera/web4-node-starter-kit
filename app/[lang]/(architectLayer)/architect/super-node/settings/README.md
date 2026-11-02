# `/architect/super-node/settings` — Settings

Step 530-3. The page shows the operator's country, coverage (accepted tags), regional restrictions (forbidden tags), open lists, and the read-only list prohibited by default — the three layers of Lagrix 17.9 and the declaration of 18.4, kept on the node (`/api/node/super-node`, action `settings`).

| Path | Role |
|---|---|
| `page.tsx` | thin entry: words from `_data`, the island as `widget` |
| `_data/` | `slug`, `order`, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is the island |
