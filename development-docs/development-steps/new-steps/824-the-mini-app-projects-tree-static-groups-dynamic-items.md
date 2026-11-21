# 824 — the Mini App's projects: sections and groups are a static tree of folders with a README each; items are dynamic data

State: GO 2026-11-21 12:02 UTC — the owner's «Делай реализацию» (Telegram 494). Custom template only; the core is not built.

## The owner's words (verbatim)

- Telegram 490 (11:57): «мне понравилось то что ты сделал дерево на маршруте Telegram а то что касается страниц которые построится из
  этого дерева на уровне публичных или приватных … это уже выбор агента программиста и пользователя».
- Telegram 492 (12:00): «если мы захотим добавить новый тип то тогда придётся сделать сборку и важно чтобы после добавления этого типа
  автоматически обновился мини приложение Telegram … вкладки такие как соцсети Instagram соцсети YouTube это динамические маршруты …
  добавить например в соцсети Twitter то сборка не нужна? … уменьшить кэш до 30 секунд».
- Telegram 494 (12:02): «Делай реализацию помню что я за то чтобы только последние элементы каждого маршрута оставались динамическими …
  а группы и подгруппы были статическими потому что в каждом из них мы должны разместить кроме прочего файла readme.md чтобы компактно
  для агента искусственного интеллекта описать что сюда можно класть а что нельзя».

## Design

- The source is a tree of folders: `tg/_projects/<section>/{meta.json,README.md}` and `tg/_projects/<section>/<group>/{meta.json,
  README.md,items.json}`; `tg/_projects/README.md` explains the tree. `_` keeps it out of Next's routes.
- **Static** — sections and groups: `scripts/tg-projects.mjs` compiles their meta.json into `tg/_data/projects.json` (no items), imported
  at build; the prebuild runs it with `--check` and stops when the tree and the file differ. A new section or group = a folder + meta.json
  + README.md + `npm run tg:projects` + a build; the Mini App, its menu.json sections and the core's «Рабочий процесс» follow it.
- **Dynamic** — items: `items.json` of each group read at run time from the element's folder (`ELEMENT_DIR`, as the page tree); Twitter
  in «Соцсети» = one line in `social/items.json`, seen within 30 s, no build. An item without its group in the static catalog is not drawn.
- READMEs are for the element's agent, compact: what the folder is, «put here», «not here — goes to <neighbour>», how work is tagged
  (`project` in a site page's meta.json, `project` of a calendar entry). A page that grows from an item is the agent's and the person's
  choice — the public site or «Администрирование» (490).
- Cache: `revalidate = 30` on `tg` and `admin` (one person, the owner's 492); the public layer stays 300 (guests, the Cloudflare copy).
- The element skill `telegram-mini-app` says it all: read the group's README first; an item — items.json; a group — folder + build.

## Test checklist (shown before the code)

- T1 the tree: 4 sections, 46 groups, each folder with meta.json and README.md, items.json valid; the generated catalog equals the tree
  (negative: a group without README fails; a group folder added without regenerating fails the `--check`).
- T2 dynamic items: an item added to items.json is in `projects()` with no regeneration (negative: an item of an unknown group is not).
- T3 T4 of 821 stay green (counts from site pages and the calendar).
- T5 production: `next build` RC=0, `next start` with ELEMENT_DIR; add «twitter» to social/items.json → /ru/tg/projects/social shows it
  within ~30 s, no build (negative: before the line it is absent; /ru/tg/projects/social/nope 404).
- T6 eyes at 390 px: projects, social with Twitter; no console errors.
- Release custom v0.3.224, pin in the core.

## Done 2026-11-21 12:03–12:15 UTC

- Workshop commit d3322e8 → custom **v0.3.224** on GitHub (tag 629effd1; Roma's gh key for one run, his 426), pinned in the core 74f0eff3.
- Proofs: `npm run test:tg-projects` 18/18 (T1 tree + negatives: no README, a group without `tg:projects`; T2 items at run time +
  negatives: bad slug, no en title, a duplicate, a broken file; T3/T4 counts, «Администрирование» counted); tsc RC=0; the whole prebuild
  RC=0; `template release --dry` green. Production: `next build` RC=0 (/[lang]/tg and /admin 30s), `next start` 24711 with ELEMENT_DIR —
  /ru/tg/projects/social without «twitter» (negative) → one entry in social/items.json at 12:08:44 → 12:09:24 «X (Twitter)» drawn, its
  item page 200, no build; /social/nope 404. Eyes 390 px, no console errors: logs/eyes/2026-11-21T12-09-35-836Z.png (social with
  Twitter), 12-09-41-455Z.png (projects, dark). items.json restored, the server stopped.
- Not done: rollout into existing elements (none on the Mac besides root, which never gets the Mini App — 484); the core push to Fractera.
