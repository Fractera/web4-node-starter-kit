# `/architect/build/construction` — main agent

Steps 528-3 and 528-6 (owner 2026-10-18: «core it is main agent - need similar scheme»; «Приведи в соответствие»): the main agent's menu
repeats the element's menu (`lib/web4-items/item-tree.ts`). This page's title is the tree's word for «build» (`treeWords`), its purpose
line is its own, for the whole node.

| Path | Role |
|---|---|
| `page.tsx` | thin entry: `_lib/main-agent-page.tsx` draws the title, the purpose line and the items under this page in the menu |
| `_data/` | `slug` = folder name, `order` (position among siblings), words `en` + `ru` |
| `_components/index.ts` | the working part — empty until node-wide data is built |

This is the main agent's own section: the pages under it keep their own addresses (`build/<name>`) and are placed here by `_lib/main-agent-scheme.ts`.
Not built yet: real node-wide data. The menu and its correspondence to the element are guarded by `scripts/check-main-agent-menu.mjs`.
