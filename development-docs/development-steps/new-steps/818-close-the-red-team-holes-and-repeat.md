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
