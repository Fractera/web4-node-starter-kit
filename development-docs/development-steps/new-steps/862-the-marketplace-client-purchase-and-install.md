# 862 — the marketplace in every project: the client element, the purchase, the install

State: PLANNED 2026-11-27 ~10:05 UTC; waits Roma's yes. No code before it.

## Roma's words

- Telegram 1496 (2026-11-27 ~09:40 UTC): «Вся концентрация дальнейшей работы только на реализации маркетплейса».
- 09:33–09:37 UTC through lidt5 (verbatim in lidt5's quiz decisions; intake `pre-steps/2026-11-27-marketplace-client.md`): «Да согласен
  разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это точно» · «каждый нативный элемент стартер
  имеет встроенный функционал который позволяет превращает существующий шаблон в заявку для MarketPlace f2f, а каждый поставляемый в
  комплекте MarketPlace клиент имеет возможность извлекать элементы из MarketPlace и хранить историю …».
- 2026-11-24 (step 854): the offer section belongs to an own NATIVE element, not to a custom one («по ошибке это реализовано в кастомном
  шаблоне»).
- Sources: lidt5's quiz tree (Telegram 1499, `pre-steps/2026-11-27-marketplace-quiz-tree.txt`), its full PDF (1501, kept in the core's
  Telegram inbox outside git: R-01…R-05, S-01…S-08, E-01, stages 0–5, the decisions), the fractera.ai main agent's draft of the buyer
  side (1506, `pre-steps/2026-11-27-marketplace-layer-b-draft.md`).

## The goal, beyond the words

A person or a builder agent in any Fractera project finds a starter, buys it once by card from its own project and gets it installed as
a new element — from the phone. The author earns half of every sale. It is Fractera's first income line and the road on which a user
becomes an author (shape-the-need §3).

## Two elements and the core (Roma's decision; nothing re-opened)

- **The store** — lidt5 on fractera.ai, one for everybody: catalogue, search v2, storefront, applications, research, checkout, payouts.
  Roma leads it there; this Mac does not touch fractera.ai.
- **The client** — a new PRE-INSTALLED native element in every project: recommendations, the cart, the history of choices, search in
  its own bot, the asks of builder agents. Born on this Mac by the creator, released as Fractera's repository, entered in Fractera's
  registry, so every fresh install and every node update brings it and a reinstall brings it back, like sign-in, data and config.
- **The core** keeps what belongs to the node: the payer's window, the signed talk with the store (the node's Ed25519 identity of step
  855; the private key never leaves the core) and the install after payment. The core finds the client by its `provides`
  (`market-client`), never by its id (CLAUDE.md §3).
- **lidt5's type** (intake check 3): it stays native. It is an element born on fractera.ai, and born elements never enter Fractera's
  registry. Measured 2026-11-27 from raw.githubusercontent.com: Fractera main's registry has auth, data, storage, vectors, embeddings,
  config, graph, cache, memory, stripe and root, so lidt5 is never installed into new projects. Nothing to change.

## Substeps — one at a time, each closed by its proofs

### 862-0 The contract for the store (a file for Roma to pass to fractera.ai, so both sides build at once)

- Search v2 is live: without a node it answers `{"v":2,"error":"node: the caller's node identifier is required"}` (measured
  2026-11-27). The client sends `{ v: 2, node, element, query, lang, budget?, limit?, history: [{ starter, action:
  rejected|kept|bought, task }] }` (E-01, S-08).
- Purchase: `POST /api/marketplace/purchase`, signed by the node (Ed25519 over canonical JSON, the public key in the envelope; the store
  binds the order to that key on first use) `{ node, starters: [id], consent: true }` → `{ order, checkoutUrl, total, currency }`. One
  Stripe Checkout of Fractera per cart. A free starter → `{ order, paid: true }`, no Checkout.
- Order status: `POST /api/marketplace/order`, signed `{ order }` → `{ paid, starters: [{ id, tag, commit, sha256 }] }`.
- Archive: `POST /api/marketplace/archive`, signed `{ order, starter }` → the validated version as `tar.gz`. The author's token never
  leaves Fractera. Another key or an unpaid order → 403.
- Application: `POST /api/marketplace/apply`, signed `{ passport fields, repo, web2|web4, form }` → `{ application, status: "queued" }`.
- The store keeps per node only its id, its public key and its orders — nothing personal.

### 862-1 The client element is born and enters the build set

- Repository `Fractera/fractera-market-client-starter` (Roma creates it empty in a window, as with embeddings in 626-2; the name ends
  with «starter»). Born from the native template v0.1.86 in the workshop. Registry entry `market`: kind core, required, port 24697 (the
  installer moves it where the port is taken), provides `market-client`. Name in the menu: «Маркетплейс».
- Memory: about 115–150 MB awake (measured 2026-11-27: native cck60 113 MB, others 133–149 MB). It may sleep and wake on a call.
- Its data, in its own space of the data element (its `X-Element-Key`): recommendations (task, the asking element, starter, kind here or
  outside, page link, price, usefulness, why it fits, status kept|deleted|cart, time), the cart (one row per starter), the history of
  choices (rejected, kept or bought per task).
- Its doors (`door:add`, `X-Node-Key`): `POST /api/recommend { element, task, lang }` → the store's v2 with the history of that task
  (plus Lagrix, simulated today and marked) → rows and cards; `GET /api/recommendations`; `POST /api/choice { row, keep|delete|cart }`;
  `GET|POST /api/cart` (remove, clear); `GET /api/history`.
- Its pages (architect only): «Рекомендации» — grouped by task, each row opens the starter's page, buttons keep, delete, «В корзину»;
  «Корзина» — one copy each, remove, clear, the total, «Оплатить» (the core's purchase door); «Покупки» — what was bought, its
  version, «Установить ещё раз».
- Its bot, once the person makes one: free search in words through the same door.

### 862-2 The core's side of the search

The capability ladder's Fractera rung (`handle-need`, `npm run market`) and the person's «найди в маркетплейсе …» to the main bot go
through the client's recommend door. The asking element hears «рекомендовано, ждёт решения человека» with the links, never «куплено».

### 862-3 The purchase

«Оплатить» → the core's door (`X-Node-Key`, the client only) → the store's purchase, signed → the payer's window (`npm run ask-person
--href <Checkout>`): the starters, the total, «вы покупаете для всего проекта», «стартер передаётся сразу; возврата нет, кроме случаев,
когда этого требует закон» → «Готово» → the core asks the order status, signed. It pulls rather than waits for a push: a node behind a
closed laptop lid needs no open door. Paid → 862-4. Not paid → the window says so, the cart stays, nothing is installed.

### 862-4 The install

The archive, signed → its sha256 equals the store's validation record → unpacked into the node's starters (a template of the node) → an
element born from it (`npm run create -- --starter <id>`: registry, port, subdomain, install, its card) → the client marks it «куплен»;
the asking element hears «готово — <element>, его двери». «Установить ещё раз» births one more element from the kept starter without a
second payment (R-05).

### 862-5 The application from a starter

The page «Предложить в маркетплейсе» of an own native element (854; today the application stays on the node, `sent: false`) sends it to
the store's apply door, signed. The native template gets `npm run market:offer` for its agent (2.2.4). Custom elements do not get it
(Roma's 854 word). This waits for the store's apply door (its stage 3).

## Builds and releases

- 862-1 needs no core build: the element's own workshop prebuild, its release (Roma's run in a window) and the registry pin.
- 862-2 … 862-4: one core build after all three, asked first; it also carries the Mac's owed be44457b..6f61153b.
- 862-5: a native template release (Roma's run).

## Test checklist (shown before the code, marked after)

- T1 Fresh install: the core's installer in a working clone clones, installs and starts `market`; it answers; its prebuild is green.
- T2 Existing node: `node:update` brings it; a taken port is moved.
- T3 Recommend twice for one task: the second request carries the history; «В корзину» twice → one row; no node key → 401.
- T4 A `need` of fc4vk «картинки для соцсетей» → a row «от: fc4vk, для: …»; the main bot's search → cards and rows; the client off →
  the rung says so.
- T5 Purchase against a local stub of the store with this exact contract: the window with the total and the link → «Готово» → paid →
  install. Negatives: an unsigned «paid» or one signed by another key → refused, nothing installed; an archive with a wrong sha256 →
  refused and deleted.
- T6 Live with lidt5's doors and one test starter that Roma puts into the catalogue by hand (Stripe in test mode on fractera.ai, Roma's
  hand on the Stripe page): the element appears in the project; Roma's screenshots.
- T7 lidt5 is not in Fractera's registry — ✓ measured 2026-11-27.

## What this plan needs from Roma (money and publication are his)

1. Yes to the plan.
2. The repository `Fractera/fractera-market-client-starter` — a publication on Fractera's GitHub, his window.
3. Money, lidt5's open points, my picks: a free starter skips the payment and takes the same road; one payment per cart; the window's
   consent line plus Stripe's own terms checkbox; refunds — his rule stays (none unless the law requires it), and a failed install is
   installed again for free. The fractera.ai agent's proposal of 14 days is not taken.

## Skills seen (skills_find, 2026-11-27)

stripe-best-practices (stripe/ai, ~100.8k installs) covers Checkout Sessions and Connect marketplaces, for the store's checkout and the
50/50 split. The samber/developer-platform-skills trio (9★, ~10k installs each: monetization model, review, listing standards) covers
merchant of record, re-review on updates and listing rules. All of them serve the store (lidt5), not the client. Ideas taken in my own
words; nothing installed.

## Not in this step

The storefront and favourites (the store's stage 1; 8.3.4 «the node linked to the account» comes with the store's link door), USDC
through Lagrix (N-03), payouts to authors (5.3.3), purchases in a cabinet (7.1.6), updates of a bought starter (the store's stage 5).
