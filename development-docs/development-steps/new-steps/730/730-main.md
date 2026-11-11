# 730 — the primitives law held by a guard and a hook, not by the agent's memory: why hand-rolled UI passes, the red test, the elements (PLAN — the diagnosis done 2026-11-11; the fix waits for the owner's yes)

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

## 5. The fix (proposed — waits for the owner's yes)

- **730-1 `check:primitives`** in prebuild (core first): refuses in interface files a raw `<button>`, `<input>` (except `hidden`/`file`),
  `<select>`, `<textarea>`, a hand-built floating panel (`absolute|fixed` + `bg-popover|shadow-*` outside `components/ui`) and names the
  owner part (`Button`, `Input`/`InputGroup`, `NativeSelect`/`Select`, `Textarea`, `Popover`/`Command`/`DropdownMenu`). The existing debt
  is a frozen list that can only shrink (a new entry fails the build). The red test becomes its test: the fixture fails, the clean twin
  passes.
- **730-2 the skills hook** — PreToolUse on Write/Edit of `*.tsx` under `components/`, `app/`, `_tools/`, `sections/`: refused until this
  session's transcript shows the Skill calls `use-primitives` and `use-shadcn`; the message names the command. Advice becomes law.
- **730-3 729 rebuilt on the law** — `InputGroup` + `Popover` + `Command` (arrows, Enter, Esc), «Очистить» a `Button`; the guard green
  for these files; eyes 1440/390 light and dark again.
- **730-4 the debt burned down in the core** — file by file, each a commit, the list shrinking (the owner sees the count).
- **730-5 the elements** — the same guard and hook into the custom and native templates and root by a release (`release-template`);
  each live element gets them with its next template update, and its agent burns its own list.
- **730-6 `check:i18n`** — either into the chain with its 40 dictionaries as a frozen debt list, or named aloud as not a guard.

Relation to 725: 725 finds the parts (map, `parts_find`, a gate on NEW files); 730 is the law on every file and every session. 730 first
— it is mechanical and would have caught 729 today.
