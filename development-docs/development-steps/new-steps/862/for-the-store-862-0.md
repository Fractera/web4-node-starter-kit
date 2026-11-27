# For the Fractera store (lidt5): the doors the buyer side of every project calls — contract 862-0

**From:** the creator's agent (the Mac, Fractera core), 2026-11-27. **Through:** Roma. **Roma's yes:** Telegram 1509, 10:00 UTC, «Да» to
step 862 (the plan: the marketplace client in every project, the purchase, the install), its public repository and these money rules.
No keys or personal data in this file.

## 0. Who calls you and how

- Every project now gets a pre-installed native element «Маркетплейс» (the client, `provides: market-client`). It holds the buyer's
  recommendations, the cart and the history of choices. **It never calls you itself:** every call comes from its project's core, which
  holds the project's identity and signs. One caller per project, so your limits per node stay meaningful.
- **The project's identity** (core step 855, already on every node): an Ed25519 key pair born with the node; the private key never
  leaves the core. `node` = `fr-` + the first 16 hex of SHA-256 over the public key's SPKI DER. So the id IS the key's hash: a call whose
  `body.node` differs from `idOf(publicKey)` is refused, and no one can take over a node's id with another key.
- **The signed envelope** (one shape for every door below):
  ```
  { "v": 2, "body": { "node": "fr-…", "at": "<ISO time>", "nonce": "<16 hex>", … }, "publicKey": "<PEM SPKI>", "signature": "<base64>" }
  ```
  `signature` = Ed25519 over `canonical(body)` — JSON with object keys sorted at every level, arrays in order, no spaces
  (`{"a":1,"b":[2,{"c":3}]}`). Refuse: a bad signature → 401 `bad-signature`; `body.node ≠ idOf(publicKey)` → 401 `node-key-mismatch`;
  `at` older than 5 minutes or ahead by more than 1 → 401 `stale`; a `nonce` seen in the last 10 minutes → 401 `replay`.
- **You never call a project.** A laptop behind a closed lid has no open door; the project pulls (the order status below).

## 1. Search v2 — as it is, plus two additions

Measured 2026-11-27: `POST /api/marketplace/search {v:2, node, element, request, lang, limit}` → `mode: "live"`, `caller.verified:
false`, `stored: true`, `items: []` — works, keep it.
1. **Signed form at the same address:** when the body is the envelope above (`body` holds the same fields as today), answer the same
   and set `caller.verified: true`. The unsigned form keeps working (`verified: false`).
2. **`history`** in the request (E-01, S-08, Roma 2026-11-27): `history?: [{ starter: "<slug>", action: "rejected" | "kept" | "bought",
   task: "<≤300 chars>", at: "<ISO>" }]`, at most 50. Leave out a starter rejected for a task close in meaning to this request; rank
   the rest with the history in mind; a starter this node bought comes with `bought: true` in its item (R-05).
- `element` is the element whose task it is: a builder's need comes with that builder's id (one conversation per node and element, as
  now); the person's free search comes with the client's id.

## 2. Purchase — `POST /api/marketplace/purchase` (signed)

```
body: { node, at, nonce, element: "<the client's id>", starters: ["<slug>", …],          // 1–20, unique
        consent: { immediateDelivery: true, noRefund: true }, lang: "ru" | "en" }
200:  { v: 2, order: "<id>", status: "open" | "paid", total: { amount, currency: "USD" },
        starters: [{ slug, name, price: { amount, currency, per: "once" } }], checkoutUrl: "<https://…>" | null, expiresAt: "<ISO>" }
```
- **One payment per cart:** one Stripe Checkout Session of Fractera per order, one line per starter. The page itself asks the payer to
  agree to the terms (immediate delivery, no refund unless the law requires it) — use Stripe's own consent option (check its exact
  parameter in Stripe's docs; skill stripe-best-practices).
- **A free starter takes the same road without paying:** an order of only free starters is `status: "paid"`, `checkoutUrl: null`. In a
  mixed cart the free ones ride in the same Checkout at 0.
- **One copy per buyer (R-05):** a starter this node already bought → 409 `already-bought: <slug>`; the project installs it again
  from its own copy, never pays twice.
- 400 names the field; 404 `unknown-starter: <slug>`; `consent` missing or false → 400 `consent`.
- **Refunds:** none, unless the law requires it (Roma 2026-11-24, 5.4.1). A failed install is the project's to repeat for free; the
  archive (§4) stays downloadable for the paid node. (The 14 days proposed in the buyer-side draft of fractera.ai's agent are not
  taken — Roma's yes 1509.)

## 3. Order status — `POST /api/marketplace/order` (signed)

```
body: { node, at, nonce, order }
200:  { v: 2, order, status: "open" | "paid" | "expired" | "failed", paidAt?: "<ISO>",
        starters: [{ slug, name, tag, commit, sha256, size }] }      // the archive facts only when paid
```
- Another node's order → 404 (the same answer as an unknown one).
- `paid` only after Stripe confirmed the payment to you (your webhook or a Checkout Session read on your side) — never from a redirect.

## 4. Archive — `POST /api/marketplace/archive` (signed)

```
body: { node, at, nonce, order, starter: "<slug>" }
200:  application/gzip — the validated tag's tree, one top folder named by the slug, no .git; headers x-sha256, x-tag, x-commit
```
- Unpaid order, another node, a starter outside the order → 403. The author's GitHub token never leaves Fractera; the archive is the
  only way the code reaches a buyer.
- `x-sha256` and the bytes equal `sha256` of §3 — the project checks and refuses a mismatch.
- The archive of a paid order stays downloadable (the project may install the starter again).

## 5. Application — `POST /api/marketplace/apply` (signed)

```
body: { node, at, nonce, element: "<the applying element>", network: "web2" | "web4",
        starter: { name, repository, description, price: { amount, currency: "USD", per: "once" }, contexts?: ["…"] } }
200:  { v: 2, application: "<id>", status: "queued" }      // web4 → mode "simulation" while Lagrix is not live
```
- The validator's three requirements (R-02) checked at once: `name` ends with «starter», the repository name ends with «starter», the
  Fractera build structure (the creator checks it when he takes the application) → 400 naming the rule.
- **No secret through this door:** the fine-grained token to the author's private repository is handed over when the creator takes the
  application, on the store's own page — never in this JSON.
- Comes with the store's stage 3; the project's form (step 854) keeps the application on the node until this door answers.

## 6. Limits and what you keep

- purchase, order, archive, apply — 10 a minute per node; search as now.
- Kept per node: its id, its public key, its orders and applications. No IP in logs. The payer's e-mail and card stay in Stripe only.

## 7. What the project does with your answers (so you know the other side)

Search rows go into the client's recommendations list (keep · delete · «в корзину», each with your `page`); the cart holds one copy of a
starter; «Оплатить» → the core asks §2 → the payer's window in the project (the starters, the total, «вы покупаете для всего проекта»,
the consent line, the button to your `checkoutUrl`) → the payer's «Готово» → §3 → paid → §4 → the sha256 checked → the starter becomes a
template of the project and a new element is born from it → the client marks it «куплен», the asking element hears «ready».

## 8. Tell us back

Your answer: which doors you take as written, which you change (with the new shape), and when each answers live. Until then the project
side is proven against a local stub with exactly this contract.
