# 674 — The main agent starts on Opus at effort high

## The owner, 2026-11-07, verbatim
«На соннет не будем работать по дефолту устанавливай opus effort high» — said while 673's exam was planned on Sonnet at effort medium.

## Read as
- The model is already right: `scripts/main-agent-install.mjs` writes `.claude/launch-model.txt` «opus» into the core root of every
  node (610: «Opus — он строит ядро (Рекомендую)»), and the bridge prefers a folder's own model (`lib/agent-kit/modes.cjs`
  `launchModel`). Only a person's choice in Telegram or `npm run session -- model` puts it on Sonnet.
- The effort is not: every session starts with `DEFAULT_EFFORT = 'medium'` (the agent kit's bridge, 666), and a model switch starts
  again at medium («узел ставит Medium по умолчанию при смене модели»).
- I assume that «по дефолту» means the main agent of every node (the captain); element sessions keep medium, and their working
  sessions stay on Sonnet by the owner's law of 2026-10-22 (CLAUDE.md §6: Sonnet — text). He can widen it with one word.

## What is built (a fix in the existing pattern, no window)
- `lib/agent-kit/modes.cjs` `launchEffort(dir)` — a folder names its own effort in `.claude/launch-effort.txt`, exactly as
  `launch-model.txt` names its model; one of `low · medium · high · xhigh · max`, otherwise none.
- The agent kit's bridge (the master `architect/kits/_agent-kit`, then its copies by `npm run agent-kit:update`): an effort nobody
  chose is the folder's own, else medium — at the start and after a model switch; ultracode stays max.
- `scripts/main-agent-install.mjs` writes `.claude/launch-effort.txt` «high» next to `launch-model.txt`; `.gitignore` keeps it out of
  git like its neighbour.

## What counts as done
A main-agent session the person did not tune starts with `--model opus --effort high`; an element's starts at medium as before.

## How it is proven
1. **The function:** `launchEffort` on a folder with the file → «high»; without it → none; with a stray word → none (negative control).
2. **The node:** after the release, `data/services/build/session-mode.json` of the next main-agent start records `effort: high`;
   an element's record keeps `medium` (negative control). `check:agent-kits` — no copy behind the master.

## Price
Every turn of the main agent thinks more: the subscription's limits go faster for the main agent; elements unchanged.

## Not in it
Elements' defaults; the Telegram effort list (unchanged — a person's choice still wins); CLAUDE.md §6 (untouched).
