# 680 — The right drawer names terminals and previews like the menu

**State: APPROVED 2026-11-08** (the owner's request is the order), coded in the commit after this file.

## The owner's words, verbatim (2026-11-08)
«Ещё одно обновление будет касаться правого выдвижного ящика. У нас там есть вкладка терминал который показывает активные терминалы.
Задача заключается в том что активные терминалы сейчас показывает идентификатор элемента должны показывать точную такую же название какое
присутствует в левом меню или например верхнее меню. Потому что невозможно поидентификатору понять какой именно терминал нужно открыть»

## Measured
`/api/node/attention?lang=ru` on the owner's node, 2026-11-08 ~01:00 UTC: `{"id":"build","name":"build"}`, `{"id":"s8y6x","name":"s8y6x"}` —
the door named a born element by its address and a built-in one by its id; the drawer (`components/shell/shell-attention.client.tsx`)
prints `name`.

## Result
`app/api/node/attention/route.ts`: `name` = `elementName(<id without --work>, lang)` — the core section's title for a built-in one
(the main agent's `build`), the display name for a custom one (678) — for terminals and for previews. `tsc` clean, `API_OK`.

## Proof owed
On the owner's node after the update: the door gives «Клип» for s8y6x and the main agent's section title for `build`; `npm run eyes`
on the drawer's Terminals tab.
