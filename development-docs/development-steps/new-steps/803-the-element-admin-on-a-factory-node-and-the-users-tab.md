# 803 — the element's admin on a factory node, the sign-in choice on an element's domain, the Users tab, the custom «Домен» page

State: IN WORK — the owner's go 2026-11-19 (terminal: «Раз ты идёшь в сторону исправления элемента авторизации реализует эти ответы на
эти вопросы в работу»). Delivery to the server is the last substep and waits his word on its cost (one server update).

## The owner's words (verbatim, 2026-11-19)

1. «кастомные шаблон несмотря на то что у него появился новый инструмент для создания авторизации не предоставляет администратору элемента
   права его архитектора»; https://architect.fractera.ai/ru/ay3tz/settings/domain — «очевидно что здесь ты должен провести то самое
   изменение интерфейса к которым мы с тобой говорили».
2. «любая попытка войти подгружает из кэш учётную запись fractera.ai»; incognito: «с той учётной записью которой мы создали я зайти не
   смог зато мне предложили зарегистрироваться заново … и даже после этого я попал в роль пользователя».
3. https://architect.fractera.ai/ru/auth/users: «как вообще могли создастся две записи с одинаковым имейлом»; deleted records stay as
   «Удалённый пользователь» — «Возможно это правильно если … заново позволить пользователю зарегистрироваться»; «почему у администратора у
   единственного суперпользователя существует кнопка удалить и обезличить … очевидно что это ошибка».

## Measured (the server, his Chrome, /api/node/users)

- mm@… 13:41:44 — roles [user, elementAdmin002], orgs [] → app `node` (the birth window; never signed in).
- mm@… 13:43:22 — roles [user], org «Fractera» (element ay3tz) → app `ay3tz` (his incognito registration).
- Marina has an app organization: born on a factory node (554-1, `scripts/item-birth.mjs`).

## Causes

- C1 (2, 3a): the sign-in's `grantElementAdmin`/`insertAccount` hard-code app `node`; on the element's own site `admittedTo(siteApp,
  node account)` admits only the architect and a guest → the admin is refused, the form offers a registration → a second account in
  the element's app with role `user`. Two records of one e-mail in two apps are the factory's law (554: «одна почта в двух приложениях —
  две учётные записи»); here they came from C1.
- C2 (2): `app/api/auth/sso` gives the code at once to a central session admitted everywhere (the node's architect) — no way to choose
  another account.
- C3 (3c): the Users tab offers «Удалить и обезличить» on one's own record (the sign-in skips «self» silently); at this computer the actor
  is `owner@machine`, not a row — so the ONLY architect can be anonymized from here, and a node's architect has no recovery.
- Deleted records: anonymization writes `deleted-<id>@invalid` — the e-mail is free again; the record keeps its id and journal (CLAUDE.md
  §8). Kept as it is.

## Substeps

- 803-1 sign-in (its agent): the element admin lives in the element's app when it has one (`element` in element-admin and create; an
  existing account of that app gets the role, its password untouched); the last active architect is never anonymized, blocked or
  stripped of `architect` (skip `last-architect`); the SSO door with a central session that is not this site's own person shows a choice —
  «Вы вошли как {email}» · «Продолжить как {email}» · «Войти другим аккаунтом» (en: «You are signed in as {email}» · «Continue as
  {email}» · «Sign in with another account»); tests with negative controls; commit.
- 803-2 core: the birth window passes the element (`saveElementAdmin` → `grantElementAdmin({ element })`).
- 803-3 core: the Users tab hides «Удалить и обезличить» on the viewer's own record.
- 803-4 core: the custom element's «Домен» page by the decision card (sections: H2 ui + one muted line above a bordered card of closed
  accordion rows; the top menu; a bottom strip with the arrow instead of a floating button; no shadows).
- 803-5 delivery: sign-in v2.4.44 tagged and pushed (his window), the core pinned and pushed, ONE server update (his word), his test:
  delete Marina, create again, the admin window, incognito sign-in on her domain → one account with elementAdminNNN.

## Proofs

- Sign-in tests: the admin of an app element is created in that app and signs in on its site; negative — app `node` refused there.
  The last architect: anonymize/block/removeRole refused; negative — with two architects one may go.
- Core: tsc, prebuild RC=0, core build, eyes of the Users tab (no button on one's own row) and of a custom «Домен» page.
- Live on the server only after 803-5.
