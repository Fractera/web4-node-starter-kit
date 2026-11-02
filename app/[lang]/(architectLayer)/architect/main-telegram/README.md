# `/architect/main-telegram` — Main Telegram bot

Owner 2026-11-02: «В левом меню выше чем кнопка главный агент поставь кнопку main Telegram бот это кнопка должна приводить
переадресация и открыть страницы h2A/telegram где происходит настраивание телеграмм бота. Потому что его найти в проекте почти
невозможно». A group of the architect layer right above «Main agent» (order 19, `build` is 20). It only redirects to
`/architect/build/telegram` — the main agent's bot page, which stays at its address and in the menu under «Main agent → Messenger → H2A».

| Path | Role |
|---|---|
| `page.tsx` | redirect to `/{lang}/architect/build/telegram` |
| `_data/` | `slug`, `order` 19, `icon` send, words `en` + `ru` |
| `_components/index.ts` | empty — the page has no content of its own |

Build cost: none — a redirect, no data, no island.
