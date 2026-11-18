# 782 — the app mode switch moved from the configurator to the core's Passport — summary

Closed 2026-11-18 12:29 UTC. Repository: the core (`main`); the configurator's part — its own agent, its own repository.

## The owner's words

- 11:53 (Telegram 565): the first blue card of the architect's Passport with the switch, two round buttons stacked, active dark blue,
  inactive light blue, no red; the left text changes with the mode, «один пользователь» carries the configurator link; the cards keep
  one height when switching.
- 11:56 (Telegram 567): a deep switch, not an interface; after at least one element besides root — a notice that earlier elements keep
  their state (research it, write the right texts).
- 12:01 (Telegram 574): the confirming window on every press, with Cancel and a fuller description of what happens now.

## What was built

- 782-1 (bf205e7f, be192df9): the section kind `appMode` (`sections/kinds/app-mode.server.tsx`, card `appMode.md`, taxonomy 0070) with
  the island `components/app-mode/` (part `app-mode`); the Passport's `content()` returns it first. Both mode texts share one grid cell —
  fixed height. Every press opens AppDialog: what changes now (birth of new elements, wallet, Messenger section, tools) and, when born
  custom elements exist, each by its human name with «под конфигуратором / свои настройки» — they keep their state. The door
  `/api/node/type` gives `elements` (`node-type.cjs` `bornCustom`, names by `elementLabel`, `?lang=`). The read-only `NodeMode` left the
  hidden Lagrix summary (its raw `<button>` became `Button` — the touched file left clean).
- 782-2 (config 4718bde): the configurator's red switch card replaced by one line «Режим работы приложения переключается в Паспорте
  ядра» → `<ARCHITECT_URL>/<lang>/passport`. Its permission request (the guard misread a relative path) allowed by me; deployed by me.

## Proofs

- Eyes: project `logs/eyes/2026-11-18T12-12-13-815Z.png`, factory `…12-13-52-018Z.png` — the card 910×152 in both modes, no console
  errors; the window `…12-28-08-923Z.png` (after the padding fix, build 763f300a); the configurator `…12-22-44-577Z.png`, its link
  `https://architect.throughsongs.com/ru/passport` read from the served HTML.
- The door: POST factory → the registry `factory`; POST project → `project`. Negative: POST through the temporary public address → 403,
  the registry unchanged. The node is left on `project`.
- Not seen live: the window's list of earlier elements — the node has no born custom elements now (the door answers `elements: []`).

Surfaces seen: logs/eyes/2026-11-18T12-12-13-815Z.png, logs/eyes/2026-11-18T12-13-52-018Z.png, logs/eyes/2026-11-18T12-28-08-923Z.png,
logs/eyes/2026-11-18T12-22-44-577Z.png.
