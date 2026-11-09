# `components/element-design/` — the element's «Build → Design» tab (node steps 711, 713)

The owner 2026-11-09: design skills found by a live search (the person's own collection, the node's base in the graph, Fractera's
checked catalog — no list in code), added to the project, a few marked for a test, each with its own references, «Generate a trial
page» and «Pin». Tokens first, the page second: a trial page is the same page with its own copy of the design tokens; the pin makes that
copy the element's design.

713 (the owner: «не спагетти дизайн … проходит от начала и до конца»): the tab is ONE path — a step track «1 Brief · 2 Skills · 3 Trials ·
4 Pin» and «Fine tuning» on demand, each step's state in words, one step open, «Next» at the end of each. No frames inside the workspace:
the steps lie on the page, lists are one bordered list with lines between rows, depth by borders only.

| File | Role |
|---|---|
| `design-flow.client.tsx` | the tab: the track, «How design works here» folded into one line, the open step (kept in the address, `#skills`), the pin's warning window |
| `flow.ts` | the counting: what is done on each step, its line in words, which step opens first |
| `use-design-state.client.ts` | the one state of the 711 door for the whole tab, `act`, the element's own address for the trial links |
| `design-track.client.tsx` | the step track (underline marks the current step — the layer's tab standard) |
| `step-parts.tsx` | the step's head (title and one line) and its foot (the step's action left, «Next» right) |
| `design-skills-step.client.tsx` | step 2: «In the project» on top, the search below |
| `design-candidates.client.tsx` | the project's skills as rows with «To the test» and remove |
| `design-search.client.tsx` | the live search through `GET /api/node/element-design?item=&q=` (`lib/main-agent/design-skills.mjs`) — rows, five per source and «Show more»; the empty own collection says how to fill it |
| `design-trials-step.client.tsx` | step 3: every skill in the test, «Refresh» |
| `design-test-card.client.tsx` | one skill in the test: «Generate» with the price before the press, its trial pages, its references (link or image in the node's storage) |
| `design-prototype-row.client.tsx` | one trial page in step 3: thumbnail, status in words, «Open», «Build the element» |
| `design-pin-step.client.tsx` | step 4: the ready trial pages large, side by side; «Pin»; after it — the way to fine tuning |
| `design-prototype-figure.client.tsx` | one trial page large: the computer shot with the phone shot over its corner |
| `design-prototype-actions.client.tsx` | «Open» and «Build the element», the shot and link addresses |
| `types.ts` | the shapes the door returns |

Steps 1 and 5 are the remote control's files: the brief `components/element-settings/brief-editor.client.tsx`, fine tuning
`components/element-settings/design-fine.client.tsx` (the template's editors `components/design/*` as they are).

The choice lives in the element's own space of the node's database (`lib/main-agent/element-design-store.ts`); the trial pages are
written by the element's agent in its own folder (custom template v0.3.179+, `npm run prototype`, `npm run design:pin`) and only read
by the core (`lib/main-agent/element-prototypes.ts`). No timers: «Refresh», a step change and every action reload the state. Build cost:
client islands on one architect page; caching: none (the door is `force-dynamic`, the page is the element's tree page).
