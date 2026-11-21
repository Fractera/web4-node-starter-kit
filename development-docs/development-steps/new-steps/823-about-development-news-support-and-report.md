# 823 — «О разработке» in both Pults: the project's news from GitHub, «Поддержать проект», «Нашли проблему? Сообщите нам»

State: PROPOSED 2026-11-21 ~10:55 UTC — the owner's 458, 459, 461 (intake pre-steps/2026-11-21-about-development-news-and-support.md).
Waits: the three Stripe links of «support the project» (asked in Telegram 460) and his «да» to this plan.

## The design (mine)
- A last item of the drawer «О разработке» in the core's Pult (the architect's Mini App) and in every custom element's Mini App
  (template), one screen with three groups:
  1. **Новости** — a folder `news/` in Fractera/web4-node-starter-kit (one note per item, ru and en, plus `news/index.json`); every node
     reads it from raw.githubusercontent.com with no key, cached 30 minutes; GitHub unreachable → the last copy read, the node's work
     never depends on it. Publishing: the owner says «опубликуй новость: …» in Telegram → the main agent commits the note on the owner's
     node (the owner's key) — never on another node.
  2. **Поддержать проект** — three cards, each a Stripe payment link of Fractera (the links of the easy-starter, from the owner);
     Fractera is the merchant of record; the node never touches the payment.
  3. **Нашли проблему? Сообщите нам** — opens the owner's Telegram (@roma_armstrong) through `web_app_open_tg_link`; the owner may set Star
     Messages (Premium) — said on the row as «первое сообщение может стоить звёзд».
- The words of the three groups come with the template and the core; the links live in one data file of each (no key, no secret).

## The support cards, found (2026-11-21 ~11:10 UTC; the owner's 469–470 pointed to Fractera/fractera-easy-starter)

- Cloned read-only into the session's scratchpad. `components/sections/sponsorship-section.tsx`, words
  `lib/i18n/locales/{en,ru}/sponsorship.ts`, door `app/api/stripe/checkout/sponsor/route.ts`: three MONTHLY subscriptions —
  $1 «Чашка кофе — каждый доллар важен» · $5 «Поддержка — топливо для дорожной карты» (ПОПУЛЯРНО) · $20 «Чемпион — место на странице
  спонсоров», each with two perks; paid by Stripe Embedded Checkout created on fractera.ai's server with Fractera's secret key and the
  prices STRIPE_PRICE_SPONSOR_1/5/20 (env), after a sign-in there; a sponsors page lists them.
- No static links exist. A node never holds Fractera's secret key → the node's cards need three **Stripe Payment Links** (static
  `buy.stripe.com/…`, hosted by Stripe) made for those three prices in Fractera's Stripe account — the owner's act or his yes.
- ⚠ The $5 perk «Инструкция по удалению брендинга «Powered by Fractera»» conflicts with the node's law «The Fractera mark in the
  footer is never touched or moved up» (CLAUDE.md §6) — the owner decides.

- **DECIDED by the owner, Telegram 472 (11:06 UTC), verbatim:** «Да надо будет упростить описание никаких специальных опций мы не
  предоставляем просто пользователь выбирает как нас поддерживать. А я потом в будущем шаге по твоим инструкции сделаю на странице Stripe
  необходимые действия» — the cards: amounts only ($1 · $5 · $20 a month), no perks (the branding conflict is gone); the three Payment
  Links are made by the owner himself in a future step, by my instructions (the step writes them for him, a window per act).

- **The owner, Telegram 473 (11:07 UTC), verbatim:** «Просто чтобы замотивировать скажи что проект разрабатывается и поддерживается
  одним разработчикам, ваша помощь позволит архитектору продолжать ну и коротко расскажешь что я Рома Армстронг поставишь мою фотографию
  можешь взять из репозитории GitHub Fractera если у тебя нет» — the support group opens with one developer's words: the project is
  built and kept by one developer, your help lets him go on; a short line «Рома Армстронг» with his photo (from Fractera's GitHub —
  find the image in the repository or the org's avatar; a file of the template, never a hot link).

## Substeps (proposed)
- 823-1 `news/` in the core's repository: the shape, the first note, `npm run news -- publish` on the owner's node.
- 823-2 the element's screen (template patch release) — reader with cache, cards, the report row; eyes 390 px both themes.
- 823-3 the core's Pult screen — in the one core build of 821 (asked first).

## Test checklist
- T1 the reader: index read, cached, GitHub down → the last copy (negative: a broken index never breaks the screen).
- T2 the report row posts `web_app_open_tg_link` with `/roma_armstrong` inside Telegram, a plain link outside.
- T3 eyes of both screens at 390 px, light and dark, no console errors.
