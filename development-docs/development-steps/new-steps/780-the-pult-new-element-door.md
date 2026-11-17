# 780 — «Пульт»: «+ Новый элемент», the person's words go to the main agent as a request

The owner, 2026-11-17 22:15 UTC, Telegram 538, verbatim: «Ты считаешь имеет смысл нам в пульте на Telegram создать инструмент для
создания нового элемента мне кажется экологично если человек работает с телефона?» → my answer 539: a door in, not a form (A — a field
whose words reach the main agent, which shapes the need and answers with variants; B — a full form that creates at once, not advised; C —
nothing, the chat already does it). 22:25, Telegram 540: «Да» → A.

## Built
- `lib/node/tg-app/page.cjs` + words: the last row of «Ваши» — «+ Новый элемент» → one field «Что должен делать новый элемент?» →
  «Отправить»; after sending the Pult closes so the answer in the chat is seen.
- `/api/node/tg-app` action `newElement` {text 3–1000} → `__web4AgentWake('build', …)` with the node's head `pult-request` (a new kind in
  `lib/agent-kit/node-line.cjs` and NODE-LINES.md); the main agent runs the order of a request; nothing is created before the yes.
- Tests: scripts/tg-app.test.mjs (the row, the action, the close, the kind).
