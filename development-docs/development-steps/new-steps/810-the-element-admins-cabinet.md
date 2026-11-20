# 810 — the element admin's cabinet: Claude Code sign-in, terminal, Telegram, Cron and the action windows

State: PLAN — after 811 (the server installer's wall: a Linux user per element), by the owner's order of 2026-11-20 (Telegram 81/82).

## The owner's words (verbatim, Telegram 2026-11-20)

- 70: «В личном кабинете на странице администратора не хватает страницы в которой жизнь необходимо для работы администратора: Вход Claude
  Code Agent · Терминал · Telegram · крон события»
- 72: «Также я хочу быть уверен что уведомление страницах администратора также работают как и работают в административной панели архитектора
  чтобы он мог выполнять действия от системы»
- terminal ~11:00: «да, вписывай в 809 и 810, терминал А»

## Measured

- The custom template's account drawer: Accounts · Design · Site settings (template v0.3.219, 805).
- Element agents run as the node's OS user (`_agent-kit/server/bridge.cjs`, `claude-cli.cjs`; `CLAUDE_CONFIG_DIR` per element, 689); the
  boundary is a hook; Claude Code's `!` runs a shell past it → a real terminal for another person's admin = the node's keys and the
  neighbours. Own apps live only on a dedicated server (809 rule).

## The shape (terminal — A)

- The element admin's cabinet on the element's own site gets: «Вход Claude Code» (the element's own Claude account), «Терминал» = a chat
  with the element's agent — no shell, no `!`, the agent inside its boundary; «Telegram» (the element's own bot, its people); «Cron»
  (the element's own calendar and events).
- The action windows (ask-person of the element's agent) shown on the element admin's pages, «Готово» wakes the element's agent; another
  element's admin never sees them (negative control).
- A real terminal for other people's admins only on top of 811's wall (a later step).

## Proofs

- Live on the server with Marina (a8ifp, throughsongs.com): each page opens for her admin role, never for a user; a window her agent puts
  reaches her page and «Готово» reaches the agent; a second element's admin sees none of it.
