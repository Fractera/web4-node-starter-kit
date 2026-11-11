# 729 — the header search inline: the magnifier slides right, the field opens on its left, the AI icon on its right (PLAN — approved 2026-11-11: «go»)

Opened 2026-11-11 by the owner (tandem), after 722 closed. His words, verbatim:

> …модельное окно, это какое-то невероятное уродство зачем ты вообще его выводишь в правом верхнем углу экрана я не понимаю ну почему ты
> не можешь взять и в интерфейсе на широкой версии при нажатии на лупу просто анимировано сдвинуть лупу вправо и слева от лупы показать
> Input а справа от лупы сразу нарисовать иконку искусственный интеллект зачем это лишняя модельное окно

## What exists (722-3/722-8)

`components/architect/menu-search.client.tsx` variant `header`: the magnifier opens a fixed panel at the top right (`fixed right-3
top-16`) with the field and two text buttons «Найти» and «ИИ»; the AI button comes as `aiSlot` built on the server. The `menu` variant
has no user since 722-9.

## The design (agreed in the message before «go»)

- Wide: the magnifier click → the field (~16rem) grows on its LEFT (200 ms, ease-out; the one width transition, occasional), focus in it;
  the magnifier moves right with it; the AI icon (Sparkles) fades in on its RIGHT. Open: the magnifier = «Найти», Enter too. The
  matches drop as a list under the field (its width, state dots, `ElementRow`). Esc / a click outside — closed, the magnifier back.
- The AI icon opens the same «Поиск по смыслу» window (`AppDialog`), the field's words carried into it.
- Narrow (390): the bar takes the header row (over the logo and the menu): «←» close, the field, the magnifier, the AI icon; the list
  under the header.
- Unchanged: no search in the left menu (722-9); without JavaScript no magnifier, the menu stays links.
- Ready parts only: `Input`, `Button`, `ElementRow`, `MenuAi`/`AppDialog`; theme tokens. The dead `menu` variant removed.

## Substeps

- **729-1** the code: `menu-search.client.tsx` (inline bar, results list), `menu-ai.client.tsx` (an icon trigger, the seed words,
  `onOpenChange`), `all-projects.client.tsx` / `top-menu.server.tsx` (the dialog words instead of a prebuilt slot), one word «close».
  Plane 1: tsc, the prebuild chain by its exit code.
- **729-2** on the node (push, the fork synced, `node:update`): eyes at 1440 and 390, light and dark (the cookie), closed / open /
  matches / none, the console; JS off — no magnifier.

## 729-1 built in the working copy (2026-11-11)

- `menu-search.client.tsx` — one form in the header row: the field (w-0 → 16rem, 200 ms ease-out, `inert` while closed), the magnifier
  (closed: opens; open: «Найти», an empty field closes it), the AI icon fading in; narrow — `max-md:absolute inset-0` over the header row
  with «←»; the matches list under the field (`ElementRow`, 24 at most, scroll at 20rem); Esc and a pointer outside close it, not while
  the AI window is open. The dead `menu` variant and its panel removed (93 → 125 lines).
- `menu-ai.client.tsx` — the trigger is the icon `Sparkles` (aria-label and title «Поиск по смыслу»), `seed` carries the typed words into
  the window, `onOpenChange` reports the window to the header. `menu-search.i18n.ts` — the word «close» (en, ru). `all-projects.client.tsx`,
  `top-menu.server.tsx` — the dialog words go down instead of a prebuilt `aiSlot`.
- Plane 1: tsc clean (outside stale `.next` types); the prebuild chain without the install-only checks — exit 0.
