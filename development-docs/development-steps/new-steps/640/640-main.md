# 640 — The node's own skills: a skill the person liked is kept, found first, installed; the whole skills chain proven live

## 1. Retelling and decisions

The owner, 2026-11-04 ~04:20 UTC, verbatim — in `current-steps.md` (NOW). The core of it: «когда пользователь говорит например смотри
наш интересный навык может быть мы будем его использовать … должна запускаться какая-то цепочка которая позволит этот навык установить в
хранилище навыков внутри собственного узла и потом в дальнейшем использовать его как обычный навык … его стоит разместить каким-то
образом чтобы он был приоритете над основным числом других навыков. Также я хочу чтобы ты в рамках отдельного шага проверил
устанавливаться … как они устанавливаются архитектуры и потом работают мы ещё не проверяли … хочу чтобы ты мне подтвердила что
литература полностью готова к запуску на одного пользователя».

Retold:
- 628 already finds a skill the person names and judges it; its only exit is «hand it to an element now». Missing: **keep it for later**
  — a store of the node's own skills, beside Fractera's catalog, searched **first**.
- Found while reading (2026-11-04): **a catalog skill has no install path at all.** `skills_find` proposes catalog skills, but no command
  fetches one from Fractera's store (`Fractera/fractera-skills-store`) or from GitHub by the same fingerprint into an element — the
  decision of 2026-11-02 («У Fractera + по требованию») was planned, never built. So «found» is proven, «installed» and «works» are not.
- The live check is a separate substep (640-4), as the owner asked; after it the honest answer on «ready for one person».

I assume that:
- «the node's own store» lives on the node (`data/node/skills/own/`, outside git) — the person's choice is theirs, not Fractera's;
- «priority» means: the person's own skills are searched first and shown above the catalog's when they fit the request, named «your
  skill — you suggested it on <date>»; they are never forced into an answer they do not fit;
- judging a suggested skill stays as in 628 (Claude Haiku by `claude -p` on the person's subscription, one repository on their word —
  inventory 638-1 #6); the vectors are the node's local `embeddings` (no key, no model cost);
- a skill with scripts still needs a separate yes, at keeping and at installing.

## 2. What is reused
- 628: `scripts/catalog/adopt.mjs` (`findCandidates`, `judgeRepository`, `handSkill`), `lib/agent-kit/skills/suggested.mjs`
  (`suggestedDir`, `idOf`, `archivePathOf`), the door `app/api/skills/suggested/route.ts`, the skill `adopt-suggested-skill`.
- 627: `lib/agent-kit/skills/catalog-index.mjs` (`embedTexts`, `loadIndex`, `searchIndex`, `findInCatalogFile`, `THRESHOLD`),
  `scripts/catalog/build.mjs` (`cardPieces`), the store's `manifest.json` (git blob of every file, pinned commit in `release.json`),
  `scripts/catalog/lib.mjs` (`folderShaOf`, `blobShaOfBuffer`), the MCP `skills_find` (`lib/agent-kit/skills/mcp.mjs`), the door
  `POST /api/skills/catalog`, memory's `findSolution`.

## 3. Known limits — what must not break
- Foreign skills go into a project only, never globally, with `SOURCE.md` (section 6); a skill is installed only if its folder's
  fingerprint equals the checked one — from any source.
- Scripts — only with a separate yes (2026-11-02).
- The core never reads or edits an element's code: the element's own agent installs (628, «Агент элемента»).
- A narrow `tsc` over the changed doors and shared modules (the 627-4 lesson).
- The live check: at most three phrases from the owner.

## 4. Observable results
- «смотри, интересный навык <link>, может пригодится» → judged → after yes kept: `npm run skills -- own` lists it with its card.
- A request it fits → `skills_find` shows it FIRST, «ваш навык»; an unrelated request does not show it.
- `npm run skills -- hand <source@skill> --to <element> --send` installs ANY found skill — own, or catalog from Fractera's store (GitHub
  as the backup) — into the element through its own agent; a changed file is refused.
- Live on the owner's node: kept → found first → installed by the element's agent → used in the element's task.

## 5–6. Substeps, order, address (all in the core `Fractera/web4-node-starter-kit`, `main`)
| # | Result | Rests on |
|---|---|---|
| 640-1 | keep: a judged skill into the node's own store with its vectors (`skills -- keep`, `skills -- own`) | 628 |
| 640-2 | priority: `skills_find`, the core's catalog door and memory search the own store first | 640-1 |
| 640-3 | install: `skills -- hand` for an own or a catalog skill (Fractera's store, GitHub backup, fingerprint) | 640-1 |
| 640-4 | the live check on the owner's node, then the verdict on «ready for one person» | 640-2, 640-3 |

## 7. Substeps
`640-1.md` … `640-4.md` in this folder.

## 8. Acceptance of the plan
Stages 1–7 present; every substep names what is built, done, two proofs from different planes with a negative control, what it rests
on and what is not in it; 4 substeps.

## 9. The owner's approval
2026-11-04 ~09:50 UTC, in the choice window on the four substeps and the hole found (a catalog skill has no install path): «Да, делай
(Рекомендую)».

## Not in this step
627-6 (Fractera's catalog update); new skills shipped with the templates; any change to the sealed instruction (the skill
`adopt-suggested-skill` carries the new road; a line in section 8 only if the owner asks for it).
