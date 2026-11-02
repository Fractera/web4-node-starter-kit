# 622 — The old repository names in templates and elements point to the new one

## Where it came from — the owner, 2026-11-02, verbatim
«мы изменили название стартового репозитории. Теперь он у нас называется по-другому пожалуйста найди все старые названия при помощи
функции найти заменить чтобы ссылки вели на новый проект сразу во всём проекте». Choice window: «lagrix.dev сейчас, остальное — план».

## What changed on GitHub (measured 2026-11-02)
- `Fractera/web4-node-starter-kit` is the ORIGINAL repository with the stars (GitHub id 1221835075, created 2026-04-26, 60 stars,
  10 forks), formerly `Agentic-Engineering-Infrastructure`. Its `main` got merge `6f45798` (parents: its own history `c2dc532` + the
  former core history `de4322c`), then the owner renamed it.
- The former core repository (id 1375932938, 0 stars) is now `Fractera/web4-node-starter-kit-2-11-2-2026`. 🛑 Every old name —
  `fractera/web4`, `fractera/WEB4`, `fractera/agi`, `fractera/AGI` — now redirects to THAT archived copy, not to the original.
- GitHub reports the parent of a fork of the original only as `Fractera/web4-node-starter-kit` (three real forks checked): with the
  old name in `scripts/check-origin.mjs` every install from a fork was refused.

## Done already (2026-11-02)
- Core `929f06c`: new README, `check-origin` original = `fractera/web4-node-starter-kit`, instruction section 2 + reseal, site-rules,
  repo-owner, specimen, translation-debt; `origin` of this core switched; `logs/origin.json` (author mark) moved to the new slug.
- Lagrix protocol `lagrix-dev/lagrix` `d1dde06` (README en/ru). Element lagrix `a31cb01` on `lagrix-dev/lagrix-home-page`; live
  lagrix.dev: new link 5× on /en and /ru, 2× in docs, 5× in llms-full.txt, old 0.

## What is left — inventory (`git grep` of old names, 2026-11-02)
| Where | Files | What |
|---|---|---|
| templates: custom (`fractera-custom-item-starter`), native, root | 5 · 3 · 5 | skill `project-origin` (+ skills README row), `lib/a2a/guard.test.mjs`; root: help desk fact 7 and rule 41 (`fractera/agi`), widget README |
| built-in elements in `WEB4-ITEMS/core/` | auth 3, blocks 4, cache 3, config 3, data 3, design 3, graph 5, memory 3, storage 3, stripe 3, vectors 3 | the same skill copies and test |
| element root (`WEB4-ITEMS/user/root`) | 5 | as the root template; its help desk is on throughsongs.com |
| old clones in the federal `/code` | easy-starter 15 (L1, frozen), next-starter 3, ai-browser 2, memory 3, stripe 3, graph 7, blocks 1 | the federal layer is closed — the owner decides whether these are touched at all |

## How
1. Templates first: replace in the three templates, guards and `prebuild` green, new tags, `npm run template` (skill
   `release-template`), pins in `WEB4-ITEMS-REGISTRY/*.json`.
2. Rollout to the elements through the template release; root's help desk texts — then `pages:refresh` + `static-copy.mjs`.
3. Proof: `git grep` of the old names is empty in every repository except comments that explain the rename; a fresh clone of the
   original + `check-origin` on a real fork prints `===ORIGIN_OK===`; throughsongs.com home serves the new Fork link, old 0.

## Known limits
- 🛑 Defect found on the way: the outbound A2A guard (`lib/a2a/guard.mjs`, rule `secret`) denies a link to a FILE of the original
  (`https://github.com/Fractera/web4-node-starter-kit/blob/main/README.md`) — the long path reads as a secret; the repository link
  without a path passes. The guard test therefore keeps the old sample URL; the fix is a separate decision.
- A redirect cannot be moved: the old names stay with the archived copy while it exists. Deleting it turns them into 404 (not into
  redirects to the original). The owner may put a one-line README into the archived copy pointing to the original.
- The skill `explain-this-project` of the core describes the older PolyForm product; only its URL redirects correctly — the skill
  text itself is stale and is not part of this step.

## Only by the owner's word
Each template tag and the rollout spend build time; the old `/code` clones are outside the node.
