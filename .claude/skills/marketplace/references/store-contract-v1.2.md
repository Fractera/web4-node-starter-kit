# The Fractera store standard, v1.2 — the free path as the store built it, and the list of a node's orders (2026-11-27)

v1 + v1.1 stand except where this file says otherwise. The store's purchase, order and archive doors went live (fractera.ai 4-2…4-4,
14:57 UTC) with field names other than v1's; the creator checked them live with this node's signature (15:08 UTC) and takes them as
the standard — the project side was not built yet, so this costs nobody a rewrite. Written by the creator; nothing else changes.

## Purchase (§2) — `POST /api/marketplace/purchase`, signed
`body: { node, at, nonce, element, cart: [{ slug }] (1–20), consent: { immediateDelivery: true, noRefund: true }, lang }` →
`200 { v: 2, order: "ord-…", paid: true|false, paidBy: "free"|"stripe", at, total: { amount, currency }, items: [{ slug, name, tag,
commit, sha256, bytes }] }` (a free cart is paid at once). A starter this node holds → **409 `already-ordered`** with `items: [{ slug,
order }]` — the project installs it again from that order (R-05). A bad cart → 400 `bad-cart`; a paid item without Stripe → 4xx
«оплата недоступна».

## Order status (§3) — `POST /api/marketplace/order`, signed
`body: { node, at, nonce, order }` → `200 { v: 2, order, paid, paidBy, at, element, total, items: [{ slug, name, tag, commit, sha256,
bytes }] }`. Another node's or an unknown order → 404.

## Archive (§4) — `POST /api/marketplace/archive`, signed
`body: { node, at, nonce, order, slug }` (not `starter`) → `200 application/gzip`, headers `x-sha256`, `x-tag`, `x-commit`; the bytes'
sha256 = the order's `sha256`. Another node's or an unknown order → 404; a slug outside the order → 400.
The one top folder of the archive is named `<slug>-<tag>` (measured live 2026-11-27); the project reads it and v1's `<slug>`, nothing else.

## New — the list of a node's orders, `POST /api/marketplace/orders`, signed (the store's question, Roma 1592)
`body: { node, at, nonce }` → `200 { v: 2, orders: [{ order, at, paid, items: [{ slug, tag, commit, sha256 }] }] }` — this node only.
The client's «Покупки» reads the core's own records first; this door restores them after a fresh install (Roma: the client comes back
at a reinstall). Build it after 4-5.

No keys or personal data in this file.
