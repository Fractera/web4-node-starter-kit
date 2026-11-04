# 638 — The node's automatic work and the subscription (closed 2026-11-04: «Оставить как есть»)

## The owner, verbatim
- The request, 2026-11-03 ~21:10 UTC: «Это очень хорошее правило: если у нас оплачено подписка OpenAI то мы разбираем рабочие проекты с
  помощью этой модели если у нас подписка не оплачена то мы используем резервную копию это модель Anthropic по подписке …» (whole in
  git: the deleted `new-steps/638/638-main.md`).
- 2026-11-04 ~15:25 UTC (in 643's window): «отдельный ключ API Anthropic  - prohibit! Категорически запрещается в проекте рекомендовать
  использовать ключ от Anthropic потому что использование ключа Anthropic прерывает использование подписки. По этой причине только ключ
  ОпенАи у нас для него есть переменных окружение специальные контейнер» → 638-2 (an Anthropic key for woken sessions) cancelled.
- 2026-11-04 ~16:05 UTC, the choice window («638 — автоматическая работа узла на подписке … Ключ Anthropic запрещён. Как дальше?»):
  **«Оставить как есть»** — the warning once a day as now; 638 closed.

## What stays as it is
- The inventory (`completed-steps/638-1.md`): every automatic model call of the node, who starts it, the engine, the price.
- The deep memory's thinking — OpenAI while the account has money, else the subscription with the warning once a day (636-9).
- Woken agent sessions, alarms with a task, supervision, A2A orders, the catalog's marking (627) — Claude Code on the owner's
  subscription; the law in `provider-rules`: no threshold named, the risk grows with volume, never an Anthropic API key; the tools'
  own AI work through the node's OpenAI key.

## Not in it
A counter of automatic sessions, moving any job to OpenAI — not chosen («Счётчик и предупреждение», «Перенести часть на OpenAI»).

## The plan
Deleted in the commit of this summary (`git log --diff-filter=D --format=%H -1 -- development-docs/development-steps/new-steps/638/638-main.md`).
