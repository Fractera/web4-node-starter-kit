# 768 — the person's secret typed in the node's window or a Telegram form (plan; 768-1..3, 5 approved, 768-4 asked)

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
- [ ] 768-1 Declared keys: an element's passport names the keys it may ask for (`keys: [{ name, why, where, restart }]`); the core's own
  list for itself; never-names (`SETTINGS_SECRET`, `ELEMENT_KEY`, the node's data key, `NODE_*`, `AUTH_*` …) are refused always.
- [ ] 768-2 `npm run ask-person -- "<what>" --secret <NAME>` (the core's and both templates' commands): refused when the name is not
  declared by the asker; the request carries `secret: { name }`.
- [ ] 768-3 The beacon card: a masked shadcn field with «show», «Сохранить» → `/api/node/person-asks` `{ id, secret }` → the core writes it
  into the asker's key file (core or element), restarts the element when its declaration says so, closes the request and wakes the asker
  with «<NAME> saved, ends …a1b2». The value is never logged, never returned, never in Telegram.
- [ ] 768-4 (asked) Telegram: the request's message gets «Ввести в Telegram» (`web_app`) when the node has an HTTPS address; the page
  `/key-entry?t=<one-time token>` posts to `/api/node/secret-entry` with `initData` (validated against the asker's bot token, the user in
  its allowed chats) and the token (single use, 10 minutes); the same writing path as 768-3.
- [ ] 768-5 The root password of «Активация выделенного сервера» through the window: the value goes to the launch door the page already
  uses (24 h access, nothing stored).
Tests: S1 a declared key from the window — its NAME present in the target's key file, the asker woken with the tail; S2 negatives — an
undeclared name and a never-name refused, nothing written; S3 Telegram — forged `initData` 401, a reused or expired token refused;
S4 the value is absent from the core's logs, the session journal and the Telegram chat (grep for the value → 0); S5 the root password from
the window opens the 24 h access (step 1 green); S6 the card's field seen — masked, keyboard, both themes, phone width.
Price: one core build; both templates released and rolled to every element (ask-person `--secret`, the passport field).
