# `/architect/build/tools` — the core's tools (node step 725-8)

The main agent's tab «Инструменты» in «Рабочие процессы» (`MAIN_AGENT_PLACE`: `construction`).

| Path | Role |
|---|---|
| `page.tsx` | thin entry: names this folder, exports metadata, renders the content |
| `_data/` | the words of this page — `meta` (slug, order 30) + `en` + `ru` |
| `_components/index.ts` | one section of kind `toolsTab` (`sections/kinds/tools-tab.server.tsx`) |

**Build cost:** one prerendered page per language; nothing of the list is baked in — the island asks `/api/node/tools?item=build` when it
opens, so a tool the main agent adds appears without a rebuild of this page.
**Caching:** the page is static; the door answers `no-store`.
