# `/architect/auth` — a group page

This folder is a **group**: it has its own words and it lists the sections next to
it. It is not a special kind of object — a group is a page whose folder happens to
have children, which is why depth costs this project nothing.

It carries its own text as well as a list, and both are shown: the working part
first (the port of the sign-in service, asked of the node), then the group's topics,
then the sections. Until 264-3 a group's `topics` were dropped by the index shell
without a word — see `../../_lib/collection-index.tsx` for what that cost.

## What is here

| Path | Role |
|---|---|
| `page.tsx` | thin entry: names this folder, exports metadata, renders the index |
| `_list.generated.ts` | **generated** — the sections of this group. Never edit |
| `_data/meta.ts` | `slug` (must equal the folder name) and `order` (position in the menu) |
| `_data/en.ts` | the base language — mandatory |
| `_data/ru.ts` | an override |
| `_data/index.ts` | ties them together; **this file is what makes the folder a page** |
| `_components/` | the working part; returns `[]` until something is built here |

## The three states of this page

1. `_components/` returns blocks → they are shown;
2. it returns nothing, but `_data` carries `topics` → the text is shown;
3. neither → the page states its own name and says the content is coming.

The third state is why this page counts as **finished** the moment the folder
exists: it opens, it is in the menu, and it says what it is. Without that handler
the same address would serve a blank page, which a person reads as a broken
product. Today this page is in state 3 by intent.

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
pages with no declared relation. The `hreflang` block is what turns them into one
page in two languages, so it is emitted in **both** visibility modes.

🛑 **One switch decides three things at once** — `ARCHITECT_LAYER_IS_PUBLIC` in
`_lib/collection-visibility.ts`: the `robots` tag, presence in `sitemap.xml`, and
the `robots.txt` rule. They must agree: a page listed in the sitemap that answers
404 to a stranger is worse than an unlisted one — the sitemap stops being
trustworthy as a whole. While the layer is locked, all three say "closed".

## Adding a section

Create a folder next to this one with `_data/` and a thin `page.tsx`. Nothing else:
the build regenerates `_list.generated.ts`, and the section appears in this index and
in the left menu by itself.

Five sections live here today — Google, the Resend letter, the Claude Code
subscription, the terminal and the Telegram bot. Each exists, opens and names itself;
their content is a step of its own.

🪦 This section used to be called "Growing children" and described the swap this page
has already made: `CollectionPage` → `CollectionIndex`, with `PAGES` from the
generated list. The rule behind it still holds for any childless folder — the
generator writes no list for one, and deletes a stale one, so importing it would
break the build.

## Renaming or moving

Rename the folder and change `meta.slug` to match — `npm run check:architect-routes`
fails if they disagree, because a menu link would then point past the page. Order in
the menu is `meta.order`, never the alphabet of folder names.

Mechanism: `../../lib/collection/README.md`. Layer skeleton and recovery:
`../README.md`.
