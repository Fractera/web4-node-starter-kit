# 773 — the round «!» beacon of the action window rises to the width badge and stops covering the language switch

**The owner's words (2026-11-17 09:59 UTC, Telegram 288):** «поставь план небольшую работу в ядре у нас есть круглый индикатор … в правом
нижнем углу он находится настолько низко что я не могу управлять переключением языков в браузере подними его на такую же высоту на какой
находится левый индикатор ширина экрана». 10:02 (Telegram 292) on the first draft «763-b»: «Очень странный выбор номера шага потому что
предыдущие шаги были 768 вроде бы или около того» → the next free number, 773 (772 is the element Mini Apps, already named).

**Routing:** not a part of the current work (the domain, 771/772) — the next free step, one substep.

## Measured (2026-11-17 10:07 UTC, Chrome 1440 × 812, http://localhost:24680/ru/hosting/hosting scrolled to the end)

- Left — the width badge «1440 XL» (`components/dev/viewport-badge.client.tsx`, `bottom-16`, `pointer-events-none`): bottom edge 64 px.
- Right — the action window's beacon «!» (`components/architect/person-ask.client.tsx`, wrapper `fixed right-4 bottom-4`): button 56 px,
  bottom edge 16 px; inside it the ping ring `absolute -inset-1 … animate-ping` grows to 112 px and takes clicks (pointer-events auto).
- The footer's language switch «RU»: 62 × 30 px, 24 px from the right, 35–65 px from the bottom.
- `elementFromPoint` at the centre of «RU», sampled every 100 ms: today — the ring span every time (the owner's complaint, reproduced);
  with the wrapper moved to 64 px in the page (no code) — the ring span AND the RU button by turns: **raising alone is not enough**, the
  growing ring still lands on the switch. The ring must not take clicks.

## 773-1 — the one substep (one file)

- **Built:** in `components/architect/person-ask.client.tsx` the wrapper `bottom-4` → `bottom-16` (the badge's 64 px); the ping ring's
  span gets `pointer-events-none`. The button's size, colour, count and the popover (it opens above the button) stay as they are.
- **Done when:** a click on «RU» at the end of any panel page always reaches the switch, and the beacon's bottom edge is level with the
  badge's.
- **Proof, two planes:** (a) the page — `elementFromPoint` at the centre of «RU», 20 samples through the ping: only the RU button (the
  negative control is the measurement above, the ring today); the beacon's and the badge's bottom edges both 64 px; a click on the beacon
  still opens the window; (b) the eye — `npm run eyes` on the page scrolled to the end, the screenshot to the owner.
- **Build:** prebuild with `RC=0` read first, then the core rebuild as its own command — the node's agents and bots wait a few minutes.
- **Tasks this needs / parts born here:** none — an existing composite changes two classes.
- **Not in it:** the left badge, the footer, the switch itself.
