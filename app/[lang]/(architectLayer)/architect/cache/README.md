# `/architect/cache` — the Fast store element's section

Step 560 (owner, 2026-10-21 and 2026-10-22): the fifth element of the node's memory — **cache**, the fast store
(`WEB4-ITEMS/core/cache`, repository `fractera-redis-cache-starter`). It is meant to keep counters and queues of busy actions in Redis
and pass the totals to data. Today it is a body only: the passport turns it off by default («Works on macOS and Linux; Redis itself is
not connected yet»), so no path of the node starts it. In the left menu it stands in the group «Memory» with data, storage, vectors and
graph. It has no backup section: it is a buffer, the truth lives in data.

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Fast store»: title, lead, `order`, icon `zap` |
| `_components/index.ts` | one block `servicePort` with `serviceId: 'cache'` |
| `preview/` | live preview of the element's home page |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- cache`; never edited by hand |
