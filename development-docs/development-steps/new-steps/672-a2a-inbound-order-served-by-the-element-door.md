# 672 — An outside order (a2a) reaches the element, wakes it and is served by its door — the plan for when Lagrix is live

**State: A PLAN FOR THE FUTURE, nothing to build now.** Written in 670-6. The owner, 2026-11-07, verbatim: «a2a is not only on protocol ,
you must remember about i2i , and i2i we can use just now , but a2a it must discribed for feature , ok ?». It is taken up only by the
owner's word, after Lagrix's network is live; its first substep re-reads the Lagrix documents named here (they are drafts and change).

## Why it is a plan and not code
- The network does not exist yet: no super-node, no relay, no escrow on a chain; `npm run lagrix` is a simulation (548-9, 670-6).
- No element has an A2A endpoint: `a2aEndpoint` exists only in `lib/a2a/STANDARD.md`, `lib/a2a/passport.mjs` and the guard
  `scripts/check-passport.mjs`, which warns while `supportedInterfaces` is empty — the node never announces an interface that does not
  answer.

## The path of an outside order — by the primary source
Lagrix documents (github.com/lagrix-dev/lagrix, `docs/en/`): 17 discovery, 27 the life of a deal, 04 escrow, 03 encryption, 23 the price
of a first contact, 20 F2F.

1. **Announcement** (doc 17 §17.1): the element's agent card (`/.well-known/agent-card.json`, `lib/a2a/STANDARD.md`) is announced as a
   signed Nostr event with the tags `d`/`c` (the service), `price` (USDC range), `deal` (instant or deferred + its dispute window),
   `node_id`, `element`, `agent_card`, `e2ee_key`, `expiration`. Only an element whose passport says `visibility: network` and whose Web4
   switch is on (`npm run web4`) is announced; the node renews the announcement while the element works (§17.12).
2. **Search** (doc 17 §17.2, §17.8): the customer's agent pays $0.01 for a result list; the node's contract for this answer is
   `contractProblems` in `lib/web4-items/lagrix-simulated.mjs` (670-6) — the result line is the announcement above.
3. **Agreement** (doc 27 §27.2 step 3, doc 03): the two agents agree the work, the price and the deadlines over their encrypted
   channel. **This is the knock**: it reaches the element's `a2aEndpoint` (A2A v1.0 JSON-RPC `SendMessage`) through the node's own
   domain — the temporary address never carries orders (no stable link, no sign-in).
4. **Waking.** `proxy.ts` opens to the internet ONLY the `a2aEndpoint` path of an announced element, nothing else of the node (the
   law: the node's composition and ports are never given out). An element asleep by the load rule is woken by the gatekeeper on that
   first connection (663-4; measured in 670-1: 2.9 s cold start); a second connection in those seconds is refused today — 670-8 lets
   the caller wait inside the node; from outside, the endpoint answers at once with an A2A **Task** (`submitted` → `working`), so the
   cold start hides behind the task's states. An element turned off by its person is never woken: it is not announced either.
5. **Lock** (doc 27 step 4, doc 04): the customer locks the network part of the payment in escrow with `deliverBy` and
   `disputeWindow`; instant deals have minutes for both (doc 27 §27.4) — the wake's seconds are nothing against them.
6. **Work — who does it.** The order is served by the element's CODE: its door (a route of its card, `door:add`), with a model through
   the node's OpenAI key when the work needs one (skill `use-ai-generation`). **A Claude Code session never works for an outside
   customer:** skill `provider-rules` — the node's agents run on the owner's own subscription, and «other people's work on the owner's
   subscription» breaks the provider's terms; an Anthropic API key is never offered (the owner, 2026-11-04). The element's Claude agent
   BUILDS the capability (the owner's own work, i2i and building); the door SERVES the orders. A job the door cannot do is declined
   (`declineTask`, doc 27 step 5 — the whole network part returns to the customer), and the element tells its person through the main
   agent («an order for X came; we cannot do it yet — build it?»), never by itself.
7. **Delivery and acceptance** (doc 27 steps 6–7): the door records delivery (`commitResult`, the hash of the result) and sends the data
   (instant) or a delivery note (deferred); the customer accepts or cancels within the window; silence closes it for the provider.
8. **After** (doc 27 step 9, doc 17 §17.5): a receipt — the only source of reputation; reviews from both sides; the element saves an
   order summary without personal data outside git (`order:save`, skill `order-summary`); the main agent tells the person in one line
   where they read it (their element's bot slot `orders` already exists, `telegram-slots.cjs`).

## What exists today
The A2A card and its guard; the Fractera extension (`a2aEndpoint`, `a2aSkills`, `doors`, `visibility`); the gatekeeper; the Web4
switch; Telegram slots `orders` and `work` (they wake nobody yet); the outbound guard `lib/a2a/guard.mjs` (in elements); the Deals page
and the Lagrix rating card with «—»; the simulated search with its contract (670-6); the order summary skill.

## What is missing (the substeps of this step, when its time comes)
1. An `a2aEndpoint` in the custom template (`SendMessage`, `GetTask`, `ListTasks`, `CancelTask`) that maps a call to one of
   `a2aSkills` and its door, and answers with a Task — a template release, rolled out to every custom element.
2. `proxy.ts`: the endpoint path of announced elements open to the internet, everything else closed — with its guard.
3. The announcement (Nostr signing with the node's wallet, renewal while the element works) — the live adapter behind `lagrixSearch`
   and its contract guard unchanged.
4. The escrow calls (`lockFunds` by the customer; `commitResult`, `declineTask`, `claimTimeout` by the provider) through the node's
   wallet (`/api/node/wallet`); USDC only.
5. The bot slot `orders` tells the person about orders and deliveries — words only, through the main agent's channel rules.
6. A live test with a second node as the customer.

## Open questions — decided before its first substep
- Which work may an element sell at all: only doors that need no model, or doors with a model on the node's OpenAI key (whose cost the
  price must cover)?
- The first-contact fee (doc 23) and the price range of an element: who sets them — the person on the element's page, always.
- A deferred deal (doc 27 §27.5): the delivery note and the work of days — does the element's clock (its calendar) hold it?
