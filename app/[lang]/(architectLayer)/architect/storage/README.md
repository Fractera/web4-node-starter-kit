# `/architect/storage` — the Storage element's section

Step 550 (owner, 2026-10-21): the data layer is split into native elements — data (the database), **storage** (this one,
`WEB4-ITEMS/core/storage`, repository `fractera-storage-starter`), vectors and graph. Storage keeps the files of the node; consumers
still call `/media/*` on data, which passes the request here. This section is shaped like «Graph».

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Storage»: title, lead, `order`, icon `drive` |
| `_components/index.ts` | one block `servicePort` with `serviceId: 'storage'`: port on the machine and address on the internet |
| `preview/` | live preview of the element's home page |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- storage`; never edited by hand |
