# 705 — The GitHub item of the left menu is red until the node has a GitHub token

## The owner's words (2026-11-09 ~01:55 WET, verbatim)

«Мне кажется я тебе уже несколько гораздо давал задачу а ты её почему-то игнорируешь она микроскопическое но и сделать её нужно смотри
в левом меню у нас подсвечивается красным цветом вкладка домен если не подключён собственный домен на ниже её расположены вкладка GitHub и
разумеется эта вкладка должна светиться красным если не подключён Token. Но почему-то мы это не сделали давай исправим?»

## What was there

677 put the «GitHub» shortcut first in the core's zone with the alert `no-github`, but the island `NodeAlerts` raised it only when the
node does not work with its own repository (`binding.state` not `own`/`foreign-host`). The owner's node runs from its own fork without a
token: `GET /ru/architect/build/github/api/state` → `binding.state: "own"`, `token.configured: false` — measured 2026-11-09, and the
shortcut stood in the ordinary colour. Without a token the node neither syncs its fork nor pushes by itself.

## The change (one capability, no window needed — a one-file fix plus its data line)

- `components/node-state/node-alerts.client.tsx` — calm only with both: its own repository AND `token.configured === true`.
- `architect/build/github/_data/meta.ts` — `alert: 'no-github'`: the tree item «Главный агент → Строительство → GitHub» (full mode) is red
  too, as «Активация домена» is for the domain.
- The notes of `styles/globals.css` and `lib/collection/types.ts`.

## Proof (two planes, after the node update)

1. The wire: the state door answers `token.configured: false` and `<html>` carries `data-no-github`.
2. The eye: the «GitHub» shortcut, the tree item and the zone label are in the alarm colour (computed `rgb(239, 68, 68)`); negative
   control in the same page — `data-no-github` removed by hand → the ordinary colour comes back.
