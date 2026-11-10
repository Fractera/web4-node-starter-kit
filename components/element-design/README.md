# `components/element-design/` — the element's «Build → Design» tab (node steps 711, 713, 715)

The owner 2026-11-09: design skills found by a live search (the person's own collection, the node's base in the graph, Fractera's
checked catalog — no list in code), added to the project, a few marked for a test, each with its own references, «Generate a trial
page» and «Pin». Tokens first, the page second: a trial page is the same page with its own copy of the design tokens; the pin makes that
copy the element's design.

715 (the owner 2026-11-10, his own scheme: «Шаг один: … библиотека навыков … Бриф … не обязательно … сгенерировать и сравнить»): three steps
«1 Skills · 2 Brief (optional) · 3 Generate and compare» under a sticky track whose states pop up as tooltips; the old trials and pin
steps and the «Build the element» button are gone — the core builds the element itself when its agent finishes a generation
(`lib/main-agent/element-design-build.ts`, called from `/api/agents/done`). The same path runs from Telegram: `npm run design`
(`scripts/design.mjs`, skill `design-and-settings-of-elements`).

| File | Role |
|---|---|
| `design-flow.client.tsx` | the tab: the track, «How design works here», the open step (kept in the address, `#compare`), the chosen card, the approval window |
| `flow.ts` | the counting: each step's state in words, the first step, the carousel's cards (a test page, or a saved skill without one) |
| `use-design-state.client.ts` | the one state of the door for the whole tab, `act`, the element's own address for the page links |
| `design-track.client.tsx` | the sticky step track; a step's state in a tooltip on hover |
| `step-parts.tsx` | a step's head (title and one line) and its foot (the step's action left, «Next» right) |
| `design-skills-step.client.tsx` | step 1: «Fractera keeps N design skills…», the saved list, the library |
| `design-saved.client.tsx` | «Skills you saved for testing in this project»: state badge, the eye to its page, GitHub, remove |
| `design-search.client.tsx` | the library through `GET /api/node/element-design?item=&q=` — rows, five per source, GitHub, «Save for testing» |
| `design-compare-step.client.tsx` | step 3: the carousel and the chosen card's stage |
| `design-carousel.client.tsx` | the carousel: a card per test page and per saved skill without one, red / amber / green badges |
| `design-stage.client.tsx` | the chosen card large (click → the whole page), the accordions, «Approve this design for the element» |
| `design-reference.client.tsx` | «Change the reference»: why, link, screenshot upload or paste into the node's storage, «Generate the test home page», the link line |
| `design-status.tsx` | the state badge |
| `types.ts` | the shapes the door returns, the shot and page addresses |

The brief (step 2) is `components/element-settings/brief-editor.client.tsx`; fine tuning `components/element-settings/design-fine.client.tsx`
(the template's editors `components/design/*` as they are) — it opens under the approved design.

The choice lives in the element's own space of the node's database (`lib/main-agent/element-design-store.ts`); the trial pages are
written by the element's agent in its own folder (custom template v0.3.179+, `npm run prototype`, `npm run design:pin`) and only read
by the core (`lib/main-agent/element-prototypes.ts`). No timers: «Refresh», a step change and every action reload the state. Build cost:
client islands on one architect page; caching: none (the door is `force-dynamic`, the page is the element's tree page).
