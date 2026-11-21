# 822 — the capability ladder: an element that lacks a hand gets it from its brothers, from Fractera's graph, from Lagrix, or by a build; a bought element serves every brother

State: PROPOSED 2026-11-21 ~10:45 UTC — a critical analysis of the owner's 440–441 (intake pre-steps/2026-11-21-element-buys-an-element-
for-its-brothers.md); waits his answers to the forks below and his «да» before any text of the instruction changes.

## The owner's case in one line (441)

Element «Марина» wants pictures → nobody in the node draws → the core finds a ready element in Fractera's graph → Марина's side pays
(Stripe of Fractera) → the node receives the right to take it from Fractera's private repository → the core installs it as an element
of the node → tells Марина «ready» → Марина and the new element agree an API (i2i) → every other element may use it too, nobody first.

## What the node already has (measured in code, 2026-11-21)

- The element's `need` command (template `scripts/need.mjs`) → the core's `npm run needs` → skill `handle-need`: found in a brother (by
  the A2A cards, `npm run find` + `card`, no agent woken) → «agree an API by i2i»; missing → the architect's yes → built as a door in the
  owner element → verified on its card → «ready» to the asker. The ladder exists with two rungs: brothers and build.
- i2i between elements with a pair key per call (818-7, an HMAC, nothing stored per pair — fits 980 elements).
- Lagrix search for a2a and f2f — `npm run lagrix`, a simulation with a fixed contract (`check:lagrix-contract`).
- NOT found: an installation of an element from Fractera's PRIVATE repository. `services:install` clones Fractera's public templates by
  tag; a token for private repositories lives only in the template release tool (`scripts/template.mjs`, `TEMPLATE_GITHUB_TOKEN`). The
  owner's «two scenarios at the node's birth» is a plan (the new bootstrap), not code — to be confirmed with him.
- NOT found: a search over Fractera's graph; the magnifier tool in the elements' top menu; any purchase of an element.

## Critical analysis — five cracks and how I would close them

1. **«Марина used i2i and found nothing with anyone» contradicts a law.** An element never sees its brothers (`elements:isolate`; «they
   cannot find each other by themselves»), and asking 980 agents one by one would wake 980 sessions. Close: the element's first act is
   `need` to the core; the core reads every brother's card by code, no model, no agent woken. The owner's intent (brothers first) holds;
   only the mechanism is the core's.
2. **A fourth rung is missing — «build it ourselves».** Today a missing hand is built in the element whose field it is. The ladder must
   be: brothers → Fractera's graph → Lagrix → build; and buy-or-build is said aloud with both prices — the element's price in dollars
   against the build in tokens and days (the build-join-buy gate of the catalog skill connector-marketplace-strategy).
3. **Money and ownership collide on a node of several owners.** An element has no money — a person has. Inside one owner (every element
   «part of the project») «one buys for all» is natural. But when the payer is an app of its own (another person — «Студия Марины» on an
   integrator's node), her money would buy a thing the architect's node owns and every other owner uses free. Three variants: (a) a
   shared element is bought only by the architect — the element asks, the architect pays; (b) the payer's owner pays and the element is
   hers, shared by her choice; (c) the payer pays for everyone, with her explicit consent on the checkout window («вы покупаете для
   всего узла»). My pick was (c) inside one owner, (a) across owners. **DECIDED by the owner, Telegram 447 (10:30 UTC), verbatim:
   «Смотри надо рассматривать один узел как одно сообщество в котором существует правила мы вместе строим один общий проект и каждый
   вкладывает то что считает необходимым. С этой точки зрения Марина покупает элемент за свои деньги для всех братьев это закон»** —
   variant (c) for every node: the node is one community building one project; whoever pays buys for all brothers, no priority. The
   checkout window says so plainly («вы покупаете для всего узла») — the payer's consent is the window, not a question.
4. **The purchase is a program; its fuel is a second bill.** Pictures cost money per call (a provider key). Ten brothers on one bought
   element spend one key. The door already knows who calls (the pair key, 818-7), and the node keeps a ledger of paid calls (skill
   `money-and-resources`) — so: the element is shared, the fuel is counted per caller, and across owners a quota or a charge. Decided
   before the first shared paid element, never after the first surprise bill.
5. **Bought code runs on the node.** Fractera's own elements are trusted; a third-party seller in the graph is not — a review before the
   listing, a re-review on every new tag, revocation (ideas of the catalog skill app-marketplace-review). On a server every element is
   walled in its own OS user (811), so a bought element is one more walled element, never a privileged one. And the law «if Fractera
   disappeared tomorrow nothing breaks»: a purchase gives a full copy on the node (clone by tag), never a remote dependency; Fractera's
   disappearance stops updates, not the element.

Also: **who pays is always a person's hand.** The agent never pays: the core opens a window (`npm run ask-person`) with the element, its
price, what the node gets and who uses it; the person pays on Fractera's checkout (Fractera is the merchant of record — its own Stripe,
never the node's Stripe element, which receives the node's own sales); the core checks the entitlement itself after «Готово».

## The ladder, as the instruction would say it (the shape for the texts of 822-1)

1. The element: its own skills and the node's tools first (`parts_find`); a hand it lacks → `need` with what for — never a brother
   directly, never a purchase, never an installation, never a payment.
2. The core: brothers by their cards (code) → found: «agree an API by i2i» (today's handle-need §1).
3. Nobody here → Fractera's graph (simulated until the graph element lives — said aloud) → found: the offer to the payer — price, what
   it does, who will use it, the build price beside it; Lagrix only when the graph has nothing (simulated, said aloud).
4. The payer's yes → the window to Fractera's checkout → the entitlement (a read-only token to ONE private repository, kept in the core's
   secrets, never in an element) → the core installs it by tag as an element of the node (registry, port, birth checks) → its card.
5. «Ready» to the asker with the element and its doors; the two agree an API once; every other brother finds it by its card on their own
   `need` — no announcement nobody ordered.
6. Nothing found anywhere, or the person prefers it → the build rung (today's handle-need §2–§3).

## 440 — the element's purpose, for its sealed instruction (my draft, for his edit)

«You exist to help a person run a business and grow their own and professional effectiveness: you build them a site or an app and
automate their processes. You have what a chat alone lacks: your own server, sign-in, a database, storage, vectors, a calendar, a
Telegram bot, and doors to the other elements of the node. A person rarely knows what is possible — draw them into the conversation, let
them dream boldly, then show the way, with its price and what is real today. When they are only curious, offer an analysis of how others
usually do it, from your knowledge and the skills of the community.» — Critique: «unlike Claude.ai» stays out of the sealed text: a claim
about a provider's product needs its primary source; the element names what IT has instead. Boldness is bounded by honesty: price and
«real today / simulated» are said, or boldness becomes a promise without a result.

## Substeps (proposed)

- 822-1 (now, Opus max, texts only — the owner's «current plan»): the core's CLAUDE.md §4 «A capability request» → the ladder; skill
  `handle-need` → the Fractera and Lagrix rungs and the payer's window; skill `use-i2i-a2a-f2f` → «a whole element bought from Fractera»;
  the template's sealed element instruction → 440's purpose + the element's side of the ladder; seals; ships with the custom template
  release of 821 (one release, v0.3.221).
- 822-2 (medium): the search procedure — one core door that answers an element's search over brothers' cards + Fractera's graph + Lagrix
  in the Lagrix contract's shape (simulated rungs marked); the magnifier tool in every element's top menu (a core tool, scope «any»).
- 822-3 (medium): Fractera's side — a private element «Fractera graph» on Fractera's site: the catalogue of ready elements with their
  technical cards (Lagrix doc 20 fields), the checkout (Stripe of Fractera), the entitlement per node, the re-review on a new tag; the
  core's installer from a private repository by tag.

## Test checklist (shown before the code, marked after)

- T1 the sealed texts carry the ladder in the same order in the core and the element; `check:instruction` green, seals renewed.
- T2 a dry run on this Mac: a test element's `need` «generate pictures» → the core's answer names: no brother, «Fractera graph —
  simulated», the payer's window text, the build price — and no payment, no installation happens.
- T3 negative: an element's call that tries to install or pay is refused by the core (the boundary).

## The catalog's skills seen for this (skills_find, 2026-11-21)

All from samber/developer-platform-skills (9 stars, ~9.9k installs each, MIT) unless named: connector-marketplace-strategy (the
build-join-buy gate — the one I like most), app-marketplace-monetization-model (merchant of record, the platform's cut, payouts),
app-marketplace-review (review, re-review on updates, revocation), app-marketplace-listing-standards (listing fields, reject criteria),
app-marketplace-launch-marketing (seeding a marketplace), mbfinotti/partnerships-skills@partner-marketplace-strategy (2 stars, 16k
installs — where to list a product; not our case). Ideas taken in my own words; nothing installed.
