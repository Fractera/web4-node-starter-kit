# 654 — each element's own space inside the stores: data, storage, vectors, graph, the memory door (closed)

**The owner, verbatim (2026-11-05):** «Ты дал мне четыре ссылки на элементы памяти но ведь это не полный список? Например здесь отсутствует
объектное хранилище которое используется в глубинной памяти»; «… объектное хранилище должно быть обновлено не только для использования
глубинной памятью но и для использования просто внутри элемента …»; the plan — «Да, начинай 654-1 (Рекомендую)», «DATA_SECRET сейчас,
другой — 655 (Рекомендую)», «В обоих типах (Рекомендую)», «Временный второй элемент, Строка в CLAUDE.md и навыки»; the order of the last
substeps — «4+5, затем 6 и 7 (Рекомендую)»; the night — «go to finish non stop , not call me i sleep».

**What the step gave.** Before it the stores knew no caller: one shared key opened every table, file, collection and graph space, every
custom element held it, and a private file of the memory was served to the internet by any element's public route. Now each element has
its own key `ELEMENT_KEY = <id>.<mac>` (HMAC-SHA256 of the node's `DATA_SECRET` over `fractera-element-key:v1:<id>`), computed by the
installer and checked by every store by itself, with no call to the core; it opens only that element's space — its own database file,
its own files (owner and visibility), vectors under `el/<id>/`, graph spaces `el-<id>[.<name>]`, its own memory. The node's data key
`DATA_SECRET` opens the whole node for the core, the native elements and the main agent, each finding named by its element. Custom
elements no longer receive `DATA_SECRET`; the same rule in both node types.

| Substep | Commits (tag) | Delivered (`node:update`) | Summary |
|---|---|---|---|
| 654-1 the element's key and its own database | data `3ff1184` v2.2.5, storage `f77fe6a` v1.1.24, vectors `fa55bb3` v1.2.7; core `60aed71c`, `579d00c4` | `ядро 70396686` | `654-1.md` |
| 654-2 storage: whose file, public or private | storage `dc72fe0` v1.1.25, memory `57bad88` v2.2.24; core `54e0bf68`, `9448242a` | `ядро 8ff02189` | `654-2.md` |
| 654-3 vectors: the element's own collections | vectors `6c9f2e9` v1.2.8; core `dd192f10` | `ядро 59e7a833` | `654-3.md` |
| 654-4 graph: its own space; the node by `DATA_SECRET` | graph `17f98e2` v1.2.7, memory `25b1332` v2.2.25; core `338e513a` | `ядро 47745734` (with 654-5) | `654-4.md` |
| 654-5 the memory door: the space is the caller's key | memory `25b1332` v2.2.25; core `338e513a` | `ядро 47745734` | `654-5.md` |
| 654-6 the custom template and root on their own key only | template `3fa23dc` v0.3.158, `4b0f953` v0.3.159; root `7923f2d` v3.0.23, `0650517` v3.0.24; core `c9663a07`, `820654ff` | `ядро 42998b9e` | `654-6.md` |
| 654-7 the pages and the words | storage `d3a4ab1` v1.1.26, vectors `3640585` v1.2.9, graph `1ac2560` v1.2.8, memory `9db4a6f` v2.2.26, data `c90f2bf` v2.2.6; core `98e30fd4`, `a258cfac` | `ядро d9d48e05` | `654-7.md` |

**The observable results of the plan (§4), each shown on the owner's node.**
- Element A's table, file, vector and graph entity are found by A; B finds nothing of A's on any verb; the node key sees both, each named by
  its element — data (654-1), storage (654-2), vectors (654-3), graph (654-4), and all four together across root and a real second custom
  element `djlgb` born from template v0.3.159 (654-6: «djlgb reads stores_probe → 500 no such table», «lists no file of root», «vectors
  → []», «never root's entity»).
- A swapped id (`blocks.<mac of root>`) → 401; an element's `ATTACH` of the node file → 400 (654-1).
- The memory's private `anna-650.txt` through the temporary address → 404, it was 200; the negative control, a seed image through the same
  route → 200, 22901 bytes (654-2).
- Root's `.env.local` (names only): `ELEMENT_KEY` present, `DATA_SECRET` absent; its pages show their images (654-6).
- The memory door: an element key naming another element → 403 `space-not-yours`; `X-Node-Key` on the graph → 401; the main agent's
  `remember` / `remind` as before (654-4, 654-5).
- The template's graph helper — it answered 503 — stores and finds in the element's own space («probe graph — found back: true», 654-6).
- The pages of data, storage, vectors, graph and memory say whose data lies where; no page says «the library itself is shared» (654-7; the
  negative control finds it in storage v1.1.23).

**Decided on the way** (in the substeps' summaries): an element's graph space is `el-<id>.<name>` — the plan's `--` would collide, a
registry id may hold `--`; a read never makes a space folder; the installer's carry-over never keeps `DATA_SECRET` in an element that does
not declare it (`MASTER_KEYS`); `npm run node-type -- get` names custom elements still holding the node's key; the template's passport
tells the element its own key (the owner's question about the JSON passport, 654-6); each store landing carries its own access map
(654-7).

**Left on the node.** The temporary element `djlgb` — removed by «Удалить насовсем» after the owner's yes (2026-11-06, «Да … = yyes»):
pm2, tunnel, registry, draft, data, logs, folder — all ok; port 24687 → no answer. Empty database files `data/elements/djlgb.db`,
`root.db`, `blocks.db` in the data element; the proof questions and phrases in the memory (the main agent's space `node`, root's, blocks'
with the graph space `memory-blocks`) — no door deletes them yet: they go with «wiping an element's spaces when the element is deleted».

**Found on the way, not in the step:** `check-i18n` of every element red on six core-only dictionaries and blind to `_data/<lang>.json`;
no guard compares card lists across languages — the owner, 2026-11-06: «fix it» → step 659.

**Not in it:** step 655 (custom elements without `SETTINGS_SECRET`); the cache element (no doors yet — when built, it follows this rule); a
user or a container per element (D6: the doors apart, not the disk — said on the pages); accounts per app in the sign-in element; moving
the node's existing data into elements by itself (D5); wiping an element's spaces when the element is deleted (proposed next, not chosen by
the owner); the data element's landing after the Stripe sample.
