# 804 — one question at an element's birth instead of the node's type — summary

Closed 2026-11-19 (live on this computer 17:50 UTC). Repository: the core (`main`), commits 5a06d498 (97 files, seal 35c09af1836a),
07715f9e, 0c79da6e, 73c44a23, 426b2c00; custom template workshop 5fca218 → released in v0.3.219 (a340bcf, pinned ee11262f).

## The owner's words

- 16:26: the node switch (one owner / many) and the birth question duplicate each other — keep in the core's registry which elements
  are linked with the core and which are not; «no first separate logic, go to plan».
- 16:40: the preinstalled native elements and root are linked with one owner by default.
- 16:42: the agent and its Telegram bot know whose element it is; an own app loads a slightly different instruction and passes an
  acquaintance step with its owner; nothing in CONFIG may change the kind later.

## What was built

- 804-1 `lib/web4-items/element-app.cjs` — `appOf(id)` from the registry field `app: project | own`; native and root → `project`.
- 804-2 the birth window asks «Чем будет этот элемент?» (shadcn RadioGroup); `item-birth --app project|own`, `create` requires `--app`;
  the sign-in organization only for `own`.
- 804-3 readers per element: wallet (`oneWallet(element)`), browser (`own-app`), parts index and `tools/take`, the tree context,
  `/api/node/projects` rows carry `app`.
- 804-4 the node switch gone: the Passport card, `/api/node/type`, `npm run node-type` and its skill; migration
  `lib/migrations/804-4-element-apps.mjs` (legacy factory → `own`) drops `nodeType`; `check-microservices` refuses it back.
- 804-5 CLAUDE.md §1/3/5/7/8, know-the-architect, create-element, help-in-browser, the glossary terms.
- 804-6 the CONFIG link is a state line; the links door deleted; `look --own|--linked` refuses.
- 804-7 an own app knows its owner: `own-app.md` part in `modes.cjs`, the brief gives an own app its own picture (or a first-meeting
  line) instead of the architect's, recall leaves own apps out for the main agent; the custom template's skill `know-the-owner`; the
  kit bot's `ownAppBot` words on admission (agent-kit:update of 12 groups).

## Proofs

- Wire: `/api/node/projects` rows carry `app` (11 × project), no `nodeType`; POST `/api/node/type` 404; PATCH
  `/api/architect/items/root/links` 404; tests element-app 8 ✓, own-app 7 ✓ (with negatives).
- Eye (0 console errors): logs/eyes/2026-11-19T17-51-53-565Z.png (the birth question, «Родить» locked), 17-52-40-710Z.png (own app →
  the source choice), 17-52-47-975Z.png (/ru/architect without «Режим работы приложения»), 17-53-23-217Z.png (root «Настройки сайта»:
  the state line, no switch).

## Mistakes on the way

- `modes.cjs` required `element-app.cjs` by a working-folder path — the 17:38 core build failed; relative path 426b2c00.
- The parts map was rebuilt before the last interface edit (the wallet part 0c79da6e) — a map is built after the last edit.
- The shadcn CLI installed an npm package «cn» with the RadioGroup — reverted, the import fixed to `@/lib/utils`.

## Left open

- The server: the core push (window c8b2aa2b, his paste) and ONE server update (runs migration 804-4 there: Marina → `own`), then his
  test (804-8).
- New phrases to agree with the owner: the wallet line, the glossary texts, `ownAppBot`.
- «Пока связь включена…» in the site settings implies a switch → step 793.
- Native and root templates still carry the old people line of the element instruction — their next release.
- «Запомни» said to an own app goes to the node's deep memory (cross-owner) — a later step.
