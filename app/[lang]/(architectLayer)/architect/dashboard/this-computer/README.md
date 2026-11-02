# `/architect/dashboard/this-computer` — this computer (step 572)

Owner, 2026-10-22: «покажи в нём технические характеристики компьютера»; fields «Машина + что ест память», super-node comparison
«Да, строкой сравнения». One block: `machineBoard` (`sections/blocks/machine-board.server.tsx` → island
`components/dashboard/machine-board.client.tsx`). The island asks `GET /api/node/machine` (architect/admin) when opened and on Refresh;
the door is `lib/web4-items/machine.ts`. Three cards: the machine · what uses the memory (pm2, per element) · Tier-2 comparison
(`tier2Rows`, the same rows and table as the super-node test). No timer.
