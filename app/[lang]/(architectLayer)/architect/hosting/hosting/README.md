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


## What this page runs (steps 737, 738)

The owner, 2026-11-14: «Никакого переезда нет есть просто запуск сервера … в данном локальном компьютере меняться ничего не должно».

| Where the page is opened | What it shows | Its door |
|---|---|---|
| the person's computer | the preconditions (8 GB, 4 cores, the partner link, Ubuntu), then «Запустить сервер» — empty on every visit: the IP, the SSH port and the root password → seven steps: the server · its check (with the installed Fractera version and «behind N») · the domain (detect, who writes the records, the records, a first check) · installation · the records again · certificates with the checklist · ready (switch-on, sign-in checked) | `/api/node/launch` (the architect, never a public address): stateless — every call names the server, the answer is the server's own state over SSH (`scripts/dedicated-server/launch.mjs` → `state.sh` there) |
| a server node, as the owner | that server's own domain steps: domain · records · certificates · HTTPS · switch on | `/api/node/server/domain` |
| a server's bare IP, a temporary address | the same steps read-only — the records to write at the registrar | `/api/node/server/domain` (GET only) |

The islands live in `components/hosting/` (`server-place.client.tsx` picks the launch or the server's own ladder; `server-launch*.client.tsx`
the launch; `server-ladder*.client.tsx` the 737-19 domain steps it reuses; the parts `ladder-step`, `stage-log`, `dns-records`); the words
in their `.i18n.ts` files, chosen on the server (`widgets.tsx`). On the server: `launch.sh` (detached, as root), `probe.sh`, `state.sh`,
`certs.mjs`. How the main agent leads it: skill `dedicated-server`.

**Build cost and caching.** The page is prerendered like every page of the layer; nothing about the machine is printed into the build.
The launch asks nothing until the person presses «Проверить сервер»; then once per act, and every 5 s only while the server installs or
issues certificates. The server's own ladder asks once on opening, after each act, and every 4 s while certificates are issued. A closed
page costs nothing.

## Renaming or moving

Rename the folder and change `meta.slug` to match — `npm run check:architect-routes`
fails if they disagree, because a menu link would then point past the page. Order in
the menu is `meta.order`, never the alphabet of folder names.

Mechanism: `../../../lib/collection/README.md`. Layer skeleton and recovery:
`../../README.md`.

## The words above the launch (2026-11-14)

«Активация выделенного сервера» opens with its preconditions (`_components/launch-notes.i18n.ts` of this folder): a server of 8 GB and 4 cores with
the owner's partner link, Ubuntu, the IP and root password. «Четыре причины для сервера» moved to the group page «Домен и хостинг», right
after «Какой адрес и какая машина» (`../_components/server-reasons.i18n.ts`). The link lives in `lib/helpful-links.json` with its
disclosure; a price of an outside service is quoted only from its own page, with the date.
