# `/architect/market` — the Marketplace element's section

Step 862-1 (Roma, 2026-11-27: «Да согласен разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это
точно»): the buyer's side of the Fractera store in every project — **market** (`WEB4-ITEMS/core/market`, repository
`fractera-market-client-starter`, `provides: market-client`). Recommendations of starters, the cart with one copy of each, the history
of choices; the core signs the talk with the store, shows the payer's window and installs what was bought (skill `marketplace`). Its own
agent builds its function on the creator's node, stage by stage.

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Маркетплейс»: title, lead, `order` 28, icon `store` |
| `_components/index.ts` | one section `servicePort` with `serviceId: 'market'`: port on the machine and address on the internet |
| `preview/` | live preview of the element's home page |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- market`; never edited by hand |
