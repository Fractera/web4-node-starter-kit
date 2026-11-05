# 654 — each element's own space inside the stores: data, storage, vectors, graph (plan, approved 2026-11-05)

## 1. Retelling and decisions

The owner, 2026-11-05, verbatim: «Ты дал мне четыре ссылки на элементы памяти но ведь это не полный список? Например здесь отсутствует
объектное хранилище которое используется в глубинной памяти»; «почему ты проверяешь связь только с глубинной памятью? Мы с тобой говорили
что в режиме завод приложений например все эти элементы памяти должны работать соответствующим образом. А значит в том числе объектное
хранилище должно быть обновлено не только для использования глубинной памятью но и для использования просто внутри элемента …»; in the
next session: «Продолжи разработку Fractera по current-steps.md ядра, блок NOW-20: спланируй шаг 654, разделение элементов внутри
хранилищ (база, файлы, векторы, граф) для режима завода приложений».

**Retold:** an element that uses a store directly — its tables, files, vectors, graph — gets only its own; another element gets nothing of
it on any verb; the core and the architect's main agent get everything, each finding named by its element. The same rule 650 gave the deep
memory («главному агенту была доступна вся память, а каждому элементу только своему»), now in the four stores themselves.

**Why 650 was not enough (measured 2026-11-05, current-steps NOW-21):** the stores know no caller — one shared key opens every table,
file, collection and graph space; every custom element holds that key in its `.env`; the custom template's helpers write generic tables
(`products`, `site_settings`, …) into the ONE shared database; the template's graph helper is dead (503); and a private file the memory
keeps for root is served to anyone on the internet by any element's public route `/api/media/<id>/file` (200 through the temporary address).

- **D1 (mine — the core of the step):** a separation is real only where a caller cannot claim to be another. Each element gets its own key
  `ELEMENT_KEY = <id>.<mac>`, the mac an HMAC-SHA256 of the node's `DATA_SECRET` over the element id. The installer computes it; each store
  checks it by itself (no list to keep, no call to the core — an element and a store live without the core). An element key opens only
  that element's space; the master key opens the whole node as today (the core, the native elements, the main agent).
- **D2 (decided by the owner, §9):** the master key of the memory family becomes `DATA_SECRET` alone — it already is the key of data, storage
  and vectors; the graph and the memory door, which today open with `SETTINGS_SECRET`, move to it. Custom elements stop receiving
  `DATA_SECRET`. `SETTINGS_SECRET` stays shared for settings, design, blocks, the embeddings and the doors of the core and of elements:
  taking it from custom elements touches every such door, not the stores — proposed as step 655.
- **D3 (decided by the owner, §9):** the separation works in both node types, not only in the app factory. In a single project two elements
  share data through an agreed API (i2i, CLAUDE.md §4 «i2i», §6 «Only agents talk to agents»), never through one table; one behaviour,
  no branch by the node type.
- **D4 (mine):** a stored file has an owner and a visibility. A page image stays public (an element's admin upload is public by default,
  as today); a file of the memory is private. Storage gives a private file only to a call that asks for it by name (`?private=1`) with the
  owner's key or the master key — so every public route already installed on every element (the same code everywhere) stops serving
  private files the moment storage is updated, with no rollout to the elements.
- **D5 (mine):** what the stores already hold stays the node's (owner `node`, files public): the memory's tables, collections and graph
  spaces, the core's journals, the seed images. Nothing moves by itself. A node of another person whose custom element already wrote
  tables into the shared database copies them into the element's own database by the architect's word (`POST /db/claim`, 654-1).
- **D6 (mine — a limit said aloud):** the doors are not the disk. All elements run as one user of the computer; an element's agent is held
  off the neighbours' files by the boundary hook on named paths (`scripts/element-boundary-hook.mjs`), not by the operating system. 654
  closes the doors; a user or a container per element is not in it, and the pages say so.

I assume that an element id is the registry's (`lib/web4-items/paths.cjs` `LABEL`: `[a-z0-9-]`, ≤ 63) and never holds a dot, so the key
`<id>.<mac>` splits at its first dot.

## 2. What is reused (paths that open)

- The shared lock of the data layer: `fractera-data-starter/lib/data-store/auth.mjs` — word for word in `fractera-storage-starter` and
  `fractera-vectors-starter` (its header: «change it in all three at once»); `requireAuth` gets a third way in, `req.element`.
- The installer's kinds: `scripts/services-install.mjs` — `parseExample` (`# kind: derived|secret|foreign|own`), `sharedSecret`, and the
  carry-over of undeclared variables (265-6), which today would keep an old `DATA_SECRET` line alive in a custom element.
- Memory spaces (650-1): `fractera-memory-starter/lib/memory/space.mjs`, `door.mjs` (`authKind`, `callerOf`); collections
  `memory-said--<element>`, graph spaces `memory-<element>`.
- Graph spaces (596-1): `fractera-graph-lightrag-starter` README «Spaces», the `space` field, `lib/graph/run.mjs`; its doors
  `app/api/graph-insert|query|status/route.ts` check `lib/node-key.ts` (`SETTINGS_SECRET`).
- Vector partitions: `fractera-vectors-starter/lib/data-store/vectors.mjs` (`vectors_ann` with `collection TEXT PARTITION KEY`).
- The late column of a live table: storage `lib/data-store/media.mjs` (the `ALTER TABLE media ADD COLUMN …` ladder).
- The template's store helpers: `fractera-custom-item-starter` — `lib/fractera/data-service.ts`, `lib/db/remote-client.ts`,
  `lib/db/index.ts`, `lib/fractera/vectors.ts`, `lib/fractera/knowledge.ts`, `lib/media/by-name.ts`, `app/api/media/upload`,
  `app/api/media/[id]/file`, `app/api/media-proxy/[...path]`, `scripts/seed-media.mjs`, `scripts/seed-media-when-ready.mjs`, `proxy.ts`.
- The core's callers: `lib/agent-kit/skills/find.mjs` (`graphCall`), `scripts/skills.mjs`, `scripts/node-commands.mjs` (memory),
  `lib/agent-kit/memory/embed.cjs`, `lib/a2a/self-description.cjs` (vectors), `lib/a2a/passport.mjs` (`KEYS`).
- Release and rollout: skill `release-template` (`npm run template -- clone|release|pin|rollout`), the pins of
  `WEB4-ITEMS-REGISTRY/web4-items.json`, `npm run node:update` on the owner's node.
- Proof: the pattern of `~/fractera-dev/_tools/proof-650.mjs` (keys from the process environment by `node --env-file`, never printed);
  the measuring scripts of this session (scratchpad `654/`).

## 3. Known limits (what must not break, and what breaks if it does)

- CLAUDE.md §6 «Never read the node's `.env.local`» — proofs take keys by `node --env-file` and print none; a script that checks an
  element's `.env.local` prints variable NAMES only.
- CLAUDE.md §3 «the only door to data is the data element» — stays; the key changes, not the door.
- CLAUDE.md §3 «an element lives without the core too» — the key is checked by the store itself (D1); no store calls the core.
- ANTI-PATTERNS «A second checkout on a computer with a live node shares its pm2» — no lab `services:install`; labs only `next dev` on
  2565x in a clone; the doors are proven on the owner's node after `node:update`.
- The installer's carry-over (265-6) keeps undeclared variables: without a named exception a custom element would keep `DATA_SECRET`
  after its template drops it — the separation would only look done.
- The key switch of D2 lands in ONE `node:update`: the graph, the memory and the core together — otherwise the skills search
  (`skills_find`) and the memory lose the graph between two updates.
- Every page image of every element must still show: the seeds (`seed-apple.png`, `seed-orange.png`, `development-loop-2026.jpg`) and
  CONFIG images stay `node` and public; the public route keeps serving public files.
- The memory's answers (650 spaces) must be the same on the main agent's `npm run remember` / `remind` after each delivery.
- A custom element born from an OLDER template keeps `DATA_SECRET` (it declares it) until its owner takes the template update: the
  installer never strips a key that an element's code still uses — that would break a person's element silently.

## 4. Observable results

- With element A's key: A's table, file, vector and graph entity are found by A; with element B's key — nothing of A's on every verb
  (list, read, search, delete, SQL); with the master key — both, each named by its element.
- A store refuses a key whose id was swapped (`b.<mac of a>` → 401) and SQL that reaches outside the element's file (`ATTACH` → 400).
- The memory's `anna-650.txt` through `https://<temporary address>/api/media/<id>/file` → 404 (today 200); a seed image through the
  same route → 200.
- Root's `.env.local` holds `ELEMENT_KEY` and no `DATA_SECRET` (names only); root's pages show their images.
- The memory door: an element key with another element in `from` → refused; `SETTINGS_SECRET` → 401; the main agent's `npm run
  remember` / `remind` answer as before.
- The template's graph helper stores and finds in the element's own space (today 503).
- The pages of data, storage, vectors, graph and memory say whose data lies where; the storage landing no longer says «the library
  itself is shared».

## 5–6. Substeps, order, address

| # | Substep | Repositories (`main`, next patch tag) |
|---|---|---|
| 1 | `654-1.md` — the element's key and its own database | data; the lock copied into storage and vectors |
| 2 | `654-2.md` — storage: whose file, public or private | storage, memory |
| 3 | `654-3.md` — vectors: the element's own collections | vectors |
| 4 | `654-4.md` — graph: the element's own space, the node by `DATA_SECRET` | graph, memory, core |
| 5 | `654-5.md` — the memory door: the space by the caller's key | memory, core |
| 6 | `654-6.md` — the custom template and root on their own key only | core (installer), custom template, root |
| 7 | `654-7.md` — the pages and the words | data, storage, vectors, graph, memory, core |

**Order and delivery.** Each delivery: release → pin in the core → fork `aifa-agi` fast-forwarded → `npm run node:update` → the proofs on
the owner's node. Deliveries: (1) data + the lock in storage and vectors; (2) storage + memory; (3) vectors; (4+5) graph + memory + core
in one update (the key switch, §3); (6) template, root, installer; (7) pages. Until 654-6 the two elements of the proofs are keys the
proof script computes from the node's `DATA_SECRET` for `root` and `blocks` (both in the registry; `blocks` stands for a second element,
as in the 650 proofs) — that proves the stores; 654-6 proves with a real second custom element (the owner's choice in the window).

## 7. Substep files

`654-1.md` … `654-7.md` in this folder: what is built, done when, how proven (two planes named in advance, one with a negative control),
what it rests on, what is not in it.

## 8. Acceptance of this plan

Every substep has its file; each result can be shown; two planes per substep, one with a negative control; the repositories are named;
the limits name what breaks. **Not in the step:** step 655 (custom elements without `SETTINGS_SECRET`: the doors of the core, of
CONFIG, Design, Blocks and of elements by the element's key); the cache element (no doors yet — when built, it follows this rule); a
user or container per element (D6); accounts per app in the sign-in element; the member's channel (653); moving the node's existing data
into elements by itself (D5); wiping an element's spaces when the element is deleted (proposed next); the data element's landing after
the Stripe sample.

## 9. The owner's approval

2026-11-05, in the choice window, verbatim:
- the plan, 7 substeps — «Да, начинай 654-1 (Рекомендую)»;
- which keys leave custom elements — «DATA_SECRET сейчас, другой — 655 (Рекомендую)» (D2 as written);
- the node types — «В обоих типах (Рекомендую)» (D3 as written);
- what else goes into 654 — «Временный второй элемент, Строка в CLAUDE.md и навыки»: 654-6 proves with a temporary second custom
  element, removed after the proof by «Удалить насовсем» with his yes; 654-7 writes the `CLAUDE.md` §3 line (resealed) and the skills
  `use-data`, `use-deep-memory`. Not chosen: wiping an element's spaces when the element is deleted — stays «proposed next».
