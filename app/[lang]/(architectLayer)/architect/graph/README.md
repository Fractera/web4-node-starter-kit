# `/architect/graph` — the Graph element's section

Step 540 (owner, 2026-10-19): the knowledge graph of the node is its own native element **Graph** (`WEB4-ITEMS/core/graph`,
repository `fractera-graph-lightrag-starter`), built on LightRAG. Its first version `v0.1.0` is the standard service element made
from the standard custom element (roman); the versions after it add the graph. This section is shaped like «Design» and «Blocks».

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Graph»: title, lead, `order`, icon `network` |
| `_components/index.ts` | one block `servicePort` with `serviceId: 'graph'`: port on the machine and address on the internet |
| `preview/` | live preview of the element's home page |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- graph`; never edited by hand |
