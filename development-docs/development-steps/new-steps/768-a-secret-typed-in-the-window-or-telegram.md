# 768 — the person's secret typed in the node's window or a Telegram form (768-1..3, 5 in code; 768-4 asked)

The owner, 2026-11-16 18:44–18:50 UTC (Telegram): «Было бы законным или нет чтобы ты показал мне прямо в этом всплывающем окне область
для ввода данных в данном случае пароля?»; «для самого узла и для элемента. То есть если элемент требует от меня везти например API для
условно говоря exa.ai то я могу сделать этот ввод в этом окне»; «Да пожалуйста строить на максимальном усилие»; «многие свои ключи я храню
специальное хранилище на телефоне … если я говорю в Telegram ты мне показываешь возможность ввести пароль в Telegram если это возможно?
Если ты мне предлагаешь ввести пароль в браузере я соглашаюсь то тогда ты показываешь окно для ввода пароля в браузере … проверь
возможность такого решения».

## The rule
A secret of the node or of one of its elements (a key of the person's own account, the root password of their server) is typed where the
person is: in the panel — a masked field in the action window; in Telegram — a small form that Telegram opens over the chat (a Mini App).
Never a plain chat message: it would stay on Telegram's servers and reach the agent's model and its journal (the existing `/openai_key`
deletes its message but still passes the key through the agent — kept as it is). A secret of SOMEONE ELSE's site (a LinkedIn, Google or
bank sign-in) is never typed in the node: the site's own page, the window only leads there (LinkedIn User Agreement 8.2: no sharing of
log-in credentials).

## Measured / read
- `/api/architect/environment` writes only `OPENAI_API_KEY` (`lib/env-file.ts` EDITABLE) — the new path needs declared names.
- Telegram Mini Apps (core.telegram.org/bots/webapps, read 2026-11-16 18:50): a `web_app` button opens an HTTPS page inside Telegram;
  `Telegram.WebApp.initData` is signed by the bot and is validated on the bot's server («Validate data from this field before using it»);
  `sendData` would come back as a service message — to the chat, so to the agent — not used. The page posts to the node itself.
- The node's HTTPS address: the temporary Cloudflare address (changes) or the own domain; without one — no Telegram form, the message
  says «on the computer, in the window».

## Substeps
- [x] 768-1 Declared keys: an element's passport names the keys it may ask for (`keys: [{ name, why, where, restart }]`); the core's own
  list for itself; never-names (`SETTINGS_SECRET`, `ELEMENT_KEY`, the node's data key, `NODE_*`, `AUTH_*` …) are refused always.
- [x] 768-2 `npm run ask-person -- "<what>" --secret <NAME>` (the core's and both templates' commands): refused when the name is not
  declared by the asker; the request carries `secret: { name }`.
- [x] 768-3 The beacon card: a masked shadcn field with «show», «Сохранить» → `/api/node/person-asks` `{ id, secret }` → the core writes it
  into the asker's key file (core or element), restarts the element when its declaration says so, closes the request and wakes the asker
  with «<NAME> saved, ends …a1b2». The value is never logged, never returned, never in Telegram.
- [ ] 768-4 (asked) Telegram: the request's message gets «Ввести в Telegram» (`web_app`) when the node has an HTTPS address; the page
  `/key-entry?t=<one-time token>` posts to `/api/node/secret-entry` with `initData` (validated against the asker's bot token, the user in
  its allowed chats) and the token (single use, 10 minutes); the same writing path as 768-3.
- [x] 768-5 The root password of «Активация выделенного сервера» through the window: the value goes to the launch door the page already
  uses (24 h access, nothing stored).
Tests: S1 a declared key from the window — its NAME present in the target's key file, the asker woken with the tail; S2 negatives — an
undeclared name and a never-name refused, nothing written; S3 Telegram — forged `initData` 401, a reused or expired token refused;
S4 the value is absent from the core's logs, the session journal and the Telegram chat (grep for the value → 0); S5 the root password from
the window opens the 24 h access (step 1 green); S6 the card's field seen — masked, keyboard, both themes, phone width.
Price: one core build; both templates released and rolled to every element (ask-person `--secret`, the passport field).

## Done in code (2026-11-16 18:55–19:15, effort max)
- 768-1 changed with a reason told to the owner (19:00): no passport declaration — the passport and the request are both written by the
  element, so it adds no protection; what protects: only the asker's own key file, never-names (`lib/node/person-secrets.cjs`), Stripe
  and OpenAI to their own screens, `NEXT_PUBLIC_*` refused (baked into a build).
- `lib/node/person-secrets.cjs` (names, values, the env line, the tail, `describe`); `person-asks.cjs` keeps `secret` (name and place,
  never a value) and `secretDoneText`; the door `{ id, secret }` → `writeElementSecret` (`lib/env-file.ts`) + `restartService
  ("fractera-svc-<id>")` (the same road as auth's env, `lib/domain/auth-env.ts`); the element's `done` and the CLI `done` refuse an env
  secret; Telegram: no «Готово», «typed only in the window»; `components/architect/person-ask-secret.client.tsx` (InputGroup, show/hide,
  «Сохранить»; server-root → `/api/node/launch` connect from the browser, then `{ id }`).
- Unit person-asks 14/14 (+4 for 768); tsc 0; guards green; the whole prebuild green.
- Templates custom v0.3.213 (4c0c638), native v0.1.78 (e7a9a15): `ask-person --secret <NAME> --where`, ask-core «A key of yours», the
  instruction line; rolled to 10 natives (d4ccdb3) and root v3.0.67 (b34fa69); hrutb regenerated, uncommitted (paused).
- Core skill act-with-the-person: «The window first, then the chat» and «A secret is typed in the window».
Next: the core build, then S6 (eyes on the field), S5 (the owner types root in the window → step 2 opens), S1/S4 (a test key — ask the
owner which element; grep the value), S2/S3 by unit; 768-4 waits for his yes.

## Live after the build (core dcd483eb, 19:20–19:30)
- S6 ✓ light: the beacon's card on «Активация выделенного сервера» shows «Пароль root сервера 109.199.105.213», the masked field with
  show/hide, «Сохранить» disabled while empty, console clean (logs/eyes/768-S6-light.png). Dark and 390 px — the beacon was shut in
  those shots: not seen yet.
- S5 ✗/open: the owner typed the password in the window (in my extension tab ?from=agent, his screenshot 19:25:17): «Сохранить» stood
  light blue ~10–20 s with no word (busy, no spinner — a defect: «Проверяю сервер…» with a spinner); the launch door answered ok, the
  request closed (journal 19:25:26 «4deaab20 done»), the wake said «a visit of a day». But right after, the page's «Проверить сервер»
  with an empty password on the same tab → «У этого браузера нет открытого доступа», and a `state` call from the tab → need-password.
  The visit did not reach the page. Not the profile (the same tab, his screenshot). Open questions: did the connect answer carry the
  visit (the window checks only `ok`, the page checks `ok && state`); is a fresh visit key refused on its second use (then the page's own
  form would fail the same way). Asked the owner (19:29) to type the password in the page's own form and press «Проверить сервер» —
  that splits the window from the launch door. 7201483d (a wrong guess about a profile) dropped.
