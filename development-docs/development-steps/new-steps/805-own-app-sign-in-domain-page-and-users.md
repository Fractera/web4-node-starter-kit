# 805 — an app of its own: sign-in on its own domain, the «Домен» page, the admin pages link, its Users

State: PLAN being measured — the owner's report of his server test, 2026-11-19 ~18:00 UTC (terminal), verbatim below.

## The owner's words (verbatim)

«and on work more for custom template :
Проблема которая остается существовать с входом на элементы.
Мы решали задачу о том чтобы при создании нового элемента мы могли создать имейл и пароль который предоставит администратору элемента
исключительные права. На сегодня в результате тестирования я обнаружил что:
– хорошо:
– – элемент создается
– – для элемента привязывается субдомен с сертификатом безопасности
– – при попытке войти я попадаю на страницу как администратор
– – я могу прикрепить новый домен в процессе активации этого домина я вижу создание сертификата на уведомления это хорошо, после создания
домен открывается
– плохо:
– – отсутствует выпадающем списке возможностью видеть страницы администратора. В итоге я не понимаю существует такая страница или не
существует очевидно она должна быть не на субдомене она обычном домене но мне об этом неизвестно. Если такая страница есть то достаточно
добавить просто ссылку
– – при создании домина на третьей вкладке остается информация о том что существует вход через субдомен я считаю что если мы подключили
уже собственный домен это часть не должна существовать. Свой реальный домен появляется не сразу значит нужно какая-то кнопка скелетон или
loader которая покажешь что подождите несколько секунд я получаю адрес домена.
– – четвёртая вкладка вообще не должна существовать в аккордеона дополнительная информация должна открываться просто под кнопкой
дополнительная информация это текст ссылкой нажимаем появляется текст второй раз нажимаем исчезает
– что точно не работает:
– – когда я перешёл на собственный домен я ожидаю что я могу войти в учётную запись как администратор с тем же самым учётной записью
которая использовал для субдомена ранее, но я получаю информацию о том что ход с данной учётной записью невозможен
– – на вкладку настройки элемента в кастомные шаблон элемента добавить раздел пользователи, если это элемент создан как независимый от
ядра. Интерфейс такой же как у пользователей в нативном элементе авторизация но естественно в нём видны только те пользователи которые
связаны с этой организацией. В данный момент при регистрации у нас нету возможности выбрать организацию поэтому единственный способ
появиться пользователем данной организации это в этом интерфейсе сделать кнопку добавить пользователя. При добавлении пользователя через
модальный окно пишем его e-mail и пароль. Если пользователь уже существует в каком-то другом элементе или в ядре, то есть мы проверяем в
базе данных по всем пользователям то мы запрещаем создавать такого пользователя. Это понятное временное ограничение которое в будущем
будет системно решаться»

## Measured

- **The admin pages link (bad 1)** — custom template `lib/menu/account-links.ts`: the admin pages exist (`/<lang>/admin/users`, `body`,
  `design`, `site-settings`, roles `PROTECTED_GROUP_ROLES.admin` = architect + the element's own admin `OWN_ADMIN_ROLE`), but since 645-3
  they live in `hiddenAccountLinks()` — the drawer (`components/shell/shell-account.client.tsx`, filtered by roles) never shows them.
  Fix: `...adminLinks(lang)` back into `accountLinks` (the drawer shows them only to architect and the own admin). Template release.
- **The «Домен» page (bad 2, 3)** — core `[item]/[[...page]]/page.tsx:409–416` + `_components/element-domain-rows.client.tsx`: rows
  1 «Главное зеркало» (ElementDomain), 2 «Сертификат», 3 «Адрес элемента» (ElementAddress, `internet` = own domain or the service
  subdomain), 4 «Вход на собственном домене» (only with an own domain; the orange info `element-own-domain-signin.tsx`). His «третья»
  = row 3 still names the subdomain once an own domain is connected; the own domain appears with a delay → a loader. His «четвёртая» =
  row 4 → not a row: a «Подробнее» text toggle (open/close) under the own domain's row. Core change, no template.
- **Own-domain sign-in refused (broken 1)** — the auth element's code (not mine to read): asked its agent `npm run task -- auth … --work`
  at ~18:10 for the exact SSO path, the refusal and a fix; answer pending.
- **Users of an app of its own (broken 2)** — the core's Users tab lives in auth's «Рабочий процесс» (`components/node-users/`, door
  `/api/node/users/*` → auth `/api/node-users/*`); auth also has `/api/app-users/*`. Asked auth's agent which doors list/create users of
  ONE organization and check an e-mail across all apps. The section would be a new page «Настройки → Пользователи» of an element whose
  `app` is `own` (core tree + the node-users composite filtered by its organization).
