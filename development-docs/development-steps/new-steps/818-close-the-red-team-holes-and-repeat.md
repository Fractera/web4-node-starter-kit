# 818 — close the red team's holes, repair the element channel, repeat the attack on a fresh server

State: PROPOSED (Telegram 267, 2026-11-20 18:47 UTC), waits the owner's «да». Resource control dropped (Telegram 266: «отправляем в
игнор требования контроля ресурсов») — H3 and the memory display go to BACKLOG, nothing of them in 818.

## The owner's words (verbatim)

- Telegram 261: «Чужой сервисы безусловно убрать я об этом тебе уже много раз говорил.»
- Telegram 266: «Хорошо сейчас отправляем в игнор требования контроля ресурсов и запускаем переделку расскажи из каких этапов это будет
  состоять мы будем поднимать новые сервер не так ли?»

## A — code on the Mac

- 818-1 the server's clear removes everything foreign: every Docker container (running ones too), its images and volumes, Postgres with
  its databases, Apache, root's own pm2 and its apps; the page names what goes in one line (`clear.sh`, `leftovers.sh`).
- 818-2 H1: `x-agent-identity` is never honoured for an element's user (the peer stamp of 811-5g) — the gate and `getSession`.
- 818-3 H2: the relay's `record` (and every hook taking a path) reads only inside the element's own Claude folder
  (`data/services/<id>/claude`); any other path is refused.
- 818-4 H5: `~/.pm2` and `~/.claude` 0700, the nginx site 0640, `~/.gitconfig` 0600 — set by the server's prepare and walls.
- 818-5 F1/F2: the walled element reaches the core — the relay's client calls where the core listens; `ask-core`, `tell-core`, `need`
  find the core's address in the element's own folder; the gate lets an element in by its own key AS an element.
- 818-6 the red team as a repeatable script (`scripts/dedicated-server/redteam.sh`): every attack of 817, verdict «holds / HOLE».
- Tests, prebuild, the Mac build (asked first).

## B — the release (the owner's hands)

The Fractera push paste → «Синхронизировать форк» → on the server «Очистить» + «Установить с нуля» (~40 min) → the bot, the architect.

## C — the proof on the fresh server

redteam.sh as a born element; the attacks from inside it; social engineering of the server's main agent through ask-core and tell-core;
the table «attack → holds / HOLE» to the owner.

## Progress (2026-11-20)

- 818-1 61449f4b · 818-2 H1 7208d02b (measured from the INTERNET: `x-agent-identity: outsider` → «outsider@agent» on
  architect.fractera.ai and the Mac's temporary address; media-proxy and openai-models answered) · 818-3 H2 ded7a2aa · 818-4 H5 3619e4a6
  · 818-5 F1 99a4cf64 (hook relay and tools/take through the gate by their element key; the relay client calls localhost).
- Tests: `scripts/redteam-holes.test.mjs` (9, in the prebuild; the negative control — red on the old code), element-wall 66,
  server-install-live 18.

## H6 found while repairing F2 (asked the owner, Telegram 274)

The installer writes the SAME `SETTINGS_SECRET` into the core and into every element; element commands (ask-core, tell-core, need, done,
session) send it as `X-Node-Key`, and the core's doors compare it with their own (`nodeKeyOk`). Every element therefore holds the node's
key: once its channel opens it could wake any agent with any text, clear another session, and write a neighbour's settings (their
`/api/settings/*` doors are guarded by the same key). Measured on the server: root's `.env.local` holds SETTINGS_SECRET (1) and
ELEMENT_KEY (1), no DATA_SECRET. Today the gate keeps those doors closed to walled elements (after H1) — no hole, but element agents on a
server cannot tell the core «done» or ask it. Proposed fix: every element calls the core with its own ELEMENT_KEY (caller named by the
key, only its own affairs), no node key in elements, the core reaches each element's settings doors with that element's own key — a
custom template release. Options: A (now, in 818) / B (818 as is, H6 → 819); my pick A.

## Review before the reinstall (the owner, Telegram 275: «критически отнесись к своему исследованию и повтори его»)

Fixed: a foreign pm2 killed with its apps (`pm2 kill` on its folder), listeners named by owner (a foreign app is also «node»), the node user
read from /etc/fractera/node.env or given by the installer, record's project name as Claude Code makes it, every install erases what is
not Fractera (Telegram 277: «Один сервер это только проект Fractera … больше ничего») — prepare's stage «foreign».
Known red, not 818's and not in the prebuild: `scripts/launch-footprint.test.mjs` (by hand, 744-8) fails on the tree before 818 too —
the 784 trace `logs/launch-trace.jsonl` it does not know, and A→B→A where A's second state has no probe. The reinstall uses one server;
to be fixed with the test (BACKLOG).
