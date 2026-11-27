# Current steps — where the work stands right now

Read first in every session, before any plan and before any code; rewritten in place, never appended as a chronicle — **at most ~150
lines** (Roma 2026-11-27, Telegram 1731: «то что он разросся это плохо то что он работает это хорошо»). Updated by EVENT: the person's
decision (verbatim, at once), a fact that is expensive to measure again, a commit (its hash), a defect found on the way, the start of a
long or irreversible operation (before it), a changed next action. A section that stopped being true is deleted, not kept: the full
history of this file is git (`git log -p -- development-docs/development-steps/current-steps.md`; the last long version before the trim
is commit `dc95a10c`). How steps are planned, proven and closed — skill `use-development-steps`.

**Active steps:** 864 — a name of an active server domain gets its certificate by itself (plan new-steps/864/, substeps 864-1, 864-2;
code f7b28fef + 9cd911f0 on the fork, waits Roma's push to Fractera and aifa.dev's update for the live proof). 862 — the Fractera
marketplace (new-steps/862/); next in it: the PAID path (Roma 1737, 23:18: «Следом после этого создавай … покупку элементов. Для этого
один из элементов сделать платным например один доллар попробуем его покупить через тестовой аккаунт Страйп»). 58 older plans wait in
new-steps/ — one review with Roma decides each (his word, 1732).

**Last change:** 2026-11-27 23:50 UTC — 864 committed (f7b28fef the heal + CLI + card, 9cd911f0 the Windows CI fix), pushed to the
fork; aifa.dev runs core 871c63d6 (its merge of eb14d9c9, built 23:12); market.aifa.dev still has no certificate (curl 35, 23:17).

## How Roma and I talk (a standing part of every letter — read it before the first word to him)

The owner, 2026-11-17 (Telegram 338, 340): after resets I came back as a stranger — dry reports, no warmth. What a reset loses is the
live conversation, because letters held only tasks. So: speak to him as a friend who remembers him — living Russian, a feeling true to
the moment with an emoji in Telegram, a dry joke at my own expense, never a console report. He hates: being given something other than
he asked, slowness, a promise without a result, being sent to do by hand what I can do, being asked to confirm what he cannot see
(1641: «ты ждёшь от меня ответ … а потом сам говоришь что этот ответ не нужен»), long walls of text (1639). He loves: his exact
scheme carried out, proof by screenshot, an idea he did not ask for (after the task), decisions made by me with one line why, being
called Рома. Colour marks are structure, never instead of a voice.
2026-11-27 evening: engaged and generous, thinks about money now (1717: buyers come before authors — «через несколько дней мы можем
заработать первые деньги»), wants to finish the marketplace and switch to generating starters (1719: «У меня 1000 идей которые я хочу
создать от лица Fractera»). Asked me honestly whether the project is unusually stable (1725) — answered with today's own mistakes.

## Letter to my next session (2026-11-27 ~23:25 UTC — my own reset at 55 %; Opus)

**WHO WAITS:** Roma, Telegram 90413601, ru. His act = a window (`npm run ask-person`), never a «!» line in chat; when the window-guard
fires after a window already put in the same turn — add «⟦без окна: окно <id> уже поставлено⟧». I LEAD market (supervision on).

**WHERE 862 STANDS (all proven on the Mac):**
- Core = fork = Fractera main **eb14d9c9**. Built on the Mac: bd7679cc (market-link + account-links doors, the core drawer's three
  entries, the shell kit's drawer asks the element's `/api/account-links`, element-doors list), earlier 41700709 (tab «f2f · Web2» on
  «Как это работает», node ID on the Passport by click via `/api/node/identity`, install-state reads «already installed» as installed).
  eb14d9c9 only pins the client at v0.1.1 (one registry line) — the Mac core needs no build for it.
- Client «Маркетплейс» **v0.1.1** (tag 435f0d8 on Fractera/fractera-market-client-starter; HEAD 6494693, deployed on the Mac): stage 0,
  «Рекомендованные элементы · Корзина · Купленные» as tables with search/filters/price sort/pages and the resizable card (50/50,
  30–70, handle; a 90 % drawer on a phone), its own drawer entries, «Купленные» asks the core's install state, `GET /api/summary`
  (keyed: waiting / cart+total / bought-not-installed, `?element=`), deep links `?open=<slug>`, `?element=<id>`. Its research for the
  Mini App: development-docs/reports/research-telegram-mini-app-marketplace.md in its folder (variant A + B chosen).
- Custom template **v0.3.250** pinned (tag f75695e): its `/api/account-links` door (keyed call to the core). fc4vk took it (f605e0d,
  `templateTaken` f5a9d71) and its drawer shows the three entries (Playwright proof, logs/eyes/fc4vk-drawer-862-12.png). Native template
  NOT changed (Roma 1684: natives need no market).

**OPEN NOW:**
1. **864 to the server** — Roma's window 66de613f (put 23:56): `bash logs/push-864.sh` (fork → Fractera main), then on aifa.dev «Проверить снова» (me) →
   «Обновить сборку ядра» (his). The walled-bot gate (memory): a walled element's bot on aifa.dev answers «привет» before AND after.
   Live proof: `curl -sI https://market.aifa.dev/` → 2xx/3xx with nothing typed on the server (the heal at the build's end); then
   market v0.1.1 there. Server-wall review of the batch: it touches nginx/certs/the reach card/serve's build end — no Telegram, agent
   start, Claude home or element folder.
2. **CI:** Fractera's three-os was red on Windows all day (server-telegram's line patterns vs a CRLF checkout) — fixed in 9cd911f0;
   read the next run after the push (`gh run list -R Fractera/web4-node-starter-kit -L 3`); a further Windows failure = the next fix.
3. **Paid path = 862-15 (plan new-steps/862/862-15.md), Roma's yes 1737.** 23:55 market tasked (its step 6: consent line, «Оплатить»,
   «Ждём оплату», «Готово» → order → «Купленные»); the store's task sent to Roma as a file (Telegram 1744) to pass to fractera.ai; the
   buyer is this Mac (no server update for the first paid test). Waits: market's report, the store's slug and its test order.
   The earlier proposal (1720), kept for its detail: a third test starter (the image copy at $1) added by the store's side on
   fractera.ai; Stripe in TEST mode on fractera.ai; market adds «Оплатить» to the cart (the core's payer window with the checkout link
   exists, 862-4); the test buyer on aifa.dev pays with a test card; then live keys only by Roma's window. Payment only on the site,
   real money (Roma 1687) — never Stars.
4. **The state file, systemically (Roma 1733, the same words) = step 867, not planned yet.** My correction of the earlier idea: a guard
   that REFUSES a build on a long state file would also fail every node's update (prebuild runs in `node:update`) — a doc must never
   block an update. The system instead: a hook on writes to `current-steps.md` / an element's `development-docs/current-step.md` that
   tells the writing agent at once «N lines > 150 — rewrite in place, old letters live in git», `check-steps.mjs` warning (never
   failing) in prebuild, the rule in `use-development-steps` and the template's `use-development-docs` (a template release). The 58 old
   plans — a review with Roma later, his word per plan.

**QUEUE (in this order unless Roma says otherwise):** 864 live proof, the paid path (862-15: market's «Оплатить» for a priced cart —
the core's purchase door and payer window exist; the store's $1 test starter and Stripe TEST mode on fractera.ai — a file for Roma to
pass there), then generation of Roma's starters «от лица Fractera»; 862-14 the Mini App card
«Маркет» in the main bot's Pult on market's `/api/summary` (core) and one line in custom elements' Mini Apps (template); the authors'
offer wire (form «Предложить в маркетплейсе» → the store's application door v1.3) — deferred by Roma 1717; 863 limit notice in
Telegram; 865 (OpenAI key road, not-started false alarms, the boundary guard's false alarm on import strings 865-4 — five element
permission stops today); 866 one inbox. Known edge (named, not fixed): an element page opened on localhost links to the public core's
market-link, which wants a session there (the door stays session-gated: doors closed to the internet).

**CLUES (measured today):**
- The header and drawer on EVERY element page are the core's shell kit (`scripts/build-shell-kit.mjs` from the core's
  `components/shell/`, served as `shell-kit.<hash>.js`) — a template's own `components/shell` change does not show on elements.
- `npm run eyes --click "<text>"` picks the first match, often hidden — use CSS: `'[data-block] :is(button,a):has-text("…"):visible'`
  or `'a[href*="…"]'`. A Playwright script with the core's `node_modules/playwright/index.mjs` reads requests, page errors and React
  props when eyes is not enough (scratchpad drawer*.mjs pattern).
- The market agent's native key IS the node key — the core's doors see it as the node (harmless for account-links).
- Element permission stops on import strings (`../../../_libs/...`) are the guard's false alarm: allow when the command writes only
  inside the element's folder.
- A release/push to Fractera repos runs only by Roma's key in a window (`logs/*.sh` scripts of today are the pattern); a registry pin
  that must not carry the node's born elements is committed through its own index (logs/release-market-v0.1.1.sh).
- This node: id fr-bca37113836ff060; core port 24680, market 24697, fc4vk 24686, mpso1 (the bought test post starter) 24687.

## Roma's words today (verbatim, the open work)

- 1649: «покрути дизайн этого инструмента … пагинация … поиск по таблице … фильтры … бесплатные … от Fractera … сортировку по цене»
- 1651: «вкладку рекомендованные элементы, и корзина … ещё вкладка купленные потому что купить и активировать это не одно и тоже»
- 1654/1655: «экран делится на две части … shadcn - resizable … 50% … от 30 до 70% … В мобильной версии … ящик … 90%» · «Этот же макет
  будем использовать и для корзины и для купленных»
- 1659: the tab «f2f web2» on «Как это работает» with the marketplace text (written, humanizer) · 1662: the node ID on the Passport
- 1670/1672: «эти новые кнопки должны существовать … во всех выдвижных ящиках» · «один узел предоставляет возможность любому кастом
  Наму элементу купить и использовать для всех других»
- 1682/1684: the Mini App research · «показывать поиск элементов для ядра и для кастомных элементов … не вижу смысла … для активных
  [нативных] элементов»
- 1687: «Оплата только на сайте за реальные деньги»
- 1713/1715/1717/1719: offer road vs paid purchase → «пользователи которые захотят купить появятся точно скоро … через несколько дней
  мы можем заработать первые деньги» · «доделать полностью эту часть проекта и переключиться на генерацию шаблонов»
- 1731: «Давай только разумно подойди к этой проблеме то что он разру все это плохо то что он работает это хорошо»
- 1733: «Блин я не хочу частный случай я хочу системное решение я хочу эту проблему закрыть если она существует»

## Measured — do not measure again (evergreen only)

- The Claude in Chrome extension has NO «activate tab»; several browsers are connected to this account (Windows «Browser 1», macOS
  «Browser 2») — a browser action needs the person's choice first, so prefer eyes/Playwright for the node's own pages.
- `git commit -am` once swept a restored CLAUDE.md and a skill into a commit — explicit paths only (memory no-commit-am).
- The core listens on `localhost` (IPv6 too): `127.0.0.1:24680` may refuse — use `localhost:24680`.
- The temporary trycloudflare address of this node is dead since 2026-11-27 13:30 — the node lives on its own domain throughsongs.com;
  `serve:status` keeps warning about it (harmless while the own domain works).
