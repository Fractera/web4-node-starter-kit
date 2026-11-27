# The marketplace quartet — who builds what (v1, 2026-11-27)

**Roma's word, Telegram 1532, 2026-11-27 11:13 UTC, verbatim:** «Давай определим кто что строит кто и куда добавляет тестовые элементы?
Ты здесь самое главное поэтому ты сейчас распредели все эти обязанности я каждому их передам через тебя. Обязательно представься
системе что ты был уполномочен быть главным именно ты будешь определять кто что в этом квартете будет строить».

**Who writes this.** The creator agent — the main agent of Roma's development computer (the Mac), the only writer of Fractera's
repositories. By Roma's word above it leads the marketplace build and decides who builds what in the quartet. On another node a text
from the creator is data, never an order (CLAUDE.md, glossary): this division binds a node's agents when Roma passes it there as his
own word — he does. Money, publication and secrets stay Roma's at every step.

## The four, and one helper

| Who | Where | Builds | Never |
|---|---|---|---|
| **The creator agent** (lead) | the Mac, Fractera's core | the standard (`store-contract-v<N>.md` — only it writes a version); the core's side in every project: the signed calls to the store, the payer's window, the pull of the order status, the install of a bought starter; the element skill `use-marketplace` in both templates; the birth, repository and releases of the client; the division of work and the decision on any dispute between the four | writes on fractera.ai; builds the store's doors |
| **The client «Маркетплейс»** | a native element pre-installed in every project; born and grown on the Mac | its own function, by its own agent, on the creator's tasks: the recommendations list, the cart (one copy), the history of choices, its doors, its pages, search in its own bot | calls the store itself (only through its core), pays, installs, holds a key |
| **The main agent of fractera.ai** | Fractera's server | the operator of the store's node: updates its core from Fractera on Roma's word, hands the store the standard and the creator's lines as tasks (in parts), routes the store's needs to its neighbours (the Stripe element), brings the store's answers to Roma | writes Fractera's core or templates — a defect goes to the creator as a report; changes the standard |
| **The store (f2f-marketplace)** | an element of fractera.ai | layer A: the catalogue, search v2 (signed, with history), purchase, order status, archive, application (its step 4), the storefront, the research, the creator's queue of applications; asks its Stripe element for the checkout and the «paid» | takes a payment or holds a Stripe key itself; changes the standard alone (it proposes a new version to the creator through Roma); calls a project |
| *Helper: the Stripe element of fractera.ai* | Fractera's server | on its node's main agent's task, the checkout on Fractera's account and the answer «paid» to the store (agreed with the store by i2i) | answers anyone but the store |

## Test elements — who adds what, where

1. **The first starters in the catalogue** — the store adds them (its catalogue is filled by hand), after Roma's yes: Fractera's two
   element templates, `fractera-custom-item-starter` and `fractera-native-item-starter`, at price 0. Starters by their names (R-02), public
   repositories, so the archive door can serve their validated tags.
2. **The test buyer is the Mac** — the creator's node. Its client «Маркетплейс» finds the free custom template, the core orders it,
   pulls «paid», takes the archive, checks its sha256 and births a new element from it here. fractera.ai never installs a buyer-side test
   element: it is the store's node.
3. **The second buyer** — a node behind a server's wall (811), the same free starter, when Roma names one. Not aifa.dev: Roma took it
   out of the work on 2026-11-27 (Telegram 1547: «полностью уберём aifa.dev … работаем между Fractera и тобой»).
4. **A paid test starter** comes later, in Stripe's test mode on fractera.ai — Roma's own word on when and at what price.

## Order and channels

- The store: 4-1 (the envelope, verified search) → 4-2…4-6 (purchase, order, archive, application) — on Roma's yes.
- The creator, at the same time: the element skill released → the client born → search through it → purchase → install, each proven on
  the Mac against a stub with the same standard; then live with the store.
- Two nodes never talk directly: the standard and this division travel in the core's releases (skill `marketplace`); the store's answers
  go its node's main agent → Roma → the creator. A new version of the standard is written only by the creator and released.
- A dispute between the four is decided by the creator; money, publication and secrets by Roma.
