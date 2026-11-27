# Task for the creator agent (Mac): the buyer side of the Fractera store — a new PRE-INSTALLED native element «marketplace-client» in every project (draft v2, 2026-11-27)

From the main agent of fractera.ai (core 2bea6c5c). Layer A (the store itself) lives in the marketplace element (lidt5,
f2f-marketplace.fractera.ai). Layer B is the buyer side. Roma discusses it with the core's main agent (Roma, 2026-11-24 11:05 UTC;
lidt5's quiz N-01). **Status: a draft for Roma's yes — one decision is his (§9).** No keys or personal data.

## 0. Roma's decision of 2026-11-27 09:33–09:37 UTC changes the shape (lidt5 quiz 9.7.1, verbatim in its decisions; need need-20261127-ed8dcd)

There will be **two elements**. lidt5 is the single Fractera store. A new **native element «marketplace-client»** (working name) comes
**with the build into every project** and returns at a reinstall. It holds the buyer side: the recommendations list, the cart with
one copy of a starter, free search in **its own bot**, the asks of builder agents, the favourites from the Fractera site, and the
history of choices. It asks the Fractera store (lidt5 search v2) and Lagrix. **The payer's window and the install stay the core's.**
Branch 9 and the module «buyer-side» of lidt5's quiz are its starting description. The tree below keeps its numbers. Read «the core»
in nodes 1–4 and 7 as «the client element» (its own data space, its own bot, its own doors, `X-Element-Key`). Nodes 5.1–5.2 (the
payer's window, the signed confirmation) and 6 (install by tag) stay in the core. The client asks the core for them through a door.
Why a pre-installed native and not `npm run create -- --native` on one node: Roma wants it in every project by default. That is the
core's composition and the native template's — Fractera's release, the creator's work.

## Roma's decisions this builds on (verbatim in lidt5's quiz.json decisions)

- 2026-11-24 15:58 UTC: purchase only from one's own node (R-03). Favourites are kept on the Fractera site under the person's account,
  and the node asks the store for them first when it searches (S-02).
- 2026-11-27 01:22 UTC: payment only by card through Stripe for now; USDC through Lagrix not now (N-03).
- 2026-11-27 08:32 UTC, through lidt5 (need need-20261127-918dde): **two kinds of recommendations**. (1) Background: a builder agent,
  while it works, finds starters that fit its task. (2) The person's free search in the Telegram bot. Both land in one
  **recommendations list**: keep, delete, «to the cart», each with the link to the starter's page. A **cart** holds one copy of a
  starter. **Payment** is by card through Stripe. **Install** comes after payment.

## What the store (layer A) already gives the core

- Search v2 (E-01): `POST https://f2f-marketplace.fractera.ai/api/marketplace/search`, `v: 2`, the node and element ids, one
  conversation per pair, ranked by meaning, usefulness and price weighed equally, favourites first (S-02), live today (empty catalogue).
- Promised by lidt5: one sale of a starter per buyer, and an install manifest per starter (its tree 6.3.1).
- The core already calls it: `npm run market` → `===MARKET_LIVE===` (841-2, v1). The node identity (855) exists for signed calls.

## The tree (level 1 → level 2), with the main agent's recommendation in each node

1. **Background recommendations.** 1.1 When an element raises `need` (822) and its brothers lack it, the ladder asks the store with v2
   (the node and the element ids, signed by 855) — never a model call in the core. 1.2 The answer goes into the recommendations list with
   «from: <element>, for: <its words>». 1.3 The element hears «recommended, waits the person», never «bought».
2. **Free search in the bot.** 2.1 The person writes to the main bot «найди в магазине …» (a hard command recognised by purpose). 2.2
   The answer comes as cards (name, what it does, price, usefulness for this context, the starter's page link) and the same rows go into
   the list. 2.3 Nothing is bought from a chat line.
3. **The recommendations list** (one per node, the core's data layer). 3.1 Each row has keep / delete / «в корзину», the starter's page
   link, where it came from, and when. 3.2 It is shown in the panel («Запросы» → «Рекомендации») and as a section of the main bot's Pult
   (848: navigation and short statistics, no copy of the page). 3.3 It is synced with the favourites on the Fractera site when the node
   is linked to the person's account (S-02).
4. **The cart.** 4.1 One copy per starter: a starter already bought by this node shows «уже куплен», never twice (lidt5's one sale per
   buyer). 4.2 The cart lives in the core's data layer. Its total is shown in the store's currency.
5. **Payment — Stripe only.** 5.1 The payer's act is a window (`npm run ask-person`): the elements, the price, «вы покупаете для всего
   узла». Its button opens Fractera's Stripe Checkout Session; the node holds no Stripe key for this. The node's own Stripe element
   receives the node's own sales only. 5.2 Fractera confirms the payment to the node through a signed call (855 both ways), never a
   redirect the browser could fake. 5.3 The 50/50 split and payouts are layer A's (stage 4).
6. **Install after payment.** 6.1 By the starter's tag from its install manifest (6.3.1), as an element of the node: registry entry,
   birth checks, its card. 6.2 It serves every brother with no priority (822). 6.3 The asking element hears «ready — element <x>, its
   doors» and agrees an API once by i2i.
7. **Purchase history.** 7.1 Stored in the core's data layer: what, when, version, author, price, the receipt link. 7.2 Shown in the
   panel and the Pult. 7.3 It feeds 4.1.
8. **Trust and quotas.** 8.1 Every call to the store is signed with the node's identity (855). 8.2 The store counts its limits per
   node. 8.3 No personal data goes to the store beyond what the payment needs.
9. **Refunds — Roma's decision (money).** The main agent's recommendation: a refund within 14 days when the starter did not install.
   Fractera decides each case. The money comes back from the author's and Fractera's shares equally (50/50).

## Proof (when built)

- A builder element's `need` → a row in the list with its source; the bot's free search → cards plus rows.
- «В корзину» twice for one starter → one row; a bought starter → «уже куплен».
- The payer's window → Stripe test Checkout → the signed confirmation → install by tag → the asking element hears «ready».
- The history shows the purchase. A bogus confirmation (unsigned or from another node) → refused, nothing installed.

—
No keys or personal data in this file.
