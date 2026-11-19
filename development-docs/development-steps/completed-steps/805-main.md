# 805 — an app of its own: sign-in on its own domain, the «Домен» page, the admin pages link, its Users — summary

Closed 2026-11-19 (live on this computer, build a6f9a566). Repositories: the core (`main`) 03bf9877, debfd226, 8c9d9a9e, ada96477,
pins ee11262f (custom v0.3.219) and 0f70a00f (auth v2.4.45); custom template a340bcf = v0.3.219; auth c873b42 = v2.4.45 — both pushed
by the owner's paste 18:5x; `services:install --only auth` RC=0.

## The owner's words

- ~18:00, his server test (verbatim in the core's git, 03bf9877): no admin pages in the drawer; the «Домен» page keeps the subdomain
  sign-in row after an own domain and shows the domain late (a loader); the fourth row must be a text link that opens and closes; on the
  own domain the admin account is refused; an app of its own needs «Пользователи» with «Добавить пользователя» (e-mail + password, an
  e-mail already in the node refused).
- 18:20: «не надо никому отдавать это решение и задачи это твоя работа ты её начал ты её и делай» — done in the workshops myself.

## What was built

- Auth (workshop `data/workshop/fractera-auth-starter`): the cause — «войти другой записью» on the own domain went to /login without
  `requireRole` → the form's default «architect» → «Доступ запрещён». `required-role.mjs`, continue-as and sso always name the role;
  `ownAppHost` by the registry `app` (my 804 had broken it by reading `nodeType`); `mayAdminister` with the element's own admin role;
  POST `/api/app-users/create` (an e-mail taken anywhere → 409).
- Custom template: the admin links back in the drawer (hidden since 645-3), the own admin enters the admin child pages, the
  «Добавить пользователя» window with the create door.
- Core: the «Домен» page — the sign-in note is a «Подробнее» text link under the own domain's row, the service address row only without
  an own domain, a loader «Получаю адрес домена … — несколько секунд…» (every 3 s, up to 40 s).

## Proofs

- Auth: element-admins 29/29 on a real build (5 new for 805 with negatives), required-role 3, own-app-host 3; prebuild RC=0.
- Custom: dry release green; tags on GitHub (ls-remote) after his paste.
- The live plane — his test on the server (below) is still owed.

## Mistakes on the way

- I handed his bug to the sign-in element's agent at first — his order: the one who began the work finishes it.
- The parts map was built before the last interface edit (ada96477 after 8c9d9a9e).

## Left open

- The core push (window c8b2aa2b) and ONE server update, then his test on fractera.ai: the own domain → «Войти другим аккаунтом» →
  the admin's password → in; the drawer's admin pages; «Добавить пользователя» (new e-mail works, an existing one refused); «Домен»
  without the address row, the «Подробнее» link, the loader.
- New phrases to agree: the add-user window, the domain loader.
