# 676 — the owner's own development in the core survives a Fractera update (QUEUED, not planned yet)

The owner, 2026-11-07 ~17:50 UTC, verbatim: «Также я тебе напомню о ситуации когда гостя или владельцу правильнее сказать узла не
рекомендуется проводить собственную разработку а если он это делает он понимает что он не сможет сделать Fork когда обновится Fractera.
Но на самом деле наверно он был смог это сделать если бы запустил процесс автоматическое сравнение версии если слияния? Что для этого
нужен навык на шаг разработки давай запланируем подумай потом но не сейчас сейчас много работы.»

Facts known today (not yet weighed): `scripts/node-update.mjs` refuses the update when the node holds someone's own UNCOMMITTED work
(stage `local`, the list printed, nothing touched); own COMMITS are merged by `git merge` of `origin/main` and stop the update at a
conflict (`rollback`); the node's development steps and `CANCELLED.md` are the node's own (`NODE_OWN`).

To plan when the owner turns to it: the eight stages of `use-development-steps` §4 — a skill and the update's own merge pass.
