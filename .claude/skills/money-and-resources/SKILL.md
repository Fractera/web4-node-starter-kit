---
name: money-and-resources
description: "Work process. Where the node's money goes and whether it lasts today — answered from the node's ledger of paid calls with no model and without reading a key. Load it when the person asks «за что уходят мои деньги», «сколько я трачу», «кто тратит ключ OpenAI», «хватит ли на сегодня», «какой баланс», «почему перестал работать голос/перевод», when `npm run person` or `npm run where` prints a red money line, or when the person asks for a daily budget of a service."
---

# Money and resources of the node

**Process: work** — reading data; no commit, no build. The owner, 2026-11-11: «тебя обвинили в избыточном поведении а твой ответ
заключается в следующем я понятия не имею какие элементы или для каких целей используют апи» — this skill is the answer to that.

A hint, not a law: models of late 2026 work worse under rigid step-by-step instructions.

## Where the facts are

- `npm run money` — today (UTC) by consumer and provider: calls, answered, refused with the provider's own reason and code, tokens.
  `--day <YYYY-MM-DD>`, `--who <consumer>`, `--days`, `--json`. The core's ledger only (`data/node/usage/`).
- `npm run money -- --balances` — today's burn against the daily budget, and what each provider tells about money. A few HTTP calls,
  no model, free; run it when the person agrees or asks, and say so.
- The page «Dashboard → Все подписки» (`/<lang>/architect/dashboard/subscriptions`) — every service × every element that uses it, the
  elements' own ledgers too, the keys' state, the last refusal; the «Budget» popover and «Check balances». Give the person the link.

## What a provider tells — measured, never from memory (`lib/money-day.cjs` names the pages)

- **OpenAI** tells no balance through its API. The day's spend in USD only with an Admin key `OPENAI_ADMIN_KEY` (not the node's key).
  Without it: «баланс OpenAI через API не узнать — он виден на странице оплаты» + https://platform.openai.com/settings/organization/billing/overview.
- **Exa** tells the balance in USD with a service key `EXA_SERVICE_KEY` (its Team Management API is enabled per team on request).
- Any other provider — say plainly that the node does not know how it tells money. A new provider joins by a measured entry in
  `PROBES`, read at its own documentation — a build step, not an answer.

## How to answer

- «За что уходят деньги?» — `npm run money` (and the page for the elements): who called, which provider, how many calls, how many
  refused and why, in the person's words. The node counts CALLS and tokens; it knows no price list — never turn calls into a sum.
- Empty ledger → «платных вызовов сегодня не было». Never invent a number.
- «Хватит ли на сегодня?» — `--balances`: «на сегодня хватит» / «при таком темпе бюджет кончится в 15:00» / «поставщик уже
  отказывает из-за денег с 22:46 — пополнить: <billing link>». No budget set → offer to set one on the page, in calls a day.
- «Как дела у проекта?» (`npm run where`) ends with ONE offer to check the balances — not more.
- A red line at the start of a session (`npm run person` prints «Money is red today …») goes into your first answer, once.
- A key is never read, printed or asked for in chat; the OpenAI key is given only through `/openai_key` (the node checks and deletes the
  message). Topping up is the person's action in the provider's own screen — give the link.
