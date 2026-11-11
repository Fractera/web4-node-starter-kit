# subscriptionsBoard — all subscriptions of the node: services × the elements that use them × their state

**Type:** Page material. The working part of «Dashboard → All subscriptions» (step 726-3).

**Decision of the owner, 2026-11-11:** «Накладку Dashboard нужно вытащить все сервисы которые имеют подписки во всех элементах … таблица
которая существует внутри дашборд называется все подписки она указывает название сервиса и выпадающем списке показывают все элементы
которые его вызывают».

How it works: the page is prerendered, so the island asks `GET /api/node/subscriptions` (architect/admin) when opened and on Refresh — no
timer, none was ordered. The rows are built by the pure `lib/subscriptions-board.cjs` from two sources: every element's
`OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` (and the main agent's) and every ledger of paid calls (`lib/usage-ledger.cjs`, the core's and each
element's own, the last 7 days). Keys leave the door only as a state (set, partly set, not set) — never a value.

Limits: one row per service, any number of rows; the dropdown holds any number of elements. Six columns — keep them; a balance column is
step 726-4, not a widening of this one. A service declared only as an example (`example: true`) with no calls sorts last with the mark
«example». An element with neither a declared service nor a paid call appears nowhere.

**Step 726-4 — «will it last today?»** The owner, 2026-11-11: «текущая состояние то есть активно или неактивно – хватит на сегодня
оплаченных ресурсов». Inside the existing columns (no seventh): the Calls cell carries today's line from the ledger in CALLS — no
calls / the pace to the end of the day / «enough for today» / «at this pace the budget ends at HH:MM» / «the budget was reached» /
«the provider refuses for money since HH:MM» — and the «Budget» popover where the person sets the daily budget in calls
(`data/node/budgets.json`, POST to the same door). The Keys cell carries the balance after «Check balances» — the only moment the node
asks the providers (`lib/money-day.cjs`, measured at the primary sources: OpenAI tells no balance and the day's spend only with an Admin
key; Exa tells the balance with a service key). Prices are not known to the node, so no sum is ever estimated from calls.
