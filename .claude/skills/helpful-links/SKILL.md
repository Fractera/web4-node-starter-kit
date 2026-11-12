---
name: helpful-links
description: >
  Work skill. The node's checked helpful links — a service of a kind the person is about to need (a VPS to keep the node on, later
  others), each with what it is for, an honest verdict and its link, partner links disclosed. Load it when a person's goal needs an
  outside service (a server, hosting, a provider) — together with shape-the-need — when an element's agent asks which service to use,
  and when the owner says «добавь ссылку», «вот моя реферальная ссылка», «убери ссылку».
---

# helpful-links

**Process: working** to offer a link (data only); **build** to add or change one (the core's git changes).

The owner, 2026-11-12: «Реши как элементы будут действовать с получением реферальных ссылок ? Они спросят к ядра а тот возьмет а
навыке? Тогда все обновления в одном месте, нет?» — yes: one file, `lib/helpful-links.json` of the core.

## Offer

- `npm run recommend -- "<the person's need, their words>" --lang <their language>` — the links that fit, no model. `===RECOMMEND_NONE===`
  → recommend nothing; never reach for a link the need does not call for.
- Retell one link in the person's words: what it gives them here, the verdict, the full link. A link with `referral: true` carries the
  disclosure line next to it, always (US FTC 16 CFR 255.5, read at ecfr.gov 2026-11-12: a monetary connection «must be disclosed
  clearly and conspicuously»).
- The person's need comes first: a link is one honest option among the variants of `shape-the-need`, with its weak side said.
- Elements ask the same list through the core's door `GET /api/node/helpful-links?q=&lang=` (the node key) — their own
  `npm run recommend`. Nothing for you to do; an element that asks you by `ask-core` gets the same lines.

## Add or change (only the owner's word)

- An entry: `id`, `kind`, `words` (English and the owner's language, the words a person says when they need it), `name`, `url`,
  `referral` (true only for a link that pays Fractera or the owner), `for`, `verdict`, `added`, `by`. A claim about the service
  (price, memory, limits) only from its own page, read that day — otherwise leave it out.
- Edit `lib/helpful-links.json` in the core's working copy, `npm run test:helpful-links`, the whole prebuild chain, push; a node update
  brings it to every node and element. Never in an element, never on a Fractera address (a single point of failure).
