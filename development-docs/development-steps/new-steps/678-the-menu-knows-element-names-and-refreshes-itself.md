# 678 — The menu knows an element's name and refreshes by itself

**State: APPROVED 2026-11-07** — the owner, verbatim, to «Я не понимаю, ты получил описание проблем с названиями элементов в левом меню ,
ты пофиксил?» answered «no, it was left for a new step»: «to do all and fix all».

## The owner's words, verbatim (2026-11-07, the exam session on his node)
«требуется изменения ядра таким ну чтобы каждый раз когда ты создаёшь новый элемент или меняешь его название левое меню обновлялось бы
возможно нужен какой-то Hook или ещё что-то. Потому что до перезагрузки страницы я не могу увидеть твою работу.»

## Measured (the examinee's D2, D10; read in the code 2026-11-07)
- The left menu labels a custom element by its address (`draft-menu.tsx`: `label: slug`); the header catalog does the same
  (`dashboard-rows.ts` `nameOf` → `addressOf(id)`). Nine new elements showed as `Jfi92`, `Hairn` … The passport `name` was set by 2 of 9
  agents and is read only by `npm run card`.
- `npm run create` changes the node outside the open page: the doors that write call `revalidatePath("/[lang]", "layout")`, but the
  browser is never told, so the menu changes only on a reload.

## State (2026-11-07, ~23:15 UTC)
678-1, 678-2, 678-3 coded and pushed (the commit after this line); proven in the workshop: `tsc` clean, the guards green
(`API_OK`, `STATIC_OK`, `ARCHITECT_ROUTES_OK`, `MENU_OK`, `INSTRUCTION_OK`, `SOUL_OK` …), the name rule over a temp folder, `rename` and
`card` live (a name set, removed → the passport's, an unknown id refused). OWED — the second plane: the owner's fork sync →
`npm run node:update` → `npm run eyes` on his node: the nine names in the menu, then a `rename` seen without a reload.

**Measured on the owner's node (core `bcb05a6b`, 2026-11-07 23:42 UTC):** `npm run eyes` — the left menu shows ROOT, YOUTUBE, INSTAGRAM,
LINKEDIN, X, МЕДИА, КЛИП, ДОЗОР, БЛОГ, АВТОРЫ (was `Jfi92` …); console clean. Live in Chrome with a page mark: `rename jfi92 «Авторы 2»` →
within 8 s the left menu «АВТОРЫ 2» and the header «Авторы 2», the mark kept (no reload). ✗ The rename back: the server rendered «АВТОРЫ»,
the page kept «АВТОРЫ 2» — `router.refresh()` did not bring it, and the island's check passed by `includes`. Fixed: an exact match, a
second refresh, then a reload (not while typing, not on a terminal). Re-proof after the next update.

**Re-proof on the owner's node (core `1024e96f`, 2026-11-08 ~01:20 UTC), Chrome on /en with a page mark:** `rename jfi92 «Авторы 2»` →
the menu «АВТОРЫ 2» within 10 s, the mark gone (the fallback reload fired: `router.refresh()` did not take it); `rename … «Авторы»` → the
menu «АВТОРЫ» within 10 s, the mark kept (refreshed in place). Both directions reach the menu; in place is not reliable, the exact check and
its reload make it so. `rename`'s line now says so.

## Substeps
| # | Result | Proof |
|---|---|---|
| 678-1 | One place for an element's display name — `lib/web4-items/name-file.cjs` (CommonJS: `self-description.cjs` reads it too), like `address-file.mjs`: the core's `data/services/<id>/name.json` → the passport `name` (when not the id) → the address. The left menu, the header catalog, the notice door and `npm run card` read it. | a unit run over a temp folder: file → passport → address; the guards |
| 678-2 | The main agent names an element: `npm run create -- --name "<name>"` at birth, `npm run rename -- <id> "<name>"` later; both write the core's file; the open pages see it by 678-3's stamp. The skill `create-element` names `--name`. | the CLI on a temp node root; `check:instruction-skills` |
| 678-3 | The menu refreshes by itself: the door `/api/node/menu-stamp` (architect, no-store) gives a stamp of the node's composition (the registry's write time and the names and addresses the menu draws — small file reads); an island in the left menu asks it every 3 s while the tab is visible and on focus; a new stamp → the door revalidates the layer once, the island `router.refresh()`es and tells the header catalog to fetch again. | on the owner's node after the update: `npm run eyes` — a `rename` changes the menu without a reload |

## Price
Code — this session. Running: one request of a few `stat` calls every 3 s, only while an architect's tab is open and visible; no
resident process. The core is rebuilt by the node update on the owner's node.

## Not in it
The other defects of the examinee's report (D1 nine identical «done» wakes, D3 «own role» needs, D7 `create` refusing right births,
D9 the deny rule that blocks the core's own `lib/web4-items/`) — their own steps.
