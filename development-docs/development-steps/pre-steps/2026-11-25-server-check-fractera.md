# fractera.ai — check of steps 849–858 (main agent of the server, 2026-11-24 ~20:40 UTC)

Answer to «for-server-check-849-858.md». Nothing changed on the node; no key value printed. Local time below is UTC+1.

| # | Check | ✓ / ✗ | The proving line |
|---|---|---|---|
| 0 | build and the four commits | ✓ | `/api/health` → `"commit":"3b8c500f"`, builtAt 2026-11-24T18:10:18Z; HEAD 3b8c500f; origin/main (fork aifa-agi) 6596d915. `e08ab8c5` yes · `8c74cd55` yes · `7e5f47e3` yes · `8d10ce7d` yes · `6596d915` no — HEAD..origin/main is b1ce4d5f, dc537d3a, 6596d915: development documents only (857/858 summaries, current-steps), no code. |
| 1 | 849 card | ✓ | `npm run card -- lidt5`: «GitHub: Fractera/f2f-marketpalce · its own token …4p2L, until 2026-11-30 · last push 2026-11-24 11:06 UTC (43abee2), 34 commit(s) not pushed (HEAD 687cafd) (measured now…)» · «Its data: on this computer's disk — data/app.db (156 KB) …; in its space of the node data/services/lidt5/: catalogue.json, marketplace/ — 5 file(s), 101 KB, databases …/conversations.db» · «Web4: seen only by the agents of this node, not in the Web4 network.» + «From the internet: anyone who reaches its address gets, through its own proxy, its own doors /api/marketplace and …» |
| 2 | 851 walled task | ✓ | `npm run task -- z8asv "Working process: answer ok in one line, change nothing"` at 21:31:24 → `===TASK_OK===`. Log: `21:31:26 [agents/start] z8asv--work: сессия запущена` · `21:34:26 [agents/start] z8asv--work: работа началась (задача 21:31, запись журнала 21:31)`; no `not-started` line in the log after 4 min. Not closed with `npm run close -- z8asv`: that closes the element's conversation session, not `z8asv--work`, and Diana's bot test (4) needs it; the work session closes itself on its «done». |
| 3 | 856 close question | waiting | Asked Roma (Telegram 355) to send 2–3 messages to the marketplace bot and count «Выключить его?». |
| 4 | Diana | waiting | Asked Roma (Telegram 355) to write «привет» to t.me/z8asv_messenger_h2a_y853k_bot. |
| 5 | 854 page | ✓ (wire) | `GET /ru/f2f-marketplace/build/f2f` → 200, the page holds «Где предложить» ×1, «Предложить в маркетплейсе» ×6, Web2 / Web4; `GET /ru/z8asv/build/f2f` (custom) → 404. Roma's eyes: optional, link https://architect.fractera.ai/ru/f2f-marketplace/build/f2f |
| 6 | 858 door 401 | ✓ | `POST /api/node/deploy` with `x-node-key: bogus.key`, `{"ids":["z8asv"]}` → `{"ok":false,"reason":"the node key or the element's own key is required (X-Node-Key)"} 401`. |
| 7 | 857 native versions | ✓ | Registry: data v2.2.35 · auth v2.4.47 · storage v1.1.55 · vectors v1.2.35 · graph v1.2.34 · memory v2.2.55 (all as expected); also embeddings v0.1.36, cache v0.1.48, stripe v1.3.47, config v1.2.54, root v3.0.70. Born lidt5 stays v0.1.81, z8asv v0.3.238 — nothing rolled into them. |

Note for 1: the card still shows `data/app.db (156 KB)` in lidt5's own folder — the local road of v0.1.81 (step 859 brings it v0.1.82).
