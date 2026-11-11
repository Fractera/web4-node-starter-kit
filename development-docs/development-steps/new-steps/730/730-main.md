# 730 — the primitives law held by a guard and a hook, not by the agent's memory: why hand-rolled UI passes, the red test, the elements (PLAN — the diagnosis done 2026-11-11; the scope set by the owner the same evening)

Opened 2026-11-11 by the owner (tandem), after he found hand-rolled markup in 729. His words, verbatim:

> То что нужно исправить это само собой разумеется но меня беспокоит совершенно другое слушай я прям не понимаю мы строим архитектуру я
> даю тебе задание следовать навыкам а что в итоге в итоге кто во что горазд? Хочу использую навыки хочу не использую навыки ты делаешь
> один шаг вперёд я нахожу на него десяток ошибок так мы так вообще не сдвинемся. Заводи новый шаг и проводить тестирование по какой
> причине ты позволяешь себе создавать говно вместо того чтобы использовать правильную библиотеку почему сторожа пропускают это и что у
> нас происходит в элементах с той же самой бедой

## 1. What happened in 729 (measured in the code)

shadcn parts used: `Input`, `Button` (magnifier, AI icon, «←»), the AI window's `Button`, `Spinner`, `EmptyState`, `AppDialog`.
Ignored although present in `components/ui`: «Очистить» — a raw `<button>`; the matches list — a hand-styled `div` posing as a popover
with a hand-written Esc/outside listener instead of `Popover`; the field with two buttons composed by hand instead of `InputGroup`; no
arrow keys through the matches although `Command` (cmdk) is there — the shadcn combobox recipe is `Popover` + `Command`.

## 2. Why the agent did it (cause 1 — the skill is advice, nothing makes it law)

- Skills load only when the agent judges a description relevant. In 729 `interface-design` was loaded (the owner had demanded it in
  722-9); `use-primitives` and `use-shadcn` — the two that say «take the primitive» — were not. Nothing noticed.
- Hooks today (`.claude/settings.json`): PreToolUse `system-part guard` (the core's system part), PostToolUse/PreCompact
  `context-guard`, SessionStart restore/resume. No hook knows which skills a session loaded before it writes a `.tsx`.

## 3. Why the guards let it pass (cause 2 — no guard looks at raw controls) — THE RED TEST

A fixture `components/architect/zz-redtest.client.tsx` (raw `<input>`, raw `<button>`, `absolute top-full … bg-popover shadow-md`
panel) put into the working copy, every interface guard run by its exit code, the file deleted:
  check:sections 0 · check:static 0 · check:contrast 0 · check:typography 0 · check:layout 0 · check:page-composition 0 ·
  check:dialogs 0 · check:api 0 · check:sections-map 0 · check:tools-map 0 · check:term-hints 0 · check:shell-kits 0 — ALL PASSED.
  check:i18n 1 — but it is 1 WITHOUT the fixture too (`===I18N_FAILED=== проблемных словарей: 40`) and is not in the prebuild chain:
  a guard that has been red for a long time and nobody runs.
What the guards do refuse: `check:dialogs` — a full-screen backdrop and `createPortal` (hand-rolled modal); `check:typography` — a
hand-classed heading. Buttons, inputs, selects, textareas, floating panels, input groups — nobody.

## 4. The debt already in the code (a new guard meets it on day one)

- The core (`components`, `app`, `_tools`): 63 raw `<button>` in 37 files, 18 raw `<input>` in 11 files, 9 files with a hand-built
  floating panel (`absolute top-full` / `fixed right-` / `bg-popover`).
- The templates (`~/fractera-dev`): every starter carries 8 raw `<button>` and 3 raw `<input>` in its base (blocks-starter 43 / 19); each
  has the same two guards (`check-dialogs`, `check-typography`) and no guard on raw controls; the skills `use-shadcn` (under
  `build-skills/skills/`) and `shadcn` are there, plus four competing design skills (`impeccable`, `frontend-design`,
  `design-taste-frontend`, `interface-design`) — none enforced.
- Live elements: their code is not read by the core (the boundary); they inherit the same base and the same two guards, so the same hole.
  Their own count — by their agents (costs their turns) or after the release.

## 5. The owner's scope (2026-11-11, verbatim)

> Речь не только об кнопке решат любом элементе дизайна которые существуют в библиотеке shadcn каждый раз когда ты пытаешься делать
> что-то свое это получается натуральное уродство.

> Хорошо сейчас заводи новый шаг быстро исправляй текущую проблему и движемся дальше

> И помню что меня больше всего беспокоит ядро а именно элементы всех видов. То тратить токены я бы не стал для того чтобы лечить то что
> уже сделано я бы только обновил инструкцию и навыки ну и конечно тесты особенно мне нужны стартовый шаблоны

> Хотя с другой стороны как ты можешь не лечить дух по сделанным если ты будешь делать сторожа то что произойдёт в момент очередной
> сборки сторож укажет на ошибку и одновременно элемент будет исправлен так? Это был бы идеальный вариант

Read as: the law covers the WHOLE shadcn catalogue, not only what is installed; no tokens spent on a sweep of old code; the repair rides
on work already paid — a guard refuses a file the moment an agent touches it, and that agent fixes it in the same pass. A guard cannot
fix code by itself (an automatic rewrite of markup is a guess, not a fix); the agent who touched the file can, at almost no extra cost.

The red test extended: `check:shadcn-rules` (8 rules: gap, size, truncate, literal colour, manual dark, Separator, Skeleton, partial
class) — exit 0 on the fixture too. 13 of 13 interface guards pass a hand-rolled control.

## 6. Substeps

- **730-0 the current problem** — the header search rebuilt only from shadcn parts: `InputGroup` (the field, the magnifier and the AI icon
  in one frame that grows to the right — the magnifier slides right, the field opens on its left), `Popover` + `Command` (the shadcn
  combobox: arrows, Enter opens, Esc and outside close), `Tooltip` instead of `title`, `Button`; no raw control left. Plane 1: tsc,
  prebuild exit 0 (it caught my `dark:` override first). Plane 2: eyes after the node update.
- **730-1 `check:shadcn-parts`** — knows the whole shadcn catalogue: a raw `<button>`, `<input>` (not `hidden`/`file`), `<select>`,
  `<textarea>`, `<table>`, `<progress>`, `<details>`; a `role` of `tab`/`tooltip`/`menu`/`switch`/`checkbox`/`slider`/`dialog`; a
  hand-built floating panel (`absolute|fixed` with `bg-popover|shadow-*` outside `components/ui`); `title=` on an icon button → each named
  with its owner (`Button`, `Input`/`InputGroup`, `Select`/`NativeSelect`, `Textarea`, `Table`, `Progress`, `Accordion`/`Collapsible`,
  `Tabs`, `Tooltip`, `DropdownMenu`, `Switch`, `Checkbox`, `Slider`, `AppDialog`, `Popover`/`Command`/`HoverCard`); a part not installed
  yet → `npx shadcn@latest add <name>`. **The touched-file law:** a file changed in the work being built must be clean; untouched files
  are a counted debt that can only shrink. The red-test fixture is its own test: red on the fixture, green on its clean twin.
- **730-2 the skills hook** — PreToolUse Write/Edit of an interface `.tsx` (`components/`, `app/`, `_tools/`, `sections/`) refused until
  this session's transcript shows the Skill calls `use-primitives` and `use-shadcn`; the refusal names them.
- **730-3 instruction and skills** — CLAUDE.md §6 (the owner's word): «a design element that exists in shadcn is taken from shadcn; own
  markup only as a widget»; `use-primitives` and `use-shadcn` say the catalogue comes first and name the guard; the elements' sealed
  instruction (`instruction:element`) the same.
- **730-4 the starter templates** — the guard, the hook, the test and the skills into the custom and native templates and root
  (`release-template`); every element gets them with its next template update, and its agent fixes only the files it touches.
- **730-5 `check:i18n`** — red for a long time (40 dictionaries) and outside the chain: put it in with a frozen debt, or say it is not a
  guard.

Not in this step: a sweep of old code (the owner: no tokens on what is done — the touched-file law repairs it on the way).
