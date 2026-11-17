# 778 — element owners and the element's Telegram Mini App route (the owner 2026-11-17 17:47, Telegram 453: «В режим максимального усилия создавай шаг мы начинаем работать над этой задачей»)

The owner, verbatim: «В файловую архитектуру root и основного шаблона нужно внести маршрут в котором будет храниться Telegram мини app
для этого элемента в его папке маршру readme.md я пишу назначение. Тоже надо подумать скорее всего этот маршрут должен быть защищен чтобы
без авторизации какой-нибудь хакер не смог оттуда получить точку входа в чувствительные данные? Как мы уже говорили скажи известно тебе
эта информация или нет что каждый элемент получает свою собственную роль так называемого администратора элемента и таким образом создание
нового элемента предполагает создание новой роли? Или существует какие-то другие способы в чем идеи: если мы говорим о том что у каждого
элемента может быть свой владелец то это значит только он и архитектор всего проекта могут видеть приватный маршруты. Возможно мы это не
делали возможно это нужно описать в инструкциях и навыках элемента возможно это потребует ещё какие-то дополнительные вещи. Также скажу
тебе как это должно менять работу нашего ядра: сейчас страницы архитектора позволяют находиться в этом узле только архитектору, но какие
могут быть варианты чтобы администратор элемента получил бы аналогичную панель для управления единственным собственным элементом или может
быть если одному учётной записи доступно несколько элементов чтобы он видел там только свои.»

## ✗ The owner rejected the first fork — 2026-11-17 17:59, Telegram 466, verbatim
«Не согласен с тобой почти во всём. Когда я тебе говорил что нужно защитить маршрут то я имел в виду что пользуйтесь сможет на компьютере
ввести в адресной строке адрес который позволит ему войти в маршрут Telegram mini app. И поэтому этот маршрут точно должен быть защищен
именно такой попытки входа и защищенный должен быть той самой ролью в котором мы пока не согласовали. Теперь по поводу ролей а одним из
решений можно создать создать 980 ролей так как у нас максимальное количество элементов 980 elementAdmin001…elementAdmin980. Внести
изменения в элемент авторизации и генерировать эти роли автоматически на старте да выглядит некрасиво но гипотетически готовы решать
проблему?»

What I misread: «protect the route» = the Mini App route itself must refuse a person who types its address in a browser, by THE ROLE —
not an empty public shell with signed data calls. And «a role per element» was killed too fast: my objection («the vocabulary is code»)
holds only for a hand-written list; generated roles remove it.

## The corrected design (answered 18:1x, waits his choice: named roles or his 980 numbered)
- **The Mini App route is a protected route of the element**, locked by the element-admin role (+ architect): no session → the sign-in
  form; signed in without the role → refused; the data doors check the role (the lock).
- **The one open point — an empty gate** (`/tg-in`-like): Telegram puts its signed launch data in the URL fragment (`#tgWebAppData`), which
  a browser never sends to the server, so the server cannot see it on the first request. In Telegram the gate reads it, the element's door
  checks the signature with ITS bot token (one-time: a replayed launch data refused) and turns it into a sign-in of the account LINKED to
  that Telegram id; in a browser the gate shows only «откройте из Telegram». A redirect keeps the fragment, so the bot's button may open the
  route itself and land on the gate.
- **The link Telegram ↔ account**: the first time, the person signs in once inside Telegram; the sign-in element remembers the Telegram id
  of that account (new in auth). Then the bot opens the route at once.
- **Counterweight of the Telegram sign-in**: the session it makes is valid only on THAT element and carries only THAT element's admin role —
  even the architect's account gets the element's role there, never `architect`; so a compromised element cannot mint itself an architect
  session.
- **Roles — his idea accepted as working; my refinement offered**: the same family named by the element, not by a number —
  `elementAdmin:<id>` (spelling follows lib/roles.ts at code time, e.g. `element_admin:<id>`): no table «number ↔ element» (a port may
  change — «asked, never remembered»; the id does not, no rename exists), the Users tab shows only live elements' roles by their names
  instead of 980 empty ones (its pickers read the core's `ALL_ROLES` today — `components/node-users/*`), one code in every element: «my
  role = elementAdmin:<my id>». Created at the element's birth (the core tells auth, as 554's `ensureAppOrg`).
- **Counterweights for either variant**: only the architect grants elementAdmin roles; deleting an element (`lib/web4-items/element-delete.ts`)
  strips its role from every account — else a new element with the same id or number inherits someone else's admins.
- Facts: ports 24680–25679 (1000, core 24680) — `lib/server-port.cjs`; the owner's «980» left as his number.
- The owner's panel (P1/P2/P3) — after the roles: it depends on them; not asked again.

Status (before 17:59): the answer, the fork (B + P1 + P2, P3 later) and the checklist T1–T7 SENT (Telegram 463) — REJECTED by 466.

## The owner's answer — 2026-11-17 18:06, Telegram 468, verbatim
«Ты говоришь выдавать роль должен только архитектор вот это я не хочу задействовать его для таких задач. Поэтому лучше бы в момент
создания приложения сразу на генерировать: cuid создать ними роли и создать с ними реестр возможных адресов для элементов? Да и в принципе
генерировать их не надо они во всех проектах могут быть одинаковыми изначально создать и жёстко пришить использовать только эти названия»

Read: (1) no architect's hand in granting element-admin roles; (2) the roles hard-wired, identical in every project — no generation; (3)
a registry «role ↔ element». My named-role refinement is dropped by his word: the numbered hard-wired list it is.

Answered (Telegram 469), the design now:
- **Hard-wired list** `elementAdmin001…elementAdmin980` in `lib/roles.ts` of the core, the custom template and auth — one generator
  expression, identical everywhere; a birth never touches code. cuid — not needed: a role's name is not a secret, the lock is the server's
  check; numbers read better.
- **The registry**: each element's entry in `WEB4-ITEMS-REGISTRY/web4-items.json` gets its role number at birth — the first free one.
  Deletion strips the role from every account FIRST, only then the number is free again.
- **The Users tab** shows only occupied numbers, by the elements' names (its pickers read `ALL_ROLES` today — they must not list 980).
- **Granting without the architect**: at birth — to the person who asked for the element (signed in — at once; not on the node yet — a
  one-time invite link, whoever signs in by it becomes the admin); then the element's admin invites co-admins himself by the same kind of
  link, only into his own element; another element's role and `architect` are out of his reach; links one-time, dying after a day (768's
  token pattern). Open point for the plan: may co-admins remove each other / the first admin.
- ASKED (469): «Роль при рождении — тому, кто попросил элемент, а соадминов админ зовёт сам по ссылке. Так?»

## The owner's answer — 2026-11-17 18:09, Telegram 470, verbatim
«При рождении элемента просим ввести e-mail и пароль. В будущем архитектор сможет создать и другиеХ пользователя который смогут управлять
этим элементом не тали?»

Decided by it: at birth the node asks for the element admin's e-mail and password; later the architect may add more admins. Invite links
of co-admins — not taken (he did not pick them up; not asked again).
Answered (Telegram 471):
- **The birth window** (`ask-person --secret`-kind, 768's road — panel + the Telegram form): «Админ элемента «X»: e-mail и пароль»; the
  password is typed only in the window and goes straight to the sign-in element, never through the chat or an agent (I never see or type
  it). The sign-in creates the account with the element's role; an existing e-mail — only the role is added, the password untouched; the
  admin is the architect himself — the window is closed (he sees everything).
- **More admins later**: today already — a person registers on the domain, the architect presses «Добавить роль» in «Пользователи»
  (the element's role shown under its name); to add — «Создать пользователя» (e-mail, password, role) and «Новый пароль» in the same tab
  (the default sign-in has no password recovery — CLAUDE.md §3). Measured: the Users tab has no «create user» and no «set password» today
  (`components/node-users/node-users.i18n.ts` actions: block, unblock, addRole, removeRole, addOrg, removeOrg, marketing…).
- **The panel fork re-asked now that the roles are settled**: A (pick) — the element's own admin pages on its subdomain + its Mini App,
  both under the element's role; the agent through the element's bot on the admin's own Claude subscription (integrator's rule); the core
  panel untouched · B — the core's panel opened to the admin on his elements: every core door scoped, the terminal (a shell on the
  architect's computer), and his 2026-08-28 decision reversed. ASKED: «Панель админа — А, или тебе нужна Б?» (Telegram 472)

The owner, 2026-11-17 18:10, Telegram 471 (written before 472 arrived), verbatim: «Если пользователь проигнорировал ведение имейла, то
значит только архитектор может получить эту роль по умолчанию» → the birth window skipped: the element's admin role is the architect's
alone by default (the architect passes every element's lock; in a Telegram sign-in on that element his account gets the element's role,
never `architect`); another admin later only by «Добавить роль» / «Создать пользователя». skills_find (17:49): nothing checked fits; the open store's telegram-mini-app was read at 771 (00:27) —
thin, TON/crypto, «risk: critical», nothing taken.

Refined at max before sending (all said to him):
- **Owner = the architect inside his element, for the management branches** (staff, finance, admin); a visitor's own `account` cabinet
  stays every visitor's. **An element WITH an owner** — its management branches open only to the owner and the architect (his words «только
  он и архитектор»); **an element WITHOUT an owner** — node-wide roles work as today (T6). The owner's own staff (roles inside his
  element) — a later step (554's «application owner manages his people»).
- **The Mini App lock = the element's bot's admitted list** (the invite link `t.me/<bot>?start=…`, `_agent-kit/server/telegram.cjs`): the
  person who may control the element by its bot may open its Mini App. The web lock = the ownership record in the sign-in. Linking a
  Telegram id to an account — not in this step.
- **The integrator field already has element owners** in Telegram (skill integrator: the bot is the person's door, the agent on the
  person's own Claude subscription, the element's «Подписка Claude Code» page) — the sign-in does not know them; 778 gives the web half.
- **Elements here:** 10 native + 1 custom (root); root has NO Telegram bot (card) — T5 needs a bot made in @BotFather (the owner's act,
  `ask-person` window when we get there). The custom template release rolls out to root only.
- **Template proxy:** every `/api/*` outside `PUBLIC_API_PREFIXES` needs a session — the tg door joins the public list (it stands on the
  signature), as the core's `/api/node/tg-app` did in 771. The page stays static (`'use cache'`), `noindex`, out of sitemap and llms.
- **Freshness:** `lib/node/telegram-webapp.cjs` `INIT_MAX_AGE_S = 3600` (an hour; future-dated > 5 min refused).
- **Auth's change is built by the auth element's own agent** (`npm run task`, supervise-element) — a new auth tag pinned in the registry;
  the core never edits an element's code.

## Facts from code (measured 2026-11-17 17:50–18:00)

- **No per-element role exists, and an element's birth creates no role.** `lib/roles.ts` (core) = the template's `lib/roles.ts` (diffed:
  identical): one fixed vocabulary of 15 (`guest`, `user`, `architect` + 12 business roles), groups `account / staff / finance / admin`;
  `admin` sits only in its own group (owner 2026-08-11); `architect` in every group. Roles are PER ACCOUNT, node-wide: on a single project
  an account with `admin` is admin of EVERY element's `/admin` branch. `git grep elementOwner|elementAdmin|ownerOf` in lib/app/scripts —
  nothing.
- **The architect layer is one role by the owner's recorded decision**: `ARCHITECT_LAYER_ROLES = ['architect']` (2026-08-28, «роль
  доступа – архитектор»; widening needs the owner's word — use-roles §9).
- **App factory already scopes people per element (step 554, 2026-10-22)**: on a `factory` node `scripts/item-birth.mjs` →
  `lib/web4-items/app-org.cjs` → core `POST /api/node/users/apps` → auth `POST /api/node-users/apps` creates an ORGANIZATION with
  `element: <id>` (the «application»); `users.app` — accounts, e-mail and Google unique inside an application; auth's `/api/session` admits
  only `node` accounts, so an application person is nobody to the core and to other applications. 🛑 Not built (554-6's own words): «an
  application owner managing their own people, moving people between applications, guests of an application».
- **This node is `project`** (`npm run node-type`): every account is `node`, no application organizations are born.
- **Users tab** (`components/node-users`, core door `app/api/node/users/[[...path]]` → auth `/api/node-users/*`, roles architect·admin):
  rows carry `roles[]` and `orgs[{id,name,element?}]`; the factory application chip goes first.
- **The template's private layer** (`data/workshop/fractera-custom-item-starter/app/[lang]/(protectedLayer)/`): `account admin finance staff
  messenger-h2a messenger-h2h prototypes`; role folders `_pages/<role>/<page>/` (step 402), lock = the folder's role + `ROLE_PARENTS` +
  architect. No Telegram route yet.
- **The Mini App lock already exists in the core** (771-1, 768-4): `lib/node/telegram-webapp.cjs` — Telegram's signed `initData`
  (HMAC-SHA256, key HMAC("WebAppData", bot token)), checked against the bot's `access.json` `allowFrom`, at most an hour old; no session is
  minted — every call carries the signature. An element can do the same with ITS OWN bot: the template already reads
  `SERVICE_DATA_DIR/channel/telegram/.env` (TELEGRAM_BOT_TOKEN) and `access.json` (`app/.well-known/agent-card.json/route.ts`).
- **771-4..6's blocker is gone**: it waited for a road to an element's own server from the internet; throughsongs.com is the main domain
  since ~17:15, every element answers on its subdomain.

## The fork (draft — to be sent to the owner; my pick marked)

Owner model:
- A — a role per element (`admin_<id>`): killed — the vocabulary is code in the core and in every element; each birth would change the
  core's code and roll a release; roles grow without limit.
- **B (pick) — an ownership GRANT, not a role**: (account, element) kept by the auth element on the element's organization (the 554
  organization, born on a single project too); `/api/session` adds `owns: [ids]`; the element's lock for private routes = architect OR
  `owns` has this element's id. Roles stay one vocabulary and become element-scoped later. Counterweight in the same change: an owner may
  not grant ownership, cannot touch `architect`, sees only his element's people.
- C — a sign-in per element: killed — one sign-in element is the law (§3).

The owner's panel:
- **P1 (pick, first) — Telegram**: the element's bot lets the owner in (`allowFrom` + his Telegram id), its Mini App is his panel; the
  goal of §1 (the phone). Price aloud: the bot drives the element's agent — on whose Claude subscription (integrator: each person on his
  own, the element's «Подписка Claude Code»).
- P2 — the core's architect pages filtered to his elements: the architect layer's lock changes from one role to «architect or owner of
  THIS element» — every door under `/architect/[item]` audited (terminal, agent-api, keys); a change of a recorded decision (2026-08-28) —
  second, only on his word, after P1 lives.
- P3 — the element's own `/admin` branch locked to architect + owner (instead of the node-wide `admin`).

## The owner chose the panel — 2026-11-17 18:12, Telegram 474, verbatim
«Мне кажется вариант а это максимально правильный вариант» → panel A: the element's own admin pages on its subdomain + its Mini App,
both under the element's role; the core's architect panel unchanged.

## The plan (sent 18:2x for his «да»; no code before it)

Changed against 467, said to him: NO open gate. The Mini App is an ordinary closed route; inside Telegram the person signs in with e-mail
and password once. Whether Telegram keeps that sign-in between openings is measured on his phone (T7); only if it forgets — 778-9.
Measured 18:20: the template's protected pages are prerendered shells with a CLIENT gate (`(protectedLayer)/layout.tsx`: «the gate lives
per page — a client guard against /api/me, plus the server check inside /api/*»), so today a typed address gets the shell. The template's
`proxy.ts` already reads the session at the edge (`getSession` for `ADMIN_API_PREFIXES`) — the same edge check closes `/tg` and `/admin`
by role without making any page dynamic. The node has ONE account (the owner, every role) — closing elements' `/admin` to everyone but
the element's admin and the architect takes access from nobody.

- 778-1 Roles (core): `lib/roles.ts` — the family `elementAdmin001…elementAdmin980` (one generator expression, the same text in the custom
  template and in auth) + helpers; kept out of every role picker. The registry: each CUSTOM element gets `adminRole` at birth — the first
  free number (`scripts/item-birth.mjs`); root (the only custom element) gets `elementAdmin001` by a one-time migration. Natives get no
  number — their admin is the architect alone (sign-in, data, the node's keys). The number reaches the element as `ELEMENT_ADMIN_ROLE` in
  its env (the core writes it as it writes element key files, 768).
- 778-2 Auth — built by its OWN agent (`npm run task`, supervise-element): the family in its vocabulary; doors (architect key):
  create-or-grant {email, password?, role} (a new e-mail → an account with that password; an existing one → only the role), set a password,
  strip a role from every account; only the architect grants or strips elementAdmin roles (a project `admin` → 403); a new auth version
  pinned in the registry.
- 778-3 Core: (a) the birth window — `ask-person --secret element-admin --element <id>` (768's road: the panel + the Telegram form); e-mail
  and password go straight to the core door → auth, never through the chat or an agent; skipped → the role is the architect's alone (his
  word 18:10); (b) the Users tab — the 980 hidden, «Админ элемента» picked by the element's name, «Создать пользователя» (e-mail, password,
  roles), «Новый пароль» — a decision card FIRST (.interface-design/system.md); (c) deletion (`lib/web4-items/element-delete.ts`) strips the
  role from everyone first and frees the number only after; a failed strip keeps the number taken.
- 778-4 Custom template (release-template): the same list; `ELEMENT_ADMIN_ROLE` from env; the EDGE lock in `proxy.ts` for `/tg` and
  `/admin`: no session → the sign-in form, a session without the element's role or architect → refusal, the page's HTML never leaves; no
  exception but the owner at his own keyboard (`isOwnerAtMachine`) — not the temporary address, not the showcase; data doors
  `requireRoles([its role, architect])`; staff and finance branches + its role.
- 778-5 Custom template: the Mini App route `app/[lang]/(protectedLayer)/tg/` (address `<element>/tg`): its own layout without the site's
  header and footer, Telegram's theme mapped onto the element's own design tokens, a start screen (the element's name and state),
  `noindex`; README.md — the route's purpose (the template's general part) + «Назначение этого элемента» written by the owner or the
  element's agent.
- 778-6 Core: an element bot's menu button → `<element address>/tg`, per allowed chat (771-3's way), when the element has its bot and an
  own-domain address.
- 778-7 Words: the element instruction line (`npm run instruction:element`), the skill `telegram-mini-app` for element agents (771-5),
  use-roles «Админ элемента», a CLAUDE.md §3 line (his «да» to this plan is the owner's word for it).
- 778-8 The template release rolled to root, ONE core build, the proofs; root's bot made by the owner in @BotFather (an ask-person window)
  for T7.
- 778-9 Only if T7 shows Telegram forgets the sign-in: «Telegram remembers you» — the Telegram id linked to the account, a session valid only
  on that element and only with its role.

## Tests (the checklist sent with the plan)
- T1 the core, the template and auth hold the same 980 names; a test birth takes the first free number; root holds elementAdmin001.
- T2 a guest types root's `/tg` or `/admin` in a computer browser → the sign-in form; the page's HTML never arrives (curl: a redirect, no
  page markup).
- T3 signed in without the role → refused at the edge; with another element's role (elementAdmin002) → refused on root; with elementAdmin001
  → in; the architect → in. Doors: 401 / 403 / 200 the same way.
- T4 the birth window: a new e-mail → an account with the role; an existing one → the role added, the old password still signs in;
  skipped → nobody but the architect; the password appears nowhere — logs, chat, agent transcripts (grep).
- T5 «Пользователи»: no 980 roles in the pickers, «Админ элемента» by name, create and new password work; a project `admin` granting an
  elementAdmin role or architect → 403.
- T6 a test element deleted → its role stripped from every account, then the number free; the next birth takes it with no admins inherited.
- T7 the phone: root's bot menu button opens `/tg`; the first time — the sign-in inside Telegram; 390 px light and dark; console clean;
  opened again later — remembered or not (measured).
- T8 nothing else changed: the Users door before/after; root's public pages answer as before.
Price: one core build; one custom-template release (root); one auth version (its agent's session); the owner's minute in @BotFather.
