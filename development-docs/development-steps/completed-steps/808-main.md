# 808 — the server's own GitHub repository (and 809 — home vs server, the element's «Домен» page) — summary

Closed 2026-11-20. Repository: the core (`main`), commits 84ccf98f (808), e2f8faba (809), the follow-up of the main address's look
(below); core build e2f8faba live here 11:26; the fork pushed 83415389..e2f8faba; the server updated to it 11:39 (its core 1067e2e6).

## The owner's words

- 808, Telegram 37: «при входе по умолчанию стоит тоже самое репозиторий … Есть второй режим: поднять чистый стартер Fractera на любом vps
  … зарегистрируйте аккаунт GitHub … сделайте Fork … введите ссылку на свой Repository. Кнопка проверить»; 39 «Давай».
- 809, Telegram 63: «эту страницу где ты сейчас подключал домен нужно переработать … в стиле в котором создается подключение сервера …
  бардак»; 76/78: own apps and additional element domains only on a dedicated server; 81 the order (core build → installer → terminals);
  85 «Да» on the layout; 111: the active main address contrast blue, the other struck through.

## What was built

- 808: `lib/hosting/server-repo.mjs` (forkCheck through GitHub's public API — a DIRECT fork of the original, law 368; readRepo/nextRepo),
  the runner's act `repo` (`/root/.fractera/repo.json` on the server; refused under an installed node), `install` clones the kept fork
  (`repo-not-chosen` for «own» without one), `relationOf` measured by the server's own fork; the door action `repo`; the launch ladder's
  rung 4 «GitHub-репозиторий сервера» (`server-launch-repo.client.tsx`): «Тот же проект» by default, «Чистый Fractera» with a nested
  ladder (account · fork · address «Проверить»), read-only once Fractera stands there. Found on the way: «install from the original»
  (his first «А») would have died at check-origin — named to him, he reshaped it.
- 809: `lib/hosting/home-rules.mjs`; at home the birth window has no «own» question and the birth doors refuse it, the element domain door
  refuses (`domains-on-server-only`), «Дополнительные домены» is server-only; the element «Домен» page — at home the address and one
  line, on a server `element-domain-ladder.client.tsx` (5 rungs + danger zone with a confirm window); the retired
  `element-domain-rows`/`element-certificate`; the stale throughsongs.com entry of this computer's list removed through its door.

## Proofs

- Tests: server-repo 5, hosting-launch (dry) 27 incl. 2 new for 808, ladder-rule 18 incl. 808's, home-rules 2 — each with negatives;
  a live GitHub call: his fork accepted, the original / next.js / a missing repository refused with their reasons.
- Eyes here: logs/eyes/2026-11-20T11-28-03-236Z.png — «Активация домена» without «Дополнительные домены», no console errors.
- Live on the server (his Chrome): rung 4 «тот же проект · aifa-agi/web4-node-starter-kit»; /ru/a8ifp/settings/domain — five rungs done
  (throughsongs.com · подключён · A @ и www → 109.199.105.213 · HTTPS до 17 февраля 2027 · главный адрес) and the danger zone (his photo).
- Not seen: the «Чистый Fractera» nested ladder live (needs a server without Fractera); the birth window at home (no draft here).

## Also proven today (803/805, live on the server)

- marina2 signs in on a8ifp.fractera.ai and on throughsongs.com with one account (user + elementAdmin002); continue-as → another account →
  the form with requireRole=user; her admin pages open. Open: the auth screens are English on a ru site (the sign-in element's task).

## Next

811 — the server installer's wall (a Linux user per element), plan first; then 810 — the element admin's cabinet (terminal A).

Surfaces seen: the server page step 4 «GitHub-репозиторий сервера» in the owner's Chrome after the 11:22 build (LIVE e2f8faba); eyes logs/eyes/2026-11-20T11-28-03-236Z.png (0 console errors).
