# 686-3 — the passport fragment `development` and the quick answer to the leader

**The owner, 2026-11-08, verbatim:** «в базовом файле own-service-props.json появляется фрагмент: – текущий шаги разработки 21, 22.1,
22.2, 24. – Текущий шаг 22.1, состояние: планирование. А также навык который позволит элементам быстро пробудиться и ответить агенту
Orchestrator». Resumed by «продолжит ровно с 686-3» (2026-11-08), under his «b» (finish all of 686, then one node update).

## Shape

- **The writer is the model, the pen is code.** `npm run development -- --steps "21,22.1,22.2,24" --current 22.1 --state planning
  [--next "<one line>"]` writes `development` into `OWN-SERVICE-PROPS/OWN-SERVICE-PROPS.json` (`steps`, `current`, `state`, `next`,
  `at`), keeping every other key and the file's format; `--none` — no active step; with no flags it prints the fragment. States — a closed
  list: planning · building · checking · waiting · done · stopped. A bad value writes nothing (exit 1). The model never edits the JSON by
  hand: a broken passport would break the element's door.
- **When:** every event `current-step.md` is written on (skill `use-development-docs`) — the same moment, one command more.
- **The quick answer:** own skill `answer-the-leader` (`own-service-props-skills`, Work skill): the core's main agent asks «where does
  development stand?» — `npm run development`, the head of `current-step.md`, `npm run reply-core` in at most three lines, nothing else
  read, nothing built.
- **The common instruction** (`element-instruction.src.md`): the builder line names `npm run development` next to `current-step.md`; the
  own-service-props-skills row names `answer-the-leader`. Regenerated into all 15 repositories by `npm run instruction:element`.
- **The core:** `npm run where` reads the passport fragment first (its `at`), the «Active step» line of `current-step.md` second; an
  element whose fragment says `building`/`checking` while its pulse is silent or cut off is named with the quick wake
  `npm run task -- <id> --work --skill answer-the-leader`.

## Repositories

All 15 templates in `~/fractera-dev` (custom, native, root and the 12 native starters) — one rollout script `_tools/686/rollout.mjs` (dry
by default, idempotent), instruction regenerated, each repository's whole prebuild green, a commit, its next patch tag, pushed; the core
pins all fifteen. On the owner's node: natives come up on their pins with the node update; root and «Клип» (s8y6x) get
`npm run template -- rollout` of the same paths after it.

## Proof

1. In a scratch copy of a template: `npm run development -- --steps "21,22.1" --current 22.1 --state planning` → the fragment in the
   passport, every other key byte-identical; a bad state → exit 1 and the file unchanged (negative control).
2. On the owner's node after the update: an element's fragment written after its own step event, and `npm run where` shows it.
