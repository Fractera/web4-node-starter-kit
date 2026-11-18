# 796 — the architect of a fresh server is claimed by e-mail, not by a code

Approved: the owner, 2026-11-18 14:36 UTC (Telegram 690: «796 + …») to the proposal of Telegram 689.

## The owner's words (Telegram 686, verbatim)

«К сожалению я уже пробую пройти этот путь у меня ничего не получилось это я тебе щас говорю про получить код архитектора. То что ты
защищаешь этот процесс идеи потенциально правильно описание слишком слабо давай допишем так::
Чтобы вы получили право создать учётную запись архитектора на новом сервере нам понадобится ваш e-mail. Внимание только пользователь точно
таким же имейл получит права стать первым супер пользователем который может создавать других супер пользователей.:
– 1 введи электронный адрес запишите и сохраните электронный адрес.
– 2 нажмите кнопку перейти на сервер. Вы попадёте на вкладку авторизации.
– 3 зарегистрируйтесь с тем же самым электронным адресом, придумайте пароль. Запишите и сохраните пароль.
Внимание если вы потеряете электронный адрес и пароль прежде чем создадите нового супер пользователя вы не сможете восстановить доступ к
серверу. Вам придётся сделать новый установку сервера, все данные будут потеряны без возвратно.
Ссылки которые ты размещаешь на этой вкладке сайт панель вход они путают …»

## Substeps

| # | What | Proof |
|---|---|---|
| 796-1 | sign-in template (auth's own agent, `npm run task`): `POST /api/claim {email}` (x-architect-token, loopback) keeps the claim as the SHA-256 of the trimmed lower-cased e-mail; while it waits, the first node account is accepted only with that e-mail (the code path of 739 may stay for old servers); the register form shows no code field for an e-mail claim, only a line that the first registration here is the architect's e-mail given at the server launch; Google and the magic link keep refusing while a claim waits (D29); `GET /api/claim` → `{ pending, claimed }` (claimed = a node account exists). Release the next patch tag. | template tests: no claim → first user architect; e-mail claim → other e-mail refused, same e-mail in any case → architect, claim ends; second → ordinary user; the door without the token → 401 |
| 796-2 | core: `/api/node/server/domain` `claim` forwards `{ email }` (and `status` → GET); the runner's `door` passes the e-mail through; the launch door accepts it (validated, ≤ 254, one @); `launch-trace.jsonl` records the verb `claim` (never the e-mail). Step 8 «Сервер готов»: the owner's text verbatim, the e-mail field, «Перейти на сервер» (claim → opens https://auth.<zone>/register in a new tab); «Сайт · Панель · Вход» only after the architect exists. | `hosting-launch.test.mjs` (the e-mail passes, never stored in the core); eyes of step 8 with a stub state |
| 796-3 | pin auth's tag in the core, prebuild RC=0, one core build; push origin (the fork the server installs from) and Fractera. | ls-remote of both; the server's fresh install (784) gets the new sign-in |

The live proof rides 784: Roma's «Установить с нуля» AFTER 796-3, then step 8 with his e-mail, his registration → architect.
