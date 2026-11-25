# Task for the creator agent (Mac): the native Mini App (853) never reaches a native element born on a node (Roma, 2026-11-25 17:19 UTC)

From the main agent of fractera.ai (core 0e38b2b5). No keys or personal data. Nothing was changed on the server.

## Symptom (Roma's words)

«ты мне уже отмечаешь как выполненное то что у нативного элемента есть мини приложение Telegram, но так как я его не вижу в маркетплейсе
возникает предположение что это обновление действует только у нового нативного элемента». The marketplace (lidt5, born on this node
from the native template) shows no «Приложение» button in its bot.

## Measured

- The core's door: `GET /api/node/tg-app?lang=ru&el=lidt5` → **404**; the same for a preinstalled native, `el=auth` → **200**.
- `logs/tg-menu-elements.json`: `lidt5 {"at":"2026-11-25T09:12:51.493Z","ok":true,"state":"default","host":null}`. The menu button was
  refreshed at the update and set to the plain menu.
- The registry entry: `{"id":"lidt5","kind":"user","born":true,…}`. Its passport, read through `lib/web4-items/element-props.cjs`
  `readElementProps(dir)`: **`elementType: "native"`**. The card says the same: «lidt5 · f2f-marketplace · custom element … born from
  fractera-native-item-starter v0.1.81».

## Cause

853 decides «native» by the registry `kind`, not by what the element is:
- `lib/node/tg-menu.cjs` `isNative(id)`: `e.kind && e.kind !== 'user'`;
- `lib/node/tg-app/state.ts` `elementAppOf()`: `if (!e || e.kind === "user") return null`.

Every element born on a node is kind `user`, natives born by «Создать нативный элемент» included. Your own 857 measurement says so:
«Every element born on the node is registry kind `user` — natives born by «Создать нативный элемент» too (cck60 here, lidt5 there)».
So the core treats a born native as custom: no core Mini App (404), and the custom path looks for its own
`app/[lang]/(protectedLayer)/tg/_data/menu.json`, which the native template does not have. Result: the plain menu. The native Mini App
reaches only the PRE-INSTALLED natives (kind `core`), and on this server none of them has a bot. **So it is not «only new natives». No
born native gets it, new or old.**

## Fix

- One helper, for example `isNativeElement(id)` in `lib/web4-items/`: the registry `kind !== 'user'` OR the passport `elementType ===
  'native'` (CLAUDE.md §3: «the passport field `elementType` says which one an element comes from»). Use it in `tg-menu.cjs isNative`
  and in `state.ts elementAppOf`. `nativesOf()` lists the node's STANDARD natives. Decide on purpose whether a born native belongs there
  (probably not).
- Grep the core for other `kind !== 'user'` / `kind === "user"` tests that mean «native vs custom» rather than «preinstalled vs born»,
  and choose per place. The wall (`isCustomEntry` → kind `user`) rightly walls a born native, and that must stay.
- After the update: `npm run tg-app -- menu lidt5` (or the update's `refreshAll`) sets its button. No element change is needed.

## Proof

1. `GET /api/node/tg-app?el=<born native>` → 200 with its three parts (token use, its site, the chat), locked by its bot's signature.
2. `logs/tg-menu-elements.json` → `"state":"mini-app"` for it, and in its bot the «Приложение» button opens the page (Roma's eyes).
3. Negative: a born custom element without `/tg` keeps the plain menu, and a preinstalled native still gets 200.
4. `scripts/tg-app.test.mjs`: a born native (kind `user`, passport `native`) case beside the existing negative.

—
No keys or personal data in this file.
