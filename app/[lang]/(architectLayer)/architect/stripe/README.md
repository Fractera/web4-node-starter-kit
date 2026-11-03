# `/architect/stripe` — the Stripe payments element's section

Step 631 (owner, 2026-11-03: «По какой-то причине отсутствует страйп хотя я уже многократно говорил что нативные элементы которые по
умолчанию выключены всё равно должны устанавливаться»): the payment element of step 573 — **stripe** (`WEB4-ITEMS/core/stripe`,
repository `fractera-stripe-starter`). It was installed on every node, but the core had no section for it, so the left menu did not
show it. Its passport turns it off by default («Turn it on after you enter your Stripe keys»): the element's pages carry the «turned
off» banner with that reason.

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Stripe payments»: title, lead, `order`, icon `card` |
| `_components/index.ts` | one block `servicePort` with `serviceId: 'stripe'`: port on the machine and address on the internet |
| `preview/` | live preview of the element's home page |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- stripe`; never edited by hand |
