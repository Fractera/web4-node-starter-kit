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

## Substeps (proposed)
- 823-1 `news/` in the core's repository: the shape, the first note, `npm run news -- publish` on the owner's node.
- 823-2 the element's screen (template patch release) — reader with cache, cards, the report row; eyes 390 px both themes.
- 823-3 the core's Pult screen — in the one core build of 821 (asked first).

## Test checklist
- T1 the reader: index read, cached, GitHub down → the last copy (negative: a broken index never breaks the screen).
- T2 the report row posts `web_app_open_tg_link` with `/roma_armstrong` inside Telegram, a plain link outside.
- T3 eyes of both screens at 390 px, light and dark, no console errors.
