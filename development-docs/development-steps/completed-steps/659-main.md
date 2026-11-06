# 659 — the languages of a page's data: `check-i18n` green in every element, a guard over `_data/<lang>.json` in every build (closed)

**The owner, 2026-11-06, verbatim:** «fix it» (on two findings of 654-7: `check-i18n` red in every element before any edit — it looked for
six dictionaries that exist only in the core; no guard compared a page's card lists across languages). The scope by his word in the
window: «Все 15 сейчас (Рекомендую)» — both templates, root and the twelve natives; ru's `bid` in auth, config and design aligned to en's.

**What the step gave.** Every element's `npm run check:i18n` → `===I18N_OK===` (the six core-only dictionaries out of its list, one 🪦
line naming them; it stays out of `prebuild`, as in the core — its count rule would fail a node that enables only English). A new guard
`scripts/check-data-langs.mjs` runs in every element's `prebuild` after `check-content` (`npm run check:data-langs`): each `_data/<code>.json`
against `en.json` — the same kind at every point, the same keys, the same list lengths, the same `id` / `bid` / `kind`, a non-empty string
where en has one; a key blank on its side may be absent on the other. It names the gap: «.rootHome.cards: в en 6, здесь 5 — нет personal».
The skill `use-languages` of each element names it among the guards.

| Repository | Commit | Tag | CI three-os |
|---|---|---|---|
| custom template | `35e2a94` | v0.3.160 | 42135700768 |
| native template | `5163e63` | v0.1.39 | 42135709831 |
| root | `4026bbd` | v3.0.26 | 42135719535 |
| auth (8 ru bids) | `3fc2ed0` | v2.4.14 | 42135730084 |
| data | `45b376b` | v2.2.7 | 42135740185 |
| storage | `a2986f1` | v1.1.27 | 42135748630 |
| vectors | `0398a6f` | v1.2.10 | 42135760581 |
| embeddings | `6fe6f93` | v0.1.8 | 42135767554 |
| config (26 ru bids) | `244698d` | v1.2.23 | 42135777873 |
| design (20 ru bids) | `ac56ada` | v1.1.23 | 42135789502 |
| graph | `f127d36` | v1.2.9 | 42135799055 |
| cache | `3bebb35` | v0.1.17 | 42135808794 |
| memory | `6738d44` | v2.2.27 | 42135819072 |
| stripe | `097696e` | v1.3.17 | 42135827534 |
| blocks | `d7d52e1` | v1.4.20 | 42135836952 |

The core's pins `e9a12d44` (its CI run superseded by `febeb731`, green 42137150686). Delivery: the owner's «sync was complited» → the
fork at `febeb731` → `npm run node:update` → `ядро 19e4f2aa`.

**Proven.**
1. *The lab and CI* (scratchpad `659/apply.mjs` over each clone at its pinned tag): `check-i18n` `===I18N_OK===` in all 15; the guard and
   `check-block-ids` OK in all 15; the full `prebuild` exit 0 in the nine clones with dependencies; no other file changed. Negative controls
   on a copy of root's cards — a card removed («в en 6, здесь 5 — нет personal»), an id renamed, a title emptied, a block's `kind` changed —
   each `===DATA_LANGS_FAILED===`, exit 1. Before the fix the guard itself failed in auth (1 file), config (2), design (2): only `bid` differed.
2. *The owner's node* (`~/fractera-dev/_tools/proof-659.mjs`): before the delivery all 13 running elements `check-i18n` FAILED (6) and no
   `check-data-langs`; after → `===PROOF_659_OK=== 13 elements` (each at its new tag, both guards green in its folder, health 200; stripe
   off by the node since 2026-11-05, by design).

**Mistakes.** `check-block-ids` stated the rule «у одного блока на разных языках один `bid`» but applied it only on `--fix`, never
compared — three elements carried other addresses in ru for months; a rule that a guard only repairs is not a guard. The first lab pass
treated an absent `keywords` as a gap — five template pages have `keywords: ""` only in en; decided: a blank key may be absent.

**Evolution of skills.** `use-languages` of every element names `check-data-langs` among its guards. Nothing else to improve.

**Not in it:** `check-i18n` in `prebuild`; the core's own pages (no `_data/<lang>.json` there); translating the template's empty `keywords`.
