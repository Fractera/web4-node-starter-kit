# 652 — the two findings of 651 (closed)

**Commits:** `Fractera/web4-node-starter-kit` `f7d39614` (check-i18n, the place door, the widget), `9fd0c437` (the attention door);
`Fractera/fractera-root-starter` `acb124f` tag v3.0.22 and its revert `838b378` (main equals v3.0.21; v3.0.22 is pinned nowhere). Delivered
to the owner's node: fork `aifa-agi` fast-forwarded twice, `node:update` → core `86df0b36`, then `65bdef40`.

**The owner, verbatim (2026-11-05):** «to do 1 and 2 , after we going to speach about 650».

**652-1 — check-i18n.** Two entries named dictionaries of `(protectedLayer)/(admin)/administration/users`, a folder the core no longer
has — the guard failed «НЕТ ФАЙЛА» on every node. Removed; the seven `components/node-state` dictionaries added (the guard had never
seen them — the words of 651 went past it); three one-line `export type … = { … }` written out, the guard reads only the multi-line form.

**652-2 — 403 in the console on the temporary address.** Two doors, not one: `/api/node/place` refused even GET — now it reads there and
keeps the write lock, the widget's choice is disabled on the temporary address; `/api/node/attention` refuses there on purpose (terminals
and previews are not for a forwarded link) — now it answers `{ ok: true, terminals: [], previews: [], temporary: true }`, nothing shown
as before.

**Proofs.**
1. `check-i18n` → `===I18N_OK=== все словари полны`; with `ru.even` removed → «не хватает: ru.even» (restored). Core `tsc --noEmit` exit 0;
   `check-api`, `check-static`, `check-dialogs`, `check-shell-kits`, `check-steps`, the characters scan — OK; the prebuild inside both
   `node:update` runs — green.
2. The owner's node, temporary address: before — `403 GET …/api/node/attention?lang=ru` (and `/api/node/place` 403 by curl); after —
   Playwright on `/ru/architect` and `/ru/architect/passport` lists no response ≥ 400; `/api/node/place` 200; the attention door on
   localhost `{"ok":true,"terminals":[],"previews":[]}`, on the temporary address the same with `"temporary":true`.

**Mistake.** I first put the fix into the shell kit (`components/shell`, root v3.0.22 + the core's copy). `node:update` runs the build
guards before it installs elements, so `check-shell-kits` would compare the core's new copy with the old installed root and roll the
update back on every node. Caught before the core got it; root reverted, the fix moved to the core's door.

**Owed:** a shell change cannot ride with its core copy through `node:update` (guards before elements) — a design question for the owner,
not opened.
