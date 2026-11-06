# 659 — the languages of a page's data: `check-i18n` of every element green, a guard over `_data/<lang>.json` in every build (plan)

## 1. Retelling and decisions

Found by 654-7 and told to the owner on 2026-11-06: «`check-i18n` во всех элементах красный ещё до моих правок: он ищет 6 словарей страниц,
которых в них нет. В prebuild этого сторожа нет»; «Ни один сторож не сравнивает списки карточек на двух языках. Совпадение en и ru я
проверил отдельным скриптом». **The owner, 2026-11-06, verbatim:** «fix it».

**Retold:** every element's `npm run check:i18n` is green again, and a build of any element fails when a page's `_data/<lang>.json` is not
the same page as its `en.json` — a card, a section, an item missing, renamed or emptied in one language.

- **D1 — the list of `check-i18n`.** The element copy (one file in the custom template, root and every native, measured identical) lists
  six dictionaries of the core: the blocks catalogue, the architect layer, the architect home, the GitHub tab, administration users, the
  users table. They are removed with one 🪦 line naming them; the core removed the last two in 652-1 for the same reason.
- **D2 — `check-i18n` stays out of `prebuild`, as in the core.** Its count rule — a dictionary holds exactly the enabled languages —
  would fail every element's build on a node that enables only English, against the owner's rule of 2026-09-21 (the head of
  `check-lang-delivery`: extra languages in the source are not a problem); with a third language enabled it would fail them all until
  every dictionary is translated. It stays a person's audit tool, `npm run check:i18n`.
- **D3 — a new guard `scripts/check-data-langs.mjs`, in `prebuild`** (after `check-content`), `npm run check:data-langs`: every folder
  `_data` under `app/`, each `<code>.json` against `en.json` — the same kind at every point, the same object keys, the same list
  lengths, the same `id` / `bid` / `kind`, a non-empty string where en has one; a key blank on its side (`""`, `null`) may be absent on
  the other. Words are not compared; neither is the number of languages (a language without a file gets English). It names what is
  missing: «.rootHome.cards: в en 6, здесь 5 — нет personal».
- **D4 — the scope:** the two templates and every element of the owner's node: `fractera-custom-item-starter`,
  `fractera-native-item-starter`, `fractera-root-starter`, and the twelve natives — auth, data, storage, vectors, embeddings, config,
  design, graph, cache, memory, stripe, blocks. Files: `scripts/check-i18n.mjs`, `scripts/check-data-langs.mjs`, `package.json` (the
  `prebuild` line and `check:data-langs`); in an element whose skill `use-languages` names the guards — that line. Custom elements of
  other nodes take it with their template update.

## 2. What is reused

`scripts/microservices-boundary.mjs` (`isForeign` — every tree walk calls it); the guards' pattern of the template (`===…_OK===` /
`===…_FAILED===`, exit 1); skill `release-template` (`npm run template -- clone|release|pin|rollout`, the rule «each element one commit of
only those paths, its next patch tag, a push, its pin»); `~/fractera-dev/_tools/` and the scratchpad `659/` lab.

## 3. Known limits

- A guard in `prebuild` fails the build: it must be green at HEAD in every repository before its release — measured in the lab on the ten
  cloned ones; auth, config, design, cache and the native template are cloned and measured before their commit.
- A change of an element's `package.json` and scripts rebuilds it on `node:update` (thirteen elements on the owner's node; the stores and
  the sign-in restart one by one, as on every update).
- A new language file with another structure on purpose (a page different in Russian) would now fail: the page then needs its own
  `en.json` structure, never a silenced guard.

## 4. Observable results

- `npm run check:i18n` in every element → `===I18N_OK===` (today `===I18N_FAILED=== проблемных словарей: 6`).
- `npm run check:data-langs` in every element → `===DATA_LANGS_OK===`; ru without root's card `personal` → `===DATA_LANGS_FAILED===` with
  «нет personal», and the build stops.
- CI three-os green on every repository; on the owner's node every element rebuilt by `node:update` (its output kept in the
  scratchpad: the installer's own lines per element), `npm run check:data-langs` and `check:i18n` in each element's folder on the node
  green, and its page answers.

## 5. Substeps

| # | Substep | Repositories |
|---|---|---|
| 1 | `659-1` — the custom template and root | `fractera-custom-item-starter`, `fractera-root-starter`; the core's pins |
| 2 | `659-2` — the native template and the twelve natives | `fractera-native-item-starter`, auth, data, storage, vectors, embeddings, config, design, graph, cache, memory, stripe, blocks; the core's pins |

Each: the files above, the whole `prebuild` and `tsc` in the clone, a commit in English, the next patch tag, CI three-os, the pin. One
delivery for both: the owner's «Sync fork» → `node:update` → the proofs.

## 6. How it is proven (two planes, a negative control)

1. **The lab and CI:** the two guards at the release tag of every repository, verbatim; the four negative controls on a copy of root's
   cards (a card removed, an id renamed, a title emptied, a block's `kind` changed) → each `===DATA_LANGS_FAILED===`, exit 1; CI green.
2. **The owner's node:** after `node:update` each element at its new tag (the registry and `git describe` in its folder), the two
   guards run in its folder on the node — green (they print only problem lines and the marker), its page or health answers 200; root's
   six cards still in place (en, ru).

## 7. Not in it

`check-i18n` in `prebuild` (D2); the count rule of `check-i18n` itself; the core's own pages (no `_data/<lang>.json` there — measured: 0
files); translating the template's empty `keywords`.

## 8. The owner's approval

2026-11-06, in the choice window, verbatim: «Все 15 сейчас (Рекомендую)» — the question named the fifteen repositories, the six
dictionaries out of `check-i18n`, `check-data-langs` in `prebuild`, ru's `bid` in auth, config and design aligned to en's (found by the
lab: only `bid` differs there, against `check-block-ids`' own rule «у одного блока на разных языках один `bid`»), and thirteen elements
rebuilt by `node:update`. Not chosen: templates and root now with the natives at their next release; the guard without `bid`.
