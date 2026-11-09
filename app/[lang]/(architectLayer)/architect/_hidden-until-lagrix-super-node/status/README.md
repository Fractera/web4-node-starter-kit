# `/architect/super-node/status` — Status

Step 531 (owner 2026-10-18: «вкладку что-то типа статус в котором пользователь может нажать кнопку подать заявку … заявка одобрена
показывает время и как раз там должна быть кнопка пройти тест»). The application for a super-node place
(`components/super-node/super-node-status.client.tsx`, door `/api/node/super-node`): none → submitted, waiting for approval (in the
prototype a «Simulate the approval» button stands in for the network's invitation) → approved, with the date and the 48-hour deadline, the
super-node's server (address + operator key, checked through the operator API v1 — Lagrix document 15, section 15.7) and «Run the test»
(the server's hardware against the Tier-2 profile, compared by the core). How an application works — points with links to Lagrix documents.

| Path | Role |
|---|---|
| `page.tsx` | thin entry: words from `_data`, the island and the document links as `widget` |
| `_data/` | `slug`, `order` 5, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is the island |
