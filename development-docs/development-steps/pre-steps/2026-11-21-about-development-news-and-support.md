# Intake 2026-11-21 10:49 UTC — the owner (Telegram 458–459): a tab «О разработке» — news and «support the project» in both Pults

Verbatim, as written (autocorrect kept).

## 458
«Одна маленькая дополнение это ещё одна вкладка в моих собственных интересах: вкладка о разработке: вкладка на которой можно рассказать о
новостях, я о том как пользователя могут поддержать проект. Это один дополнительный шаг который мы добавим позже у дизайн может добавить
его сразу и я тебе хочу сказать что на Fractera изи стартер существовал на главной странице существовала три карточки поддержать проект
все они вели на оплату через Stripe. Возможно ты сможешь перетащить эти карточки сюда в интерфейс Telegram? Поставить на пульт архитектора
и на пульт элемента. Вдруг тоже захочет мне помочь?»

## 459
«То что касается новостей проекта если это возможно я бы хотел их как-то публиковать то в GitHub и чтобы здесь можно было их читать если
так вообще делают?»

## Measured before the answer
- `gh search code "buy.stripe.com"` in the orgs Fractera and aifa-agi — nothing; `gh repo list Fractera` has no easy-starter repository.
  The three support links are asked from the owner.

## 461 (10:50)
«Также нужно реализовать вкладку нашли проблемы сообщите нам чтобы оно открывала @roma_armstrong , сразу скажу что тебе не надо
беспокоиться о том что мой Telegram будет перегружен во-первых я в будущем сделаю туда бот который будет разбирать заявки во-вторых
Telegram насколько я знаю делает возможным реализовать платные сообщения то есть ты должен купить несколько звёзд чтобы иметь возможность
отправить сообщение. Исследует этот момент также возможно это не касается личных аккаунтов а касается только группы или чатов ну в общем
туда должна ввести ссылка»

## Primary sources read 2026-11-21 ~10:53 UTC (curl, text only)
- telegram.org/faq: «Q: What are Star Messages? Star Messages let you set a fee in Telegram Stars for messages from people who are not in
  your contacts.» · «Premium users can also charge Stars for messages from people who are not in their contacts.» · «Channel owners can
  set a fee in Stars for each direct message».
- core.telegram.org/api/paid-messages: «Telegram Stars can be used to pay for sending messages to users, supergroups and channels that
  have configured Star Messages».
→ Personal accounts too (with Premium), supergroups and channels. Inside a Mini App a t.me link opens through the event
  `web_app_open_tg_link` (core.telegram.org/api/web-events — read before the code).
