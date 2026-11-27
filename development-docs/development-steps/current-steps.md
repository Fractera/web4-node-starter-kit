# Current steps — where the work stands right now

Read first in every session, before any plan and before any code; rewritten in place, never appended as a chronicle — **at most ~150
lines** (Roma 2026-11-27, Telegram 1731: «то что он разросся это плохо то что он работает это хорошо»). Updated by EVENT: the person's
decision (verbatim, at once), a fact that is expensive to measure again, a commit (its hash), a defect found on the way, the start of a
long or irreversible operation (before it), a changed next action. A section that stopped being true is deleted, not kept: the full
history of this file is git (`git log -p -- development-docs/development-steps/current-steps.md`; the last long version before the trim
is commit `dc95a10c`). How steps are planned, proven and closed — skill `use-development-steps`.

**Active steps:** 862 — the Fractera marketplace (plan new-steps/862/862-main.md; substeps 862-0, -2, -6, -12 as files there). Next:
864 (a name born on a server gets its certificate — it blocks the buyer test on aifa.dev now) and the PAID purchase path (proposed,
waits Roma's yes). 58 older plans wait in new-steps/ — none is active; one review with Roma decides each (his word, 1732).

**Last change:** 2026-11-27 ~23:25 UTC — this file trimmed from 850 lines to the open work (Roma 1731); aifa.dev's second update to
Fractera eb14d9c9 is building.

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
1. **aifa.dev second update** (window 0fee5c08 pressed 23:06) — it was on bbb30a5a (carries 2dedd62f); check
   `curl https://architect.aifa.dev/api/health` commit is new (the server's merge of eb14d9c9), then whether market v0.1.1 is up there.
2. **market.aifa.dev has no certificate** (TLS «unrecognized name») = step 864. Roma 1733 (23:15): «Блин я не хочу частный случай я
   хочу системное решение я хочу эту проблему закрыть если она существует» → NO manual repair as the answer: build 864 itself (plan
   new-steps/864-…: a name born on an active server domain starts `certs` + `check` by itself; `server -- domain` says «unfinished» for
   a required name without a certificate; the panel's «Выпустить сертификат»), load dedicated-server, server-wall, before-a-build
   first; proof = a name born on a server reaches HTTPS 200 with no manual command + a negative. aifa.dev's market name is its live
   case (on fractera.ai the same was repaired by hand: `server -- dns-check` → `certs` → `check`).
3. **Paid path — proposed in 1720, waits Roma's yes:** a third test starter (the image copy at $1) added by the store's side on
   fractera.ai; Stripe in TEST mode on fractera.ai; market adds «Оплатить» to the cart (the core's payer window with the checkout link
   exists, 862-4); the test buyer on aifa.dev pays with a test card; then live keys only by Roma's window. Payment only on the site,
   real money (Roma 1687) — never Stars.
4. **The state file, systemically (Roma 1733, the same words):** the trim above is the one-off; the system = a guard that refuses a
   build when this file passes ~150 lines (the core's `scripts/check-steps.mjs`, in prebuild) and the same for every element's
   `development-docs/current-step.md` (the templates' `scripts/check-dev-docs.mjs`, a template release), with the rule in the skill
   `use-development-steps` / the template's `use-development-docs`: rewrite in place, old letters live in git. Plan it with 864 in one
   core build. The 58 old plans — a review with Roma later, his word per plan.

**QUEUE (in this order unless Roma says otherwise):** 864 automation (a name born on an active server domain starts certs itself;
the panel's «Выпустить сертификат»), the paid path, then generation of Roma's starters «от лица Fractera»; 862-14 the Mini App card
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
