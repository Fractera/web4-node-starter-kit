# `/architect/build/settings` — main agent

Step 530-1 (owner 2026-10-18: «На вкладке настройки создать вкладку платежи … веб два и web3 … Это нужно также сделать и в ядре»).
Title — the element tree's word for «settings» (`treeWords`); purpose line — its own, for the node. Drawn by `_lib/main-agent-page.tsx`:
the items under this page in the menu
and the same page in each element.

| Path | Role |
|---|---|
| `page.tsx` | thin entry |
| `_data/` | `slug`, `order`, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is passed as `own` |
