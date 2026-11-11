# machineBoard — this computer: the machine, the memory per element, the Tier-2 comparison

**Type:** Page material. The working part of «Dashboard → This computer» (step 572).

**Decision of the owner, 2026-10-22:** «У нас в проекте есть дашборд, покажи в нём технические характеристики компьютера»; fields —
«Машина + что ест память (Рекомендую)»; the super-node comparison — «Да, строкой сравнения».

How it works: the page is prerendered, so the island asks `GET /api/node/machine` when opened and when Refresh is pressed (no timer —
not ordered). The door (`lib/web4-items/machine.ts`) measures only what the machine knows about itself: system, processor and cores,
memory, the disk of the node folder, uptime, Node.js; the memory per element comes from `pm2 jlist` (process + watcher; a turned-off
element holds none). The Tier-2 rows are built by `tier2Rows` — the same function as the super-node test — and drawn by the same
`TestTable`; bandwidth, NVMe and public addresses are not measured here and show «not measured».
