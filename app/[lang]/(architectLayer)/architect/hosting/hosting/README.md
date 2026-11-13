# `/architect/hosting/hosting` — a section page

One page of the architect layer. Everything about it lives in this folder; nothing
about it is written anywhere else.

## What is here

| Path | Role |
|---|---|
| `page.tsx` | thin entry: names its own folder and its parent, exports metadata |
| `_data/meta.ts` | `slug` (must equal the folder name) and `order` (position in the menu) |
| `_data/en.ts` | the base language — mandatory |
| `_data/ru.ts` | an override |
| `_data/index.ts` | ties them together; **this file is what makes the folder a page** |
| `_components/` | the working part; returns `[]` until something is built here |

## The three states of this page

1. `_components/` returns sections → they are shown;
2. it returns nothing, but `_data` carries `topics` → the text is shown;
3. neither → the page states its own name and says the content is coming.

The third state is why this page counts as **finished** the moment the folder
exists: it opens, it is in the menu, and it says what it is. Without that handler
the same address would serve a blank page, which a person reads as a broken
product.

## Multilingual

`en` is the base and is mandatory; `ru` overrides it, and any language we do not
have falls back to `en`. Every visible string comes from `_data` — never inline in
`page.tsx` or `_components/`, or it is untranslatable and invisible to
`npm run check:i18n`, which requires `title` to be present and non-empty in both.

Two languages here, not 82: a closed surface behind a lock follows the page-set
rule, not the reusable-part rule.

## Search engines and AI agents

This page carries the **full** set of signals, because the template is meant to be
reusable in a public layer too — not only behind this lock:

| Signal | Where it comes from | Value here |
|---|---|---|
| `<title>` | `_data/<lang>.ts` → `title` | the page's own name, per language |
| `description` | `_data/<lang>.ts` → `lead` | its own sentence; never inherited, never shared |
| `canonical` | `buildAlternates` | the page's one true address |
| `hreflang` | `buildAlternates` | `x-default`, `en`, `ru` — all pointing at each other |
| `alternate text/markdown` | `buildAlternates` | the machine-readable twin, for agents |
| `og:*` | the metadata factory | title, description, url, site name, locale |
| `robots` | `_lib/collection-visibility.ts` | follows one switch, see below |

🔒 **Two language versions that do not point at each other read as duplicates.**
That is precisely how a site earns the "doorway" label — a set of near-identical
pages with no declared relation. The `hreflang` links are what turn them into one
page in two languages, so it is emitted in **both** visibility modes.

🛑 **One switch decides three things at once** — `ARCHITECT_LAYER_IS_PUBLIC` in
`_lib/collection-visibility.ts`: the `robots` tag, presence in `sitemap.xml`, and
the `robots.txt` rule. They must agree: a page listed in the sitemap that answers
404 to a stranger is worse than an unlisted one — the sitemap stops being
trustworthy as a whole. While the layer is locked, all three say "closed".

🛑 **`canonical` and `hreflang` appear only once the site has an address.** With an
empty `url` in `APP-CONFIG`, `buildAlternates` returns nothing at all — measured,
and true for every page of this project, not just this layer. That is the correct
behaviour rather than a gap: a canonical pointing at a temporary tunnel address
would be a lie the day the tunnel rotates. The address arrives with a real domain
(see `/architect/hosting/domain`).


## What this tab runs (step 737)

| Where the tab is opened | What it shows | Its door |
|---|---|---|
| the person's computer | the road first (737-11b): the move ladder connect · probe · prepare · copy · claude · rehearse · telegram · move, or a new independent server connect · probe · prepare · copy (this node with or without its data, or a fresh node from the fork) · claude · start · telegram | `/api/node/server` (the architect, never a public address); the server's own bot — `/api/node/server/telegram` (to the server's channel door over SSH) |
| the server, as the owner (`npm run server -- window`) | the domain's five steps: domain · records · certificates · HTTPS · switch on | `/api/node/server/domain` |
| the server's bare IP | the same five steps, read-only — the records to write at the registrar | `/api/node/server/domain` (GET only) |

The islands live in `components/hosting/` (`server-move.client.tsx`, `server-domain.client.tsx`, the parts `ladder-step`, `stage-log`,
`dns-records`); the words in their `.i18n.ts` files, chosen on the server (`widgets.tsx`). The runners: `scripts/dedicated-server/move.mjs`
and `certs.mjs`, both detached. How the main agent leads it: skill `dedicated-server`.

**Build cost and caching.** The page is prerendered like every page of the layer; nothing about the machine is printed into the build.
The move ladder asks its door every 15 s while the tab is open (every 3 s while a rung works); the domain's steps ask once on opening,
after each act, and every 4 s only while certificates are being issued. A closed tab costs nothing.

## Renaming or moving

Rename the folder and change `meta.slug` to match — `npm run check:architect-routes`
fails if they disagree, because a menu link would then point past the page. Order in
the menu is `meta.order`, never the alphabet of folder names.

Mechanism: `../../../lib/collection/README.md`. Layer skeleton and recovery:
`../../README.md`.

## The words above the ladders (2026-11-13)

The group page «Домен и хостинг» opens with a preface and two cards closed by default (`hosting/_components/hosting-notes.i18n.ts`): the own domain and the dedicated server. «Выделенный сервер» opens with a short preface, the owner's partner link to a server and four cards closed by default, one per reason for a server and the road of the ladder each takes (`hosting/_components/move-cases.i18n.ts`). The link lives in `lib/helpful-links.json` with its disclosure; a price of an outside service is quoted only from its own page, with the date.
