# `/architect/embeddings` — the Embeddings element's section

Step 631 (owner, 2026-11-03: «Я до сих пор не вижу нашего нового нормативного элемента который мы создали для embending»): the
element born in 626-2 — **embeddings** (`WEB4-ITEMS/core/embeddings`, repository `fractera-embeddings-starter`), the node's own
vectors: `paraphrase-multilingual-MiniLM-L12-v2`, 384 numbers, on this computer, no key. The vector store, the knowledge graph and the
deep memory count every vector through its doors (626-3 … 626-6). In the left menu it stands in the group «Memory», after Vectors.

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Embeddings»: title, lead, `order`, icon `binary` |
| `_components/index.ts` | one section `servicePort` with `serviceId: 'embeddings'`: port on the machine and address on the internet |
| `preview/` | live preview of the element's home page |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- embeddings`; never edited by hand |
