# 637 — The core's code stays the original's on a person's node; a switch «Разработка ядра» for those who need it; changes go back as pull requests

## 1. Retelling and decisions
The owner, 2026-11-03 ~18:50–19:10 UTC, verbatim (also in `current-steps.md`): «… возможно пользователи инструкции следует по
возможности ограничивать в работе надо ядром? Я имею в виду над его строительством? Может быть имеет смысл вообще запретить это? А тем
кто реально нуждается в этом пусть сами разбираются как в инструкции отключить этот запрет? … мы ведь строим проект в котором каждая
домохозяйка может создать себе множество агентов?»; «… если ты в инструкции за мотивируешь разработчиков которым это действительно нужно
сделать пол request? Это же будет хорошим способом продвигаться в GitHub с этим репозиторием? Попробуй усилить эту мысль и сделать
решение под эту задачу прокомментируй». 2026-11-04 ~16:05 UTC, the choice window: the switch «На странице настроек (Рекомендую)», with
the road «сообщить в Fractera» (a prefilled GitHub issue link) when it is off.

Measured 2026-11-03 (in `current-steps.md`): an element's birth rebuilds no core; elements update into their other `.next-*` without
stopping; every core edit on a node is a future conflict of `node:update`; the repository: MIT, CI `three-os` on every pull request,
0 pull requests ever.

I assume that:
- with the switch off (the default) the core's CODE is the original's: data, links, births, schedules, memory and the main agent's
  skills stay open; the main agent never edits the core's code folders and never runs `serve:rebuild` outside `node:update` and the
  deploy board's core button;
- the switch is node data (`data/node/core-dev.json`, outside git), changed only by the person on the settings page, never by an agent;
- «propose a change» (the switch on) works in a separate working copy, never in the running node: a branch in the person's fork and a
  pull request to `Fractera/web4-node-starter-kit` by a template, the outbound guard over its text;
- the sealed line «Building the core» (CLAUDE.md §4) changes — only on the owner's word on the exact line.

## 2. What is reused
The settings page `app/[lang]/(architectLayer)/architect/build/settings/`; `scripts/node-update.mjs` (own work → refusal, the update's
stages); the deploy board's core button (555, 641, 642); the GitHub token page and the node's fork (`logs/origin.json`); the outbound A2A
guard; `.github/workflows/` (CI `three-os`); hooks of the main agent's session (`lib/agent-kit/modes.cjs` `--settings`).

## 3. Known limits
- CLAUDE.md §1–8 sealed: the line of §4 only on the owner's word, then `--seal`.
- No agent switches the switch; no agent edits the core's code with it off (a hook, not a wish).
- The node keeps working while a person proposes a change: the working copy is not the node.
- Only agents talk to agents: a pull request is the person's act through their own fork; the text passes the outbound guard.

## 4. Observable results
- The settings page has «Разработка ядра» (off), with what it opens and its price («every own edit of the core is a conflict of the next
  update»).
- Off: the main agent's Edit/Write into `app/`, `components/`, `lib/`, `scripts/`, `sections/` of the core is refused with the reason, and
  it offers «Сообщить в Fractera» — a link that opens a prefilled GitHub issue.
- On: «предложить изменение» makes a working copy, a branch in the fork and a pull request to the original by the template.
- An update that changes only documents and skills does not rebuild the core.

## 5–6. Substeps (core `Fractera/web4-node-starter-kit`, `main`)
| # | Result | Rests on |
|---|---|---|
| 637-1 | the switch on the settings page: `data/node/core-dev.json`, its door, the warning; off by default | — |
| 637-2 | off: a PreToolUse hook of the main agent refuses edits of the core's code folders and `serve:rebuild` outside the board; the sealed §4 line (on his word) | 637-1 |
| 637-3 | «Сообщить в Fractera»: `npm run report -- "<what>"` → a prefilled issue link (title, the node's version, the words), the outbound guard | — |
| 637-4 | on: «предложить изменение» — a working copy, the guards, a branch in the fork, a pull request by `.github/pull_request_template.md`; `CONTRIBUTING.md`, the label «via agent» | 637-1 |
| 637-5 | `node:update` skips the core rebuild when only documents and skills changed | — |

## 7. Substeps
`637-1.md` … `637-5.md`, written after the owner's yes on this table.

## 8. Acceptance of the plan
Stages 1–6 present; stage 7 waits for the yes.

## 9. The owner's approval
— (waiting)

## Open
- Whether the skill changes accepted at a «review» (603) go as pull requests or stay on the node.
