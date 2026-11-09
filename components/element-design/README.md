# `components/element-design/` — the element's «Build → Design» tab (node step 711)

The owner 2026-11-09: design skills found by a live search (the person's own collection, the node's base in the graph, Fractera's
checked catalog — no list in code), added to the project, a few marked for a test, each with its own references, «Generate a test
page» and «Pin». Tokens first, the page second: a prototype is the same page with its own copy of the design tokens; the pin makes that
copy the element's design.

| File | Role |
|---|---|
| `element-design-panel.client.tsx` | the tab: the word to the architect (how design works, the gain, «found a skill — tell your bot»), state, actions |
| `design-search.client.tsx` | the live search through `GET /api/node/element-design?item=&q=` (`lib/main-agent/design-skills.mjs`) |
| `design-candidates.client.tsx` | the project's skills and the «To the test» switch |
| `design-test-card.client.tsx` | one test candidate: references (link or image in the node's storage), «Generate», the price before the press |
| `design-prototype-row.client.tsx` | one prototype: status, screenshots, the link into the element's protected `/prototypes`, «Pin» |
| `types.ts` | the shapes the door returns |

The choice lives in the element's own space of the node's database (`lib/main-agent/element-design-store.ts`); the prototypes are
written by the element's agent in its own folder (custom template v0.3.179+, `npm run prototype`, `npm run design:pin`) and only read
by the core (`lib/main-agent/element-prototypes.ts`). No timers: «Refresh» and every action reload the state. Build cost: client
islands on one architect page; caching: none (the door is `force-dynamic`, the page is the element's tree page).
