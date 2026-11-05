# 657 — the core's left menu: a compact mode by default (Telegram first) and a full one; three shortcuts in «Основное» (plan)

## 1. Retelling and decisions

The owner, 2026-11-05, verbatim (current-steps NOW-21): «Изменить интерфейс левого меню ядра так как он сейчас выглядит слишком
перегруженным а наш фокус: пользователь должен работать только через Telegram»! нужно на вкладке основное добавить кнопку настройка:
Рекомендуемый режим минимальные настройки по умолчанию, полные для глубокого управления настройки. Если пользователь переводит режим в
компактные настройки то у него : – скрываются вкладка нативные элементы вместе со всеми элементами. Вкладка кастомные элементы исчезает как
раздел а все элементы остаются прямо в корне – для каждого кастомного элемента остается только название, при нажатии на которые открывается
страница живой сайт. – Также для кастомных элементов исчезает кнопка добавить новый кастомные элемент так как она должна быть доступна только
в режиме полных настройках в компактном режиме её надо скрыть – Также в упрощенном интерфейсе нужно скрыть полностью вкладку главной агент
Также для обоих режимов в вкладке основное выше чем кнопка главный Telegram бот добавить кнопки: – – подписка Cloud Code – – терминал А ниже
чем вкладка Telegram бот добавить – – OpenAI APi key вкладка которая откроет переменное окружение и прокрутит вниз до области ввода ключа
Telegram».

**Retold:** the left menu has two modes, switched by a «Настройка» row in «Основное»: **compact** (the default, recommended) and **full** (as
today). Compact: no «Нативные элементы» zone and none of its elements; no «Кастомные элементы» heading — root and the custom elements stand
at the menu's first level, each by its name only, opening its «Живой сайт»; no «Создать кастомный элемент» button; no «Главный агент».
Both modes: «Подписка Claude Code» and «Терминал» above «Главный Telegram-бот», «OpenAI API key» below it.

- **D1 (mine, for the owner):** the mode is the node's — one per node, `data/node/menu.json`, compact when there is no file; the door
  `GET/POST /api/node/menu-mode` (roles architect/admin, the same gate as `/api/node/type`) writes it and redraws the layer. The architect
  sees the same menu on the computer and on the phone.
- **D2 (mine):** the «Настройка» row is the first row of «Основное» — two buttons «Компактная · Полная», the current one marked; on the
  temporary address it is shown read-only (the panel there is read-only, CLAUDE.md §2).
- **D3 (mine):** what stays in compact mode: «Паспорт», «Dashboard», «Супер узел», «Домен и хостинг», «Главный Telegram-бот» and the three
  shortcuts. A hidden page keeps its address — a link to it still opens it.
- **D4 (mine):** the shortcuts lead to the pages that already exist under «Главный агент → Строительство»: `/architect/build/subscription`,
  `/architect/build/terminal`, `/architect/build/environment#OPENAI_API_KEY` (the environment page already scrolls to a row named in the
  address and outlines it — 318-2). In the full mode the «you are here» mark stands in one place only (the tree's item), never two.
- **I assume that** «прокрутит вниз до области ввода ключа Telegram» means the OpenAI key field: the button is «OpenAI API key», and the
  environment page has no Telegram key (the bot's token is entered on «Главный Telegram-бот») — asked in the window.

## 2. What is reused (paths that open)

- The menu: `app/[lang]/(architectLayer)/_lib/draft-menu.tsx` (`withDrafts` — zones «Основное», «Нативные», «Кастомные», the memory
  subzone, the create buttons), `_lib/architect-menu.ts` (`architectMenu`, groups from folders), `_lib/architect-page.tsx:79` (the menu built
  per request), `components/workspace/workspace-shell.tsx` (items, `zoneHead`, `node` islands), `components/workspace/menu-icons.tsx`.
- The element's tree: `lib/web4-items/item-tree.ts` — «Живой сайт» is the section `preview` (`/architect/<address>/preview`).
- A node setting by a door: `app/api/node/type/route.ts` (`requireRoles`, `revalidatePath("/[lang]", "layout")`).
- The environment row anchor: `components/environment/environment-panel.client.tsx` (`#OPENAI_API_KEY`, instant scroll, 3 s outline).
- Words: `app/[lang]/(architectLayer)/_i18n/web4-drafts.i18n.ts` (zone labels), the pages' `_data/{en,ru}.ts` titles.

## 3. Known limits

- The guards keep the full tree: `check-main-agent-menu`, `check-architect-routes`, `check-menu`, `check-menu-icons`, `check-i18n`,
  `check-api` (a new door — `// @api` and a 6–12-word name), `check-dialogs`; a component ≤ 250 lines; `data-block` on every container.
- The architect's pages ask nothing without a click (CLAUDE.md §6): the mode is read on the server when the menu is drawn, never polled.
- The node runs only in production: the change reaches the owner's node by the fork and `node:update` (the core rebuilt with the closed lid).

## 4. Observable results

- With no setting, the owner's menu at `http://localhost:24680/ru/architect` has no «Нативные элементы», no «Главный агент», no
  «Кастомные элементы» heading, no create buttons; «root» is a first-level item that opens `/ru/architect/root/preview`.
- «Полная» brings back the menu of today; «Компактная» takes it away again; `data/node/menu.json` holds the choice.
- In both modes «Основное» reads: … «Подписка Claude Code», «Терминал», «Главный Telegram-бот», «OpenAI API key» …; «OpenAI API key» opens
  the environment page with the OPENAI_API_KEY row in view and outlined.

## 5–6. Substeps, order, address

| # | Substep | Repository |
|---|---|---|
| 1 | `657-1.md` — the menu mode: the door, the node's file, the «Настройка» row, the compact menu | `Fractera/web4-node-starter-kit` `main` |
| 2 | `657-2.md` — three shortcuts in «Основное», both modes | the same |

One delivery for both (one rebuild of the core): commits → CI → fork `aifa-agi` → `npm run node:update` → eyes on the owner's node.

## 8. Acceptance of this plan

Each substep has its file, a result that can be shown, two planes with a negative control; the repository is named. **Not in it:** a
compact mode of an element's own menu; hiding pages from the main agent or the guards; a `CLAUDE.md` line about the mode (only by the
owner's word).

## 9. The owner's approval

(waiting)
