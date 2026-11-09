# `/architect/super-node/payouts` — Payouts

Steps 530-3 and 531. The payouts table (`TableTools`: search on top, pages below) read from the super-node's server through the operator
API v1 (`/operator/v1/payouts`, Lagrix document 15, section 15.7), and what a super-node is paid for — five points, each with its Lagrix
document (09, 17, 24, 06, 26). When the server is not connected, the page says so and points to «Status».

| Path | Role |
|---|---|
| `page.tsx` | thin entry: words from `_data`, the island as `widget` |
| `_data/` | `slug`, `order`, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is the island |
