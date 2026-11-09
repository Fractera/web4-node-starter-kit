# 712 — The core's «Design» and «Site settings» tabs: a remote control over the element's own config files (closed 2026-11-09)

The owner, 2026-11-09, verbatim: «в обоих случаях и для CONFIG и для дизайна мы должны избавиться от внешних страниц которые уводят нас из
вкладки работы с элементом и перенести дизайн страницу на ту самую вкладку» · «ядро всего лишь навсего представляет доступ к … настройкам
которые сейчас существуют в элементе. То есть это удалённый пульт управления … Если пользователь добавил 10 и убрал из 10 -5 то значит …
новые 10 не должны появляться а из Старых 10 … редактировать только пять». Plan approved: «go to code non stop to finish».

## Commits
- Template fractera-custom-item-starter: `4f0e697` (712-1 key doors), `d01c3b6` (dotted translations flat), `5fab11d` (routes guard) —
  released v0.3.180 (tag pushed with the author's gh; the release command wants the node token, absent in the workshop), CI three-os green
  after a rerun (the ubuntu job was never acquired on the first run — GitHub's capacity).
- Core: `bffc0408` (712-2..4), `077ded2f` (pin custom v0.3.180), `7bb37526` (tab descriptions), CI green; on the node as build 3db6ffe2.
- Root starter: 706-3..712 cherry-picked (`9e738a5`, root home and the starter banner kept), v3.0.41, pinned in the core `4c547d21`.

## What was built
- Element key doors `/api/settings/{design,app,features,brief}`: values + the element's own declaration (JSON Schema of its config
  schemas; `nav`, `languages` now declared) + merge patch (foreign keys kept, url refused, 409 while linked to CONFIG, repaint, no build).
- Core door `/api/node/element-settings`: flattens the declaration into path:type, prunes every write on the server to declared paths of
  the right type; older template / silent element / wrong key / link — states in words.
- Design tab: brief → 711 panel → fine tuning (the template's newest editors on a save context); a platform window before a pin.
- Site settings tab: basics, search, meta and media, languages, header, footer, cookie banner, switches — the element's own editors ported,
  each section only when declared; linked → read-only values. Outbound link components removed.

## Proofs
- Plane 1 (no model): template HTTP fixture 16/16 (dev server, temp copies; no key and a wrong key 401, foreign keys kept, 409 linked);
  core guard `check:element-settings` in the prebuild (removed five, added ten → five shown; retyped hidden; prune).
- Plane 2 (live, node build 3db6ffe2): s8y6x (v0.3.171) → template-older ×4; stand qfx9w (v0.3.180) → 4 files read (50/101/12/7 fields);
  primary #b4532a appeared in the live page CSS with no build, then reverted; themeToggle off → gone from the page → back; an undeclared
  key pruned; PATCH from the temporary address 403 (GET read-only there, the node's law for that address); eyes on both tabs — no link
  out, console clean.

## Mistakes
- The template release needed the node's token; the workshop pushes with the author's gh — done by hand after the tag.
- Deleting the old catalogue loader broke `designSection` (found by tsc) — the editors got a save context with two providers.
- The template's routes guard holds a closed list of doors — three rows added with the owner's words.
- Cherry-picking onto root dropped `starterBannerStrings` outside the conflict hunks — found by tsc, restored.

## Debts named
- Images and icon sets are not carried by the remote control (they live in the element's own storage).
- Files over 250 lines copied as the template has them: design-colors 306, nav-editor 491, languages-editor 389.
- `check:i18n` fails on 44 old dictionaries before and after this step.
- The core instruction still says «first a ready block» (§6) — against the owner's decision of 706; a change of §1–8 is the owner's word.

## Evolution of skills
- release-template: say that in the author workshop the push goes with the author's gh when the node has no token (one line, owner's call).
