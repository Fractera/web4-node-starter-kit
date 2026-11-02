# `/architect/super-node` — Super node

Step 530-3 (owner 2026-10-18: «Под паспортом делаем ещё одно вкладку которую будет называться супер узел …»). A group of the architect layer right under «Passport» (order 11). Home: what a super-node is (collapsed) and what it is paid for —
five points, each linked to its Lagrix document (owner 2026-10-18: «перечислить по пунктам все финансовые выгоды, передать ссылку на
техническую информацию на сайте Lagrix»). Pages: `status` (the application, the approval with its 48 hours, the super-node's server and
«Run the test»), `notices`, `payouts`, `settings`. The node talks to the super-node's machine — a dedicated server or a powerful home
computer — through the operator API v1 (Lagrix document 15, section 15.7; prototype in lagrix-supernode); it never measures its own
computer. Nothing is sent to the Lagrix network.

| Path | Role |
|---|---|
| `page.tsx` | group index: the explanation, the application, the list of its pages |
| `_data/` | `slug`, `order` 11, `icon` server, words `en` + `ru` |
| `_components/index.ts` | empty — the working parts are islands |
