# `/architect/passport/official` — Official account

Step 530-2 (owner 2026-10-18: «на вкладке паспорт мы добавляем две новые вкладки это официальный аккаунт, и главный кошелёк»).
The page shows the «Official» mark in plain words (Lagrix document 24) and the application kept on the node — island `components/official/official-account.client.tsx`, door `/api/node/official`, file `data/node/official.json`. Nothing is sent to the network.

| Path | Role |
|---|---|
| `page.tsx` | thin entry: words from `_data`, the island as `widget` |
| `_data/` | `slug`, `order`, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is the island |
