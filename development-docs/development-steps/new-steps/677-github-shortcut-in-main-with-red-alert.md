# 677 — the «GitHub» shortcut in «Main», red while the node has no own repository (one-file-class fix, no window)

The owner, 2026-11-07 ~19:40 UTC, verbatim: «на вкладке основное у нас есть сейчас кнопки которые доступны в компактном режиме и я попрошу
тебя добавить кнопку кстати говоря на доступные в компактном и в обычном режиме это кнопка GitHub эта кнопка должна делать переадресацию на
вкладку которая у нас существует в главном агенте в строительстве. Просто найти это непросто поэтому этот важный процесс вынести вверх.
Также подсвечивать его красным если репозитории храп не подключён а нажатие на эту кнопку также как и нажатие на например на кнопку подписка
Cloud Code просто открывает соответствующий раздел.»

Decisions (mine): first shortcut of «Main» in both menu modes, above «Claude Code subscription»; «not connected» = the GitHub page's own
verdict (binding not `own` and not `foreign-host`, door `build/github/api/state`); the red is the 632-2 mechanism (`data-alert`, the island
`NodeAlerts`, a CSS rule), the zone head carries every alert of the zone. Files: `_lib/draft-menu.tsx`, `menu-icons.tsx`,
`lib/collection/types.ts`, `node-alerts.client.tsx`, `styles/globals.css`.
Proof planned: on the owner's node after the update — the link `[data-alert~=no-github]` to `/build/github` visible in compact and full;
its colour with the node's real state (`own` → not red) and with the island's flag set (`data-no-github` → the destructive colour).
