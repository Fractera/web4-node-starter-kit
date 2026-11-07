# 671 — The templates carry the order chain to every element (the element side of 670)

**State: QUEUED — planned in detail after 670-7.** The core side is 670; this is what the ELEMENTS must get, through the custom and
native templates (skill `release-template`: a working clone in `~/fractera-dev/fractera-*-starter`, the template's prebuild, a tag, the
pin in the core, then the same files into every element of that kind with its next patch tag and pin; CI of every repository checked).
The owner, 2026-11-07, on ultracode: this is where parallel work pays off — 13 repositories, the same change.

## What the elements need — collected while building 670
1. **The element instruction** (`lib/instructions/element/element-instruction.src.md` in the core → `npm run instruction:element`):
   §5 «a capability nobody near you has» and the template's `.claude/modes/build.md` «Before you build a new capability» — the same
   order as the core's (670-5): ask the core (`need`), the core finds a neighbour by its skill or its AREA, a route inside the element
   whose area covers it, the Lagrix rung (simulated), the know-how ladder; an element never grows a foreign field inside itself.
2. **A worker that receives «Working process: skill <id> — …»** (670-2): the element's working session takes the named skill as its
   role for this job and answers with `npm run reply-core`; its «done» already wakes the main agent (670-2, `jobs.cjs`).
3. **The i2i client waits through a neighbour's cold start** (670-8, way 1): a refused connection to a neighbour asleep by the load rule
   is retried with backoff up to the cold-start limit; a neighbour off by its person fails fast. Proof: two calls 1 s apart to a
   sleeping neighbour both answer 200.
4. **The element's copy of the Lagrix search** (`scripts/f2f.mjs` of the custom template) on the one contract of 670-6 (`a2a` + `f2f`,
   `contractProblems`) — the same guard in the template's prebuild.
5. **The element's own claim of its area** (optional, after the owner's word): the passport's description of the field it is the home
   for, read by the core next to `areas.json` — only if the core's map proves too coarse in use.

## Not in it
The a2a endpoint and the escrow (plan 672); any core change.
