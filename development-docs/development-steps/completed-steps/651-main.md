# 651 — the lost banner and the false «address dead» (closed)

**Commits:** `Fractera/web4-node-starter-kit` `6d2e46ea` (banner, words, alarm, watchdog); delivered to the owner's node by
`node:update` (fork `aifa-agi/web4-node-starter-kit` fast-forwarded to `6d2e46ea`, `===NODE_UPDATE_DONE=== 3 изменений форка, ядро
8b4540a2`, root v3.0.21 «обновлён до закреплённой версии»). The plan was agreed in the chat.

**The owner, verbatim (2026-11-05):** «по какой-то причине отсутствует баннер который показывает информацию о том что проект отстает. Он
всегда существовал в нём было три кнопки … куда он исчез и почему?»; «когда я перешёл по этой ссылке и попал на эту же страницу то снова
увидел информацию о том что у нас проблема с доменом»; to the plan 651-1/2 — «to do both».

**651-1 — the banner.** Cause: on a fresh node the mark `logs/origin.json` said `behindBy: 0` (2026-11-04 23:46) and there was no
`node-update.json`, so `OriginNotice` returned null — and «Проверить снова», the only way to ask GitHub, went with it while the original
was 2 commits ahead. Now that state is a quiet line `even` / `evenNever` («Узел совпадает с оригиналом Fractera на <mark>») with
«Синхронизировать форк», the disabled «Обновить сборку ядра», «Проверить снова» and «Скрыть» for a day (`useSnooze`).

**651-2 — the address.** Cause, measured: the name was born 09:44:44, the machine's resolver did not know it until 09:51:40, the verdict
fell at 09:47:53; a second false verdict at 10:00:23 while 1.1.1.1, 8.8.8.8 and the hotspot DNS 172.20.10.1 resolved it and
`/api/health` via 104.16.231.132 answered 200 — the macOS resolver's stale cache. `scripts/tunnel.mjs`: a name that never answered is
not judged on «имя не резолвится» for 10 minutes (`FRACTERA_TUNNEL_BIRTH_GRACE_MS`); «имя не резолвится» is asked again of public DNS
(`FRACTERA_TUNNEL_PUBLIC_DNS`, 1.1.1.1 and 8.8.8.8) and the tunnel probed at the address it gives — the verdict only when public DNS
does not know the name either; the note is logged once. `DeadAddressAlarm` is not shown on a temporary address: the page came through
that tunnel.

**Proofs.**
1. Lab watchdog (fake `cloudflared` under a temporary HOME, probe override): a `.invalid` name — default grace → «новое имя ещё не
   разошлось по DNS … не сужу», grace 1 ms → «🛑 АДРЕС В ИНТЕРНЕТЕ МЁРТВ» after 3/3; a copy with the system answer forced to «имя не
   резолвится»: the live address → «публичный DNS знает (104.16.230.132) и туннель отвечает 200 — туннель жив», a name Cloudflare does
   not know → the verdict after 3/3. Core `tsc --noEmit` exit 0; `check-static`, `check-dialogs`, `check-shell-kits`,
   `check-term-hints`, `check-architect-routes`, `check-instruction`, `check-steps`, the characters scan — OK; the whole prebuild inside
   `node:update` — green; CI three-os green on `6d2e46ea`.
2. Eyes on the owner's node after the update: before — `[data-origin-outdated]` «не найден», `[data-dead-address]` «виден» on
   localhost; after — «Узел обновлён: 3 изменений форка, ядро 8b4540a2» with «Проверить снова» «виден»; after «Скрыть» —
   `[data-origin-even]` «Узел совпадает с оригиналом Fractera на 05.11.2026, 10:12:18», «Синхронизировать форк» and «Проверить снова»
   «виден». The alarm with `dead: true` set for the control (restored at once): localhost — «виден», the temporary address — «не найден».
   Root on the node: the column 1280, after «Уже экран» 1024, the integrator card 303 px, no console errors.

**Not proven:** the new watchdog in the owner's running tunnel — it starts with the next tunnel start (a restart gives a new address);
`node:update` does not touch the tunnel.

**Found on the way, not fixed:** `check-i18n` fails on the original too (two dictionaries of `administration/users` listed, files
absent; not in the prebuild); `/api/node/place` answers 403 on the temporary address (a console error of the panel there).
