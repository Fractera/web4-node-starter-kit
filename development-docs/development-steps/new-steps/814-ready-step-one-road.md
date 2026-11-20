# 814 — «Сервер готов» as one road; the server bot's first message only the essence

State: PLAN — layout proposed (Telegram 213, 2026-11-20 ~16:55 UTC), waits his «да»; with 813 after 811-7, one core build.

## The owner's words (verbatim, Telegram 212)

«Смотри пожелания на шаги сервер готов по какой-то причине стоит две кнопки они явно путают как мы говорили у нас не должно быть
стратегии или или конкретной понятный шаг сначала подтверждаем Telegram бота если он может быть подтверждён то есть если были ранее
введены токены, затем нажимаем кнопку открыть регистрацию на сервере. Кнопка перейти на сервер путает. Согласен? Первое сообщение которое
ты отправляешь должно содержать наверное жирный шрифт: вы начнёте получать ответы сразу же после подключения к активной подписке.
Доступна после авторизации с ролью архитектор. … сейчас там приходят и избыточное информация которая вводит в заблуждение пользователя»

## Measured

- Step 9's claim (`components/hosting/server-launch-end.client.tsx` Claim): «Перейти на сервер» sends the e-mail over SSH (~10 s), then
  «Открыть регистрацию на сервере» appears beside it — two buttons at once. The bot activation (`TelegramActivation`, 77cdf5de) stands
  BELOW the step.
- The server bot's reply while its agent cannot answer: `statusMessage` (kit telegram.cjs) — the launch's `lines` (server-launch.i18n
  `telegram.lines`: «Сервер … это сообщение прислал узел сервера. Claude Code на этом сервере не вошёл в подписку. Войти: …»), plain text.

## Substeps (the proposed layout)

- 814-1 step 9 order: the bot block first (when a token was entered), then the architect block; `server-launch.client.tsx` ready slot.
- 814-2 the claim: the e-mail is passed to the server by itself once valid (debounced, one call per address); one button «Открыть
  регистрацию на сервере», enabled by the server's yes; «Перейти на сервер» removed (words claimGo/claimSteps rewritten).
- 814-3 the bot's first message: bold «Вы начнёте получать ответы сразу после подключения активной подписки Claude Code.» + one line with
  the subscription page link (after signing in as the architect); the other node lines shortened the same way; sent with parse_mode HTML,
  the words escaped.
- 814-4 proof: eyes of step 9 (bot first, one button), a test of the lines (HTML escaped, bold), live — the bot's answer after «Старт».

## 814-5 (found 2026-11-20 16:55, Telegram 214/215): the origin notice shows a refusal's reason, never an empty file list

The owner saw on the server «Пробное слияние останавливается на файлах, изменённых и здесь, и в Fractera: . Обновление было бы
отклонено» and read it as «servers can no longer sync with Fractera». The server's own answer (POST /api/node/update preflight):
`{ ok:false, state:"refused", stage:"check", reason:"идёт развёртывание элемента — повторите, когда оно закончится" }` — the elements were
redeploying after «Включить домен». `components/node-state/origin-notice.client.tsx` prints `preflightStop` with `conflicts` whatever the
refusal was. Fix: conflicts → the file list; no conflicts and a reason → the reason in words. The merge itself replayed on a copy of the
server's exact state (fork cff7b760 + its fresh project commit, then the fork's 3c8877e4): clean, no conflict.
