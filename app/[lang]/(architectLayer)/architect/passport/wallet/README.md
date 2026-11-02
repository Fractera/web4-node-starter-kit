# `/architect/passport/wallet` — Main wallet

Step 530-2 (owner 2026-10-18: «на вкладке паспорт мы добавляем две новые вкладки это официальный аккаунт, и главный кошелёк»).
The page shows the node wallet — the same island and door (`/api/node/wallet`) as the wallet card on the Passport home and «Settings → Payments → Web3» of the main agent and of each element.

| Path | Role |
|---|---|
| `page.tsx` | thin entry: words from `_data`, the island as `widget` |
| `_data/` | `slug`, `order`, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is the island |
