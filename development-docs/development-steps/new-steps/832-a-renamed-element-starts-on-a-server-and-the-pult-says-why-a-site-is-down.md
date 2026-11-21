# 832 — a renamed element starts on a server, and the Pult says why a site is down

**The owner, Telegram 619, 2026-11-21 19:12 UTC:** «На сервере создал новый субдомен – элемент а потом его переименовал. И вот вижу такую
надпись [Сайт обновляется] но при этом если я открываю пульт то в нём нет информации что например идёт сборка или ещё что-то такое».

## Measured (19:13–19:20 UTC, server 109.199.105.213, through the visit window and the server agent's shell `!`, no model)
- marina.fractera.ai → 503, nginx's «updating» page; the element y43ib (address marina) built 19:06:47, pm2 `waiting restart`, 9 restarts.
- `logs/move-y43ib.log`: folder moved user/y43ib → user/marina 19:09:38, paths updated, pm2 start ok, «сервер не ответил на 24684 за 60 с».
- `logs/svc-y43ib-err.log`: «the element folder is gone» ×10 — the wall helper reads root's record `/etc/fractera/elements/y43ib`,
  which still said `FOLDER=WEB4-ITEMS/user/y43ib`.
- Live repair 19:19: `sudo -n fractera-element add y43ib WEB4-ITEMS/user/marina` → record `FOLDER=WEB4-ITEMS/user/marina`,
  `pm2 restart` → `/api/health` 200 on the server, https://marina.fractera.ai 200 from the internet (this Mac).

## Substeps
- 832-1 `scripts/element-move.mjs`: on a walled element (wall on, fe-<id> exists) after the rename — the helper's repeat `add` with the new
  folder (refused → the folder goes back, the old process starts, `wall-record`); the agent's history in its own home moved as fe-<id>.
- 832-2 the Pult: `serve` per element — `moving` (move.json fresh), `starting` (pm2 launching), `down` (errored/stopped/waiting restart);
  a red tag «не отвечает» and one short line; a native that is down is shown even when natives are folded. `tgState` async (pm2 jlist).
- 832-3 the bench (`tg-app:preview`) carries a down element.
- 832-4 (Telegram 625: «Агент marina не включился: no-account. Нажмите «Включить» ещё раз») — the kit's `failedWords`: `no-account` names
  the element's «Подписка Claude Code» page (https://architect.<zone>/<lang>/<address>/subscription), never «press again». 5de80775.
- 832-5 (Telegram 627: model → effort → nothing, «по циклу … в четвёртый раз») — the kit's `accountMissing`: a walled element without its
  own Claude home is «not signed in» for the bot — no «Включить», no model, no effort; one kept answer with the page. The core hands
  `walled-session.cjs` to the kit through `globalThis.__web4WalledSession` (mount.cjs; a computed require does not build there).

## Test checklist
- [x] live: the old record → the shim's «folder is gone» (negative); the new record → health 200 and the site 200 from the internet.
- [x] the bench at 390 px: the tag and the line fit, no console errors (logs/eyes/2026-11-21T19-23-42-224Z.png).
- [x] tg-app test green; element-wall test — the one failing case (prepare.sh DRY) fails the same without this change (pre-existing).
- [ ] after the core build: the Pult on a node with an element stopped shows «не отвечает» (the server after its next update).
- [x] 832-5 wall check both ways: a fake wall → walled true; this Mac → false (the Mac's bots unchanged).
- [ ] 832-5 on the server after its update: a message to marina's bot → one answer with the subscription link, no model/effort buttons.
- [ ] on the server's next rename: move log «стена: запись папки обновлена» and the site back without a hand.

## Found on the way (not in this step)
- The server's agent: hooks fail «Cannot find module …/data/services/build/memory/scripts/system-part.mjs» after it `cd`s — hook commands
  in `.claude/settings.json` are relative to the shell's folder; a guard silently off. Fix candidate: `$CLAUDE_PROJECT_DIR` (check Windows).
- The second rebuild of every element on the server (Telegram 612), answered by the server's own agent: the 11 elements were built with
  the IP inside; fractera.ai connected at 18:31 → all rebuilt for the new address (queue done 18:52, none failed) — step 827's matter.
