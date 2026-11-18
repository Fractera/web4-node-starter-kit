# 797 — the element's menu follows the core's menu

The owner, 2026-11-18, Telegram 757, 759, 760, 764 (verbatim in current-steps.md). Status: APPROVED — «Да», 18:02 UTC, Telegram 773.

## What he asked

- 757: the Mini App's common items (Subscriptions, Cron, Element settings, Help — `common` of the element's `tg/_data/menu.json`,
  template v0.3.217) stand BESIDE the modes under «Рабочий процесс», siblings of «Мои проекты» and «A2A · Web4».
- 759/760/764: the element's left menu like the core's, plain links:
  Живой сайт · Подписка Claude Code · Терминал · Telegram-бот · Рабочий процесс · Проектирование продукта · Строительство · Настройки.
  «Проектирование продукта» stays where it is (764).

## Substeps

- 797-1 (coded, not committed): `lib/web4-items/element-tg-menu.ts` reads `common` → `{ modes, common }`; `_lib/draft-menu-tg.ts`
  puts the common items after the modes; `elementTgSegments` includes them (so «Настройки», «Помощь» open in the phone frame).
- 797-2 the tree (`lib/web4-items/item-tree.ts`): three pages leave «Строительство» for the top level, right under «Живой сайт»:
  `subscription`, `terminal`, `telegram`. «Пользователи» (sign-in element only) stays under «Живой сайт»; «Мессенджер» (shown only
  on an app factory, hidden on this single project) goes after «Telegram-бот» unless he says otherwise (asked 766).
- 797-3 old addresses keep working: `build/subscription` → `subscription`, `build/terminal` → `terminal`, `build/telegram` and
  `messenger/h2a/telegram` → `telegram` (one bot page); the root-era aliases `terminal`, `claude-code`, `telegram` re-pointed;
  `MOVED_WITH` dropped; the redirect keeps the query (`?paste=` of a task into the terminal).
- 797-4 the direct links move too: `AGENT_PAGES`, `BUILT_IN_STATIC`, `LIVES_AT`, the element page's terminal/telegram links,
  `element-deploy`, `payment-elements`, the agent kit's `telegram.cjs` (kit source, then `npm run agent-kit:update`),
  `progress.cjs`, `/api/node/attention`. The core's OWN pages (`architect/build/*`) do not move.
- 797-5 prebuild RC=0 → ONE core build → proofs.

## Proofs (two planes)

- Wire: `curl -sI` of `/ru/architect/root/build/terminal?paste=x` → 307 to `/ru/architect/root/terminal?paste=x`; the new address 200;
  a wrong one (`/ru/architect/root/terminal-x`) 404 (negative).
- Eye: `npm run eyes` of root's element page — the menu order as above, «Рабочий процесс» opened: the modes, then Подписки · Крон ·
  Настройки элемента · Помощь as siblings; «Настройки элемента» opens the phone frame.
