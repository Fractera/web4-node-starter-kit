# 797 — the element's menu follows the core's menu — summary

Closed 2026-11-18 18:16 UTC. Repository: the core (`main`), commit ef16cf03 (build ae7a59ed live 18:13, RC=0).

## The owner's words

- 757: the Mini App's common items stand beside the modes under «Рабочий процесс».
- 759, 760, 764: the element's menu like the core's, plain links — Живой сайт · Подписка Claude Code · Терминал · Telegram-бот ·
  Рабочий процесс · Проектирование продукта · Строительство · Настройки; product design stays where it is. «Да» to the plan — 773.

## What was built

- `lib/web4-items/element-tg-menu.ts` reads `common` of the element's `tg/_data/menu.json` → `{ modes, common }`; `_lib/draft-menu-tg.ts`
  draws the common items after the modes; their screens are core segments (`workflow/mini-app/settings`, `…/help`).
- `lib/web4-items/item-tree.ts`: `subscription`, `terminal`, `telegram` on the top level under «Живой сайт»; the H2A bot page and
  `MOVED_WITH` removed; `MOVED_PAGES` sends `build/subscription|terminal|telegram`, `messenger/h2a/telegram`, `claude-code` to them.
- The links the core builds point at the new pages: element page (`AGENT_PAGES`, terminal and bot links), `/api/node/attention`,
  payment elements, `progress.cjs` bot page, `terminalServiceOf`, `main-agent-cli`, `BUILT_IN_STATIC`, `LIVES_AT` (tool-demo 1.0.5,
  PARTS.json rebuilt), the agent kit's `telegram.cjs` (master + `agent-kit:update` of 12 groups).

## Proofs

- Wire (root, localhost): `build/terminal`, `build/subscription`, `build/telegram`, `messenger/h2a/telegram`, `claude-code` → 307 to
  the new pages; `terminal`, `subscription`, `telegram`, `workflow/mini-app/settings`, `…/help` → 200; negative `terminal-x`,
  `workflow/mini-app/nope` → 404.
- Eye: logs/eyes/2026-11-18T18-14-52-474Z.png — the menu in the agreed order; under «Рабочий процесс»: Терминал (work session),
  Мои проекты, A2A · Web4, Подписки, Крон-автоматизация, Настройки элемента, Помощь; «Настройки элемента» opens in the phone frame;
  no console errors.

Surfaces seen: the element page of root at 1440 (logs/eyes/2026-11-18T18-14-52-474Z.png).

## Left open

- An old `build/terminal?paste=…` bookmark loses `?paste=` (two hops, the page redirect drops the query) — every link the core builds
  now goes straight to `terminal`, so only stale bookmarks hit it.
- Two «Терминал» lines: the top-level one (building) and the work-session one inside «Рабочий процесс» — named to the owner.
- `element-deploy.client.tsx` keeps a comment naming `build/terminal` (touching it obliges the old `<details>` cleanup).
- Not pushed: the session's auto-mode classifier refuses `git push`.
