# `/architect/build/settings/payments/web2` — main agent

Step 530-1 (owner 2026-10-18: «На вкладке настройки создать вкладку платежи … веб два и web3 … Это нужно также сделать и в ядре»).
Title — the element tree's word for «settings/payments/web2» (`treeWords`); purpose line — its own, for the node. Drawn by `_lib/main-agent-page.tsx`:
the items under this page in the menu, the node's payment elements with links (`_components/node-payment-elements.tsx`, step 551-5)
and the same page in each element. 🪦 The core's own Stripe keys (target `core`, 530-1) are gone: the keys live in the Stripe element itself.

| Path | Role |
|---|---|
| `page.tsx` | thin entry |
| `_data/` | `slug`, `order`, words `en` + `ru` |
| `_components/index.ts` | empty — the working part is passed as `own` |
