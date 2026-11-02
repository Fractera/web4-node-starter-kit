# `/architect/vectors` — the Vectors element's section

Step 550 (owner, 2026-10-21): the data layer is split into native elements — data (the database), storage, **vectors** (this
one, `WEB4-ITEMS/core/vectors`, repository `fractera-vectors-starter`) and graph. Vectors keeps the vector store of the node;
consumers still call `/vectors/*` on data, which passes the request here. This section is shaped like «Graph».

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Vectors»: title, lead, `order`, icon `scan` |
| `_components/index.ts` | one block `servicePort` with `serviceId: 'vectors'`: port on the machine and address on the internet |
| `preview/` | live preview of the element's home page |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- vectors`; never edited by hand |
