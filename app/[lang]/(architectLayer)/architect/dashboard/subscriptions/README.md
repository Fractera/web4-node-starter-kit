# `/architect/dashboard/subscriptions` — all subscriptions of the node (step 726-3)

The owner, 2026-11-11: «таблица которая существует внутри дашборд называется все подписки она указывает название сервиса и выпадающем
списке показывают все элементы которые его вызывают». One section: `subscriptionsBoard` (`sections/kinds/subscriptions-board.server.tsx`
words → island `components/dashboard/subscriptions-board.client.tsx`).

The page is prerendered (build cost: one static shell per language, no data at build time). The island asks
`GET /api/node/subscriptions` (architect/admin) when opened and on Refresh — no timer. The door reads the sources
(`lib/web4-items/subscriptions-board.ts`): every element's `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json`, the main agent's, and the ledgers of
paid calls (`lib/usage-ledger.cjs` — the core's `data/node/usage/` and each element's own) for the last 7 days; the rows are built by the
pure `lib/subscriptions-board.cjs`, proven over a fixture by `npm run test:subscriptions-board`. Keys leave as a state only.

726-4: today's burn against a daily budget in calls (set in the «Budget» popover, `data/node/budgets.json`) and «Check balances»
(`?balances=1`, the only moment the providers are asked) — `lib/money-day.cjs`, proven by `npm run test:money-day`.
