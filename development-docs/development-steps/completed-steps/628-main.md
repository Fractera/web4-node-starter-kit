# 628 — A skill the person suggests: found, judged, handed to the element's own agent (closed 2026-11-03)

## The owner, verbatim
«я услышал бы рекламе про навык, например replica-skill для продвинутого реверса инжиниринга с дополнительными возможностями. И должен
уметь найти этот навык дать ему оценку и добавить в проект пользователя это как ты это делаешь сейчас ну может быть с пометкой навык по
предложению пользователя»; «уточни пожалуйста видели ли ты рекламу этого навыка не можешь ли дать ссылку на этот ролик или пост? Если
ты посчитаешь нужным потому что можно найти навыки которых много с похожим названием»; who installs — «Агент элемента (Рекомендую)»;
«go to finish non stop , not ask me i go to sleep».

## What the node does now
`npm run skills -- adopt "<name or link>"` finds the candidates (the node's catalog cards, `npx skills find`, GitHub's search by
relevance and by stars); when more than one repository answers, it lists them and tells the agent to ask the person for the link to the
ad, post or repository. A link or `--pick` judges the repository: trust signals (age, last update, commits, how fast the stars came),
every skill through the 627 marker (whole folder, scripts read, risks, value, use, quality, partners' audits), the overlap with the
node's own skills and its skills base. `adopt-hand <owner/repo@skill> --to <element> [--send]` packs the checked copy — only if its
folder fingerprint is unchanged — with a `SOURCE.md` («Origin: suggested by the person» and their words) and gives the element's own
agent the task; the agent downloads it from `GET /api/skills/suggested` with the node key, checks the sha256, unpacks into its
`.claude/skills/` and commits. The main agent's skill `adopt-suggested-skill`; the instruction names it (sealed `ed81462013fc`).

## Substeps
628-1 GitHub facts without `gh` · 628-2 `adopt` · 628-3 `adopt-hand` and the door · 628-4 the skill and the instruction —
`628-1.md` … `628-4.md`. Commit: see the summaries (one core commit closes the step with this file).

## Limits
- Not run live on a node: the door and `--send` need the owner's node updated (Sync fork + core rebuild) and an element's agent to take
  the task; proven offline (archive, sha256, task text, the refusals).
- The overlap is a word count: `replica-design` ↔ `extract-design-system` (0.27) was found; `replica-recon` ↔ the skills base's REA was
  not — say it from knowledge when the counter is silent.
- The marker is not deterministic on borderline skills: `replica-architect` came «skip» in one run and «ideas» in the next.

## Mistakes
- The first search took 5 GitHub results sorted by stars and lost the second repository of the very same name (ahmiilabs, ★4) — the
  name looked unambiguous and the command did not ask. Fixed: relevance and stars, 10 each, merged.
- A link gave «Jakeschincariol», skills.sh «jakeschincariol»: two judgements, 22 cards for 11 skills (one folder on macOS). Fixed: one
  lower-case spelling for every GitHub name.

## Evolution of skills
- New: `adopt-suggested-skill` (core). Nothing else to change.
