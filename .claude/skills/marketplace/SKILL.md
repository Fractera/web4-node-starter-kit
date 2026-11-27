---
name: marketplace
description: "Both natures. The Fractera marketplace as one map of three sides: the store on fractera.ai (one for everybody), the client element «Маркетплейс» pre-installed in every project, and the core (the payer's window, the node-signed talk with the store, the install of a bought starter). Load it when a need no element here covers may be met by a starter; when the person or an element says «найди стартер», «купить», «продать» or «предложить свой элемент», «как работает маркетплейс»; asks a starter's price, a refund or the install of a bought one; and on the node that holds the store, when its store element must learn the standard it serves."
---

# The Fractera marketplace — one map of three sides

**Process: both.** Searching and explaining is work; a purchase, an install or an application changes the node (build) and waits the
person's yes. Built under core step 862; what works today is in §8 — never promise more than it says.

Roma, 2026-11-27: «Вся концентрация дальнейшей работы только на реализации маркетплейса» (Telegram 1496) · «два элемента — магазин
Fractera … и нативный клиент маркетплейса в каждом проекте» (his decisions 09:33–09:37 through the store) · «навык который пишет
трехстороннее взаимодействия маркетплейса … должен существовать как внутри узла так и внутри каждого стартового нативного и кастомного
элемента» (1514) · «опубликовать его с стандартными API … а у Fractera просто обновить ядро» (1516).

## 1. The three sides

| Side | Where | Holds | Never |
|---|---|---|---|
| **The store** | one native element on fractera.ai (`f2f-marketplace.fractera.ai`) | the catalogue of starters, search v2, the storefront, applications and their research, the checkout (Fractera's Stripe), the 50/50 split | sells a ready solution; calls a project; holds a buyer's card |
| **The client «Маркетплейс»** | a native element pre-installed in every project, `provides: market-client` | the recommendations list (keep · delete · «в корзину»), the cart (one copy of a starter), the history of choices, search in its own bot | calls the store itself, pays, installs, holds a key |
| **The core** | every node | the node's identity (Ed25519, step 855) and every signed call to the store, the payer's window, the pull of the order status, the install | takes a card; installs before the store says «paid» and the sha256 matches |

The core finds the client by its `provides`, never by its id (CLAUDE.md §3). On a server every element is walled (811); a bought starter
is one more walled element, never a privileged one.

## 2. What is sold

- **Starters only** (R-01): the minimum sufficient function for further development, told plainly. A ready solution is never sold or
  discussed — not in Fractera, not in Lagrix.
- **The validator** (R-02): the name and the repository name end with «starter»; the Fractera build structure on Claude Code with a
  subscription.
- **One copy per buyer** (R-05): a bought starter is «куплен» and installs again for free, never sold twice.
- Every starter is researched before publication and at every update, at the author's expense, on the strongest model through an API;
  the report is open before purchase, and Fractera's guarantee reaches no further than it.
- An empty answer is the honest «nothing yet» — never a look-alike in its place.

## 3. The roads

1. **A builder meets a task nobody here does.** The element raises `need` (skill `handle-need`). Its brothers lack it → the core asks the
   client → the client's search goes through the core, signed, to the store's v2 with the history of choices for that task (and to Lagrix
   — simulated, marked) → rows land in the list «от: <element>, для: <its words>» → the element hears «рекомендовано, ждёт решения
   человека», with the links — never «куплено».
2. **The person asks** — «найди в маркетплейсе …» to the main bot, or in the client's own bot: the same search; cards with the name, what
   it does, the price, the usefulness for this context and the link to the starter's page; the same rows go into the list. Nothing is
   bought from a chat line.
3. **The person buys.** The cart → «Оплатить» → the core asks the store for an order, signed → the payer's window (`npm run ask-person
   --href <checkout>`): the starters, the total, «вы покупаете для всего проекта», «стартер передаётся сразу; возврата нет, кроме
   случаев, когда этого требует закон» → their «Готово» → the core pulls the order status, signed → paid → the archive of the validated
   version, signed → its sha256 equals the store's record → it becomes a template of the project, a new element is born from it → the
   client marks it «куплен», the asking element hears «готово — <element>, его двери».
4. **An author offers a starter.** An own native element: «Предложить в маркетплейсе» (Build → f2f, step 854) or its `npm run
   market:offer` → Web2 (Fractera) or Web4 (Lagrix, simulated) → the application, signed, to the store's queue → the creator checks it
   personally → the research → published with the author mark. A custom element does not offer itself (Roma, 854). The token to the
   author's private repository is given on the store's own page, never through a door.

## 4. Money — Roma's rules

One-time price set by the author, no subscription; free starters exist and take the same road without paying; one payment per cart;
card through Fractera's Stripe only for now (USDC through Lagrix — not now); shares 50/50; no refund unless the law requires it — a
failed install is repeated for free; the payer agrees to immediate delivery on the window and on the checkout page. Paying is always the
person's own act in a window. Whoever pays buys for the whole project (the law of 822).

## 5. The standard

`references/store-contract-v1.md` — the signed envelope, search v2 (signed form and `history`), purchase, order status, archive,
application, the limits. Every call to the store is made by the core and signed with the node's identity; the store never calls a
project — the project pulls.

## 6. Four lenses of this map

1. **The core** — this skill (the main agent).
2. **Every element, native and custom** — the element skill `use-marketplace`, one text written from the core into both templates (step
   862-6): as a buyer — `need`, never buy, install or call the store; as an author — the offer road of §3.4 (own native only).
3. **The client** — its own skill in its repository: its doors, data, pages and bot.
4. **The store** — this map and the standard, from its side.

## 7. On the node that holds the store (fractera.ai)

The store element cannot read the core's skills. When the person asks (one word is enough — «передай магазину стандарт»), hand it the
standard with a build task: `npm run task -- <the store's id> "Build process: the store standard v1 of the core's skill marketplace —
build the doors it names and answer which you take as written: <the text of references/store-contract-v1.md>"`, then bring its answer
to the person. Never on your own initiative.

## 8. What works today (rewrite this section with every substep of 862)

- 2026-11-27: the store's search v2 answers live, unsigned (`caller.verified: false`), the catalogue empty — measured from the creator's
  node. Search v1 and `npm run market` answer as before.
- Not built yet, say so plainly: the client element (862-1), search through it (862-2), purchase (862-3), install (862-4), applications
  sent to the store (862-5; the form keeps them on the node). The store's purchase, order, archive and apply doors wait its own stages.
- Lagrix: simulated (`npm run lagrix`).

## 9. Never

An element buys, installs or calls the store; a key or token through any door of the marketplace; a price, a seller or a guarantee
promised in Fractera's name beyond what the store returned; a simulated rung told as a real offer; the store's «nothing yet» replaced
by an invented starter.
