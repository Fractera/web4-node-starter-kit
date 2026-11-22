# 841-3 — the Fractera marketplace element on fractera.ai (search v1, live side)

## The owner, Telegram 984–994 (2026-11-22 21:13–21:22 UTC)

«стандартизировать API который будет отправлять в элемент Fractera запрос например: описание, а в ответ принимать короткое описание и
ссылки на публичной странице … быстро поднять такой элемент который прямо сейчас возвращал бы какой-нибудь ответ заглушку» (984) · «элемент
который будет работать за счёт денег самой Fractera … любой элемент в будущем будет туда ходить за информацией» (987) · «возвращать три
вещи: описание, ссылка, цена» (991) · «на сайте Fractera появился новый нативный элемент f2f marketplace у него минимальная функциональность
без дизайна но он возвращает необходимый ответ также он имеет необходимый описание и стандарт api» (994).

## What it is

A NATIVE element of Fractera's own server node (fractera.ai), born there by its main agent: `npm run create -- --native --app project
--name "Маркетплейс Fractera" --role "Answers every node's search of the Fractera marketplace (search v1): a short summary and, per element,
what it does, its public page and its price"`. It runs at Fractera's cost; no design (minimal); its address on the server's domain, and the
apex fractera.ai routes `/api/marketplace/*` and `/marketplace/*` to it (the server's main agent adds the routes).

## Its two surfaces (the contract is fixed in the core: lib/web4-items/fractera-market.mjs)

- `POST /api/marketplace/search` — public, no key: `{ v: 1, query, lang }` → `{ v: 1, mode: "simulation", summary, items: [{ title,
  summary, url, kind: "native"|"custom", price: { amount, currency: "USD"|"USDC", per: "once"|"month" } | null }] }`; while the catalogue is
  empty `mode: "simulation"` with the two example pages; rate-limited per IP; never stores the query with an IP.
- `GET /marketplace` — one plain page: what the marketplace is, the API standard above (request, response, an example), and the list of
  published elements (empty now); `GET /marketplace/<slug>` — an element's public page (the two examples now).

## Proof

From this Mac: `npm run market -- "монтаж видео"` prints `===MARKET_LIVE===`? No — `mode` stays "simulation" until real elements are
listed, but the line comes FROM fractera.ai (the client's `why` is absent); `curl -X POST https://fractera.ai/api/marketplace/search` gives
the v1 JSON; a request with `v: 2` → 400 (negative).

## Why it is not born from the Mac

Only the server's own main agent creates an element on that node (CLAUDE.md §4 «Create an element»); a walled element there needs its own
Claude account only if its agent works — this element's code is delivered whole by the creating agent, it needs no agent of its own to serve.
