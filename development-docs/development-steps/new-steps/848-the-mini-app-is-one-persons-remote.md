# 848 — The Telegram Mini App is one person's remote

Source: the letter of the aifa.dev server's main agent, 2026-11-23 (`pre-steps/2026-11-23-mini-app-purpose-letter.md`), carrying the
owner's decision of 18:38 UTC: the Mini App is one person's remote — navigation to the project's pages, a jump from a section to a chat on
its topic, short statistics, scheduled tasks, search (own elements, Fractera's f2f marketplace, later Lagrix); it grows by sections,
analytics and build-control forms; it never copies a page, its mobile version or an app's function; one Mini App — one person.

Done before this step (847, core 153c9006): the agent card behind the wall (core-401 → an element door + a guard over the template's
calls), the bot's name of the element (name.json → passport → address).

## Substeps (my pick of order: cheap knowledge first, then the template, the person-per-app last)

| # | What | Where | Tokens per session | Proof |
|---|---|---|---|---|
| 848-1 | The law in one line: CLAUDE.md §6 and the element's sealed instruction (`instruction:element`) | core + both templates | ~75 | seal guards green; the line is in a fresh element's instruction |
| 848-2 | The surfaces card at a session's start, by code: files, pages (public / by role), Mini App (url, items by kind), bot (channel, button) — 4–6 lines; the main agent gets one line per element | core (session prompt) | ~80 | a test: the card is there, ≤ 100 tokens; a negative — no Mini App → the line says so |
| 848-3 | Mini App title = the element's name for people (not the default «Fractera» of an unnamed site) | custom template | 0 | eyes on `/tg` of a test element |
| 848-4 | `menu.json` v2 — `kind ∈ {nav, chat, stats, schedule, search, control}`; `nav` has `href` + `roles`, `chat` a `topic`, the rest name their door | custom template | 0 | the template's tests; old menus still read |
| 848-5 | Guard `check:tg-menu` in the template's prebuild: `nav` leads to an existing route whose access covers its roles; no screen in `tg/` that draws a page — warning on this tag, failing from the next | custom template | 0 | negatives: a dead `nav`, a page-copy screen |
| 848-6 | A jump to a chat on a topic: `t.me/<bot>?start=t-<slug>` (base64url, ≤ 64), its own prefix — never the admission's 24-hex nonce; an admitted person's `/start t-…` wakes the agent with the topic; a stranger's opens nothing | core `telegram.cjs` + template link (`openTelegramLink`) | 0 | tests: topic delivered; a stranger's topic refused; a nonce still admits |
| 848-7 | `npm run pages -- <id>|--all`: the element's routes with access (guest / roles) and its Mini App tree, through the element's doors (`/api/tg-menu` + a new `/api/pages`) — never its code | core command + template door | 0 | `pages -- <id>` public pages = its sitemap |
| 848-8 | One Mini App per person: Telegram id ↔ the app's account and role, `/tg` filtered by that role, a button per admitted person; navigation, statistics, schedule and search by role — anything that runs Claude only on that person's own subscription (Anthropic Consumer Terms; skill `provider-rules`) | template + core | 0 | two people, two roles, two menus; no role — nothing; a foreign bot's initData refused |

## Order and builds

- One template release (v0.3.240) carries 848-1 (element part), 848-3, 848-4, 848-5, 848-6 (link), 848-7 (door) and the two held fixes
  (eed45ee titles, 7b32c1a subscription step) — it waits the owner's word on the gh key for Fractera templates (Telegram 1183).
- One core build carries 847 + 848-1 + 848-2 + 848-6 + 848-7; then the server update, proven by a walled bot answering before and after
  (ANTI-PATTERNS, server section).
- 848-8 is its own design after the owner's yes to the rest: it touches accounts and roles of an app's people.
