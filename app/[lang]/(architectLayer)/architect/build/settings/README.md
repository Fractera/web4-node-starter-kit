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
| `own` (in `page.tsx`) | 718: a drop-down list (`components/panel-design/node-settings.tsx`) — the node's base AI provider (691: `components/ai-provider/`, Anthropic · Claude Code by default, Codex not possible yet) and «Panel design»: the fine-tuning editors (`components/design/*`) writing this panel's own look through `/api/architect/panel-design` into `data/node/panel-design.json`; no file — the panel copies the site's look |
