# 831 — one button rule on the server page; the architect's e-mail only through a confirm dialog (closed 2026-11-21)

The owner, Telegram 605: «если кнопка кликабельная она тёмно-синие если я её нажимаю она становится голубой и в ней появляется индикатор
загрузки … на каждом шаге кнопки разного цвета … нужен запуск процесса аудита кнопок»; 606: «кнопка … включить … единственное не хватает
индикатора загрузки»; 608: «активация имейл архитектора. Кнопка должна иметь подтверждение в виде окна аналогичного Danger zone»; 611:
«запускай сборку всех прошлых решений».

Audit (45 buttons): main actions disabled until a field was filled rendered pale (connect, domain, repository, bot token, claim retry);
main actions drawn outline (step 8 HTTPS, «Спросить сервер», «Подключить сейчас»); spinners on 2 of 45; the architect's e-mail left for
the server by itself 0.9 s after the last key (814-2).

## Commits

| Repository | Commit | What |
|---|---|---|
| core | 2622237a | `components/hosting/action-button.client.tsx` (@part action-button), every step of the server page and the server's domain ladder, 831-2 the claim dialog (address large, the loss named, a tick, red confirm), words en/ru |
| core | abebd38f, 7cc8888d | the final-check DOM test to the new road; the letter |

Core built 18:47–18:53 UTC, /api/health commit 7cc8888d; pushed to the fork and Fractera.

## Proofs

Plane 1 — tsc 0 errors; check:shadcn-parts, check:dialogs, check:parts-map green; `final-check.test` 11 ✓ (before the dialog the one
button is «Назначить архитектора», no registration link — the old auto-send road is gone); prebuild RC=0.
Plane 2 — the live page (this Chrome, the server 109.199.105.213): «Проверить сервер» pressed with an empty IP stays dark and says
«Сначала впишите IP-адрес сервера.»; pressed with the IP — pale with a spinner and «Подключаюсь к серверу…».
Not seen live: the claim dialog — the server's architect is already registered, so step 9 shows the links instead.

Surfaces seen: logs/eyes/831-empty-ip-reason.jpg (the reason under the field), logs/eyes/831-pressed-spinner.png (pale with the spinner),
logs/eyes/831-server-ready.jpg (steps 6–9 done, «Ваш сервер готов»).

## Mistakes

- 814-2 had made the e-mail leave by itself to save a press; the owner's rule for irreversible acts (a dialog like the danger zone) was
  not applied there. An irreversible act never starts without a confirming dialog.
- The certificate upload button (inside a closed fold) still waits for both files — named as the one exception.

## Evolution of skills

None. ## Parts born here — `action-button` (components/hosting/parts.json).
