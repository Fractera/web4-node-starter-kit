# 730 — the primitives law held by a guard and a hook, not by the agent's memory: why hand-rolled UI passes, the red test, the elements — summary (2026-11-11; the owner chose variant C, the work done in tandem and then an autonomous night run)

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

## 5a. The boundary: design skills are free (the owner, 2026-11-11, verbatim)

> Самодельный интерфейс у нас может быть в результате работы навыка это нужно исследовать навык не обязан быть ограниченным этой
> библиотекой? Это важно понимать навыку разрешено создавать то что он хочет только работа интерфейса где навыков нет требует
> использования того что мы обсуждаем

> Самодельный интерфейс в смысле может быть создан навыкам дизайна которых у нас 108 и будет больше

Measured in the custom template: the design pass is its own session («Build process — design», `lib/agent-kit/modes.cjs` PASSES); it
carries the design skill handed for a prototype (`npm run prototype -- new <id> --skill <mark>`) or the pinned one (`design.pinned.skill`,
`designSkill` of the passport, `npm run design:pin`); its products are sections (`components/sections/<kind>`), widgets (`_widgets/`) and
prototypes; `.claude/modes/build-design.md` today lists `shadcn` among that pass's skills as one of them, not as a law. The core has no
design pass and no design skills — its panel is `interface-design` + shadcn.
The line to draw: a file made by a design skill is free; every other interface file is under the shadcn law. A design-skill file is
marked `@design <skill-mark>` on its first lines; the mark is legal only in the design territory (sections, widgets, prototypes) and
only with a skill the passport names (handed or pinned) — a mark cannot be stamped to escape the law.

## 6. Substeps

- **730-0 the current problem** — the header search rebuilt only from shadcn parts: `InputGroup` (the field, the magnifier and the AI icon
  in one frame that grows to the right — the magnifier slides right, the field opens on its left), `Popover` + `Command` (the shadcn
  combobox: arrows, Enter opens, Esc and outside close), `Tooltip` instead of `title`, `Button`; no raw control left. Plane 1: tsc,
  prebuild exit 0 (it caught my `dark:` override first). Plane 2: eyes after the node update.
- **730-1 `check:shadcn-parts`** — skips a file with a legal `@design <skill-mark>` (5a); otherwise knows the whole shadcn catalogue: a raw `<button>`, `<input>` (not `hidden`/`file`), `<select>`,
  `<textarea>`, `<table>`, `<progress>`, `<details>`; a `role` of `tab`/`tooltip`/`menu`/`switch`/`checkbox`/`slider`/`dialog`; a
  hand-built floating panel (`absolute|fixed` with `bg-popover|shadow-*` outside `components/ui`); `title=` on an icon button → each named
  with its owner (`Button`, `Input`/`InputGroup`, `Select`/`NativeSelect`, `Textarea`, `Table`, `Progress`, `Accordion`/`Collapsible`,
  `Tabs`, `Tooltip`, `DropdownMenu`, `Switch`, `Checkbox`, `Slider`, `AppDialog`, `Popover`/`Command`/`HoverCard`); a part not installed
  yet → `npx shadcn@latest add <name>`. **The touched-file law:** a file changed in the work being built must be clean; untouched files
  are a counted debt that can only shrink. The red-test fixture is its own test: red on the fixture, green on its clean twin.
- **730-2 the skills hook** — PreToolUse Write/Edit of an interface `.tsx` (`components/`, `app/`, `_tools/`, `sections/`) refused until
  this session's transcript shows the Skill calls `use-primitives` and `use-shadcn`; the refusal names them. A design-pass session is
  exempt for the design territory: there the handed or pinned design skill leads.
- **730-3 instruction and skills** — CLAUDE.md §6 (the owner's word): «a design element that exists in shadcn is taken from shadcn; own
  markup only as a widget»; `use-primitives` and `use-shadcn` say the catalogue comes first and name the guard; the elements' sealed
  instruction (`instruction:element`) the same.
- **730-4 the starter templates** — the guard, the hook, the test and the skills into the custom and native templates and root
  (`release-template`); every element gets them with its next template update, and its agent fixes only the files it touches.
- **730-5 `check:i18n`** — red for a long time (40 dictionaries) and outside the chain: put it in with a frozen debt, or say it is not a
  guard.

Not in this step: a sweep of old code (the owner: no tokens on what is done — the touched-file law repairs it on the way).

## 730-1 built (2026-11-11)

- `scripts/check-shadcn-parts.mjs` (`npm run check:shadcn-parts`, in prebuild after `check-shadcn-rules`): raw controls, roles,
  hand-built floating panels, `title=` on a button → the shadcn owner, `npx shadcn@latest add <name>` when missing; the `@design
  <skill>` mark legal only in sections / prototypes / widgets with the passport's or the prototype's skill; `@no-js` only in server files;
  the debt `scripts/shadcn-parts-debt.json` with a fingerprint per file — untouched quiet, touched must leave clean, new must be clean;
  `--freeze` once, `--shrink` only strikes out.
- The core's debt frozen: 82 files, 174 findings (60 raw-button, 52 title-not-tooltip, 21 raw-input, 21 raw-details, 10 raw-table,
  4 raw-textarea, 3 role radio, 2 hand-floating-panel, 1 raw-select). Spot-checked — real: e.g. the shell's language switcher and toggles
  are hand-built dropdowns instead of `DropdownMenu`. The header search (730-0) is not in the debt — it is clean.
- `scripts/check-shadcn-parts.test.mjs` (`npm run test:shadcn-parts`): 23 cases green — the 730 red test fails and names each rule, a
  word in a comment is not a button, the clean twin passes, a design mark legal only with the element's skill in its territory, `@no-js`
  only on the server, the debt frozen once and only shrinks, a touched debt file must leave clean, a new file with old markup fails.
  The negative control is the red test itself: the 13 earlier guards pass it.

## 730-2 built (2026-11-11)

- `.claude/hooks/shadcn-skills.mjs`, PreToolUse `Edit|Write|MultiEdit` in `.claude/settings.json`: an interface `.tsx` (components/, app/,
  _tools/, sections/, _widgets/) is refused with exit 2 until this session's transcript shows `Skill use-primitives` and `Skill
  use-shadcn` (only those present in the project); free: `components/ui/`, `components/ai-elements/`, the design territory (sections of
  an element, prototypes, widgets — the core has none). Unreadable input or no transcript — pass (the build guard stands behind).
- `npm run test:shadcn-skills-hook`: 9 cases green. Live, on real transcripts: the previous conversation 57daaf7f (no skill loads) →
  exit 2 with the reason; this conversation c38db5fc (both loaded) → exit 0.
- Found for 730-4: the element templates carry no `.claude/settings.json` of their own (the core installs an element's session
  settings), and no `use-primitives` — only `build-skills/skills/use-shadcn` and `use-typography`.

## 730-3 built (2026-11-11)

- CLAUDE.md §6 (the owner's «go your choose» for variant C and its wording): «A design element that exists in shadcn is taken from
  shadcn; own markup only from a design skill in its territory, with its `@design` mark (`check:shadcn-parts`, the hook
  `shadcn-skills`…)» — sealed `2e38f88e4d88`, `check:instruction` exit 0.
- `use-primitives` §0 and `use-shadcn` §0 — the law, the guard, the hook, the touched-file rule, the design-skill freedom, `@no-js`.
- The element instruction source (`lib/instructions/element/element-instruction.src.md` §7, every template) — the same law in the
  element's words; `render custom` carries it. It reaches the templates together with the guard in 730-4 (an instruction without its
  guard would be advice again).

## 730-4 A built (2026-11-11; the owner «to y», «to do it»)

- `scripts/element-isolate.mjs` installs the skills hook into every element's `.claude/settings.local.json` (PreToolUse
  `Write|Edit|MultiEdit`, `node "<core>/.claude/hooks/shadcn-skills.mjs"`, its own entry rewritten on each run) — reaches every element
  of every node with the core's update, no template release.
- The hook knows element skills in groups (`.claude/skills/<group>/skills/use-shadcn`) and calls with the group prefix
  (`build-skills:use-shadcn`); an element without `use-primitives` is asked only for `use-shadcn`.
- `test:shadcn-skills-hook` 12 green (3 element cases); `check:boundary-hook` 29 samples ok. Live (an element's settings carry it) —
  after the node update.

## 730-4 B released (2026-11-11)

- Templates: `fractera-custom-item-starter` v0.3.188 (`0897b2a`), `fractera-native-item-starter` v0.1.61 (`40cf255`),
  `fractera-root-starter` v3.0.47 (`060f4ed`) — each: `check:shadcn-parts` in prebuild + `test:shadcn-parts` (23 green) + its own frozen
  debt (custom 22 findings / 14 files, native 19 / 13, root 22 / 14), the `@design` mark rule in `.claude/modes/build-design.md`,
  `use-shadcn` §0, the instruction §7 regenerated and sealed. Guards: custom and native `template release --dry` — every guard green;
  root — its whole prebuild exit 0, nothing changed by it.
- Pushed with the workshop's GitHub login (gh, account Fractera, `repo`): the core's `template release` reads a node token
  (`data/node/github/.env`) that the author's workshop does not have — the tag and push done by hand after the green dry run.
- Pins in the core: custom `5da34824`, native `8b2325b5`. root is pinned per node as an element (step C, after the owner's Accept of
  «Клип»).
- Found on the way and fixed: the element instruction named `use-own-stores` for native too (a 717 line the native template had not
  been regenerated with) — its release guard `check-skill-process` refused it; the line is now split by variant. The generator learned
  `ROOT_TEMPLATE_DIR` (root's clone beside the core in the author's workshop).

## Commits

Core (`Fractera/web4-node-starter-kit`): `cd90b2ba` plan · `b2b7cb22` 730-0 · `2398f97d` 730-1 · `77f71ce8` 730-2 · `9cd50552` 730-3 ·
`1eca28b2` 730-3 fix (the words guard stopped update 1) · `6719b9d2` 730-4 A · `b4e7f585` `5da34824` `8b2325b5` `f349b885` 730-4 B ·
`8ef18896` `74a71eee` 730-0 fixes seen by the eyes · the last polish (tooltips below, no tile behind the closed magnifier) — in this
commit's parent. Templates: custom v0.3.188, native v0.1.61, root v3.0.47. The node: updates `708f5f23`, `b852f3e6`, `1a6fe0ed`,
`7fa42f02` (each fork sync in Chrome — identical).

## Proofs

PROOF 1 — plane the tree (tests): `test:shadcn-parts` 23 green (the red test of 730 fails and names every rule; the 13 older guards
pass it — the negative control); `test:shadcn-skills-hook` 12 green; each template's release dry run — every guard green.
PROOF 2 — plane the wire (live transcripts): the hook refuses an interface file for the transcript of a session without the skills
(57daaf7f → exit 2 with the reason) and allows this one (c38db5fc → exit 0); on the node `check:shadcn-parts` green; `element-isolate`
ran over the 12 elements with the new code (`===ELEMENT_ISOLATE_OK=== элементов: 12`, the update log) — the elements' settings files
themselves were not read (the boundary).
PROOF 3 — plane the eye (the header search on the node `7fa42f02`, a scratch Playwright run with the visitor's theme cookie, light and
dark × 1440 and 390): the magnifier moves right (507 → 757 at 1440, 143 → 316 at 390), the focus in the field, the tooltip «Найти»,
«клип» + Enter → «Клип | Найдено: 1» with the first row selected, Esc → the list closed and the bar still open, the second Esc → closed,
a click outside → closed, «нет такого элемента» → «Элемента с таким названием нет», the AI icon carries «что-то для клипов» into the
window, Enter on the selected row opens «Клип»; console errors — none in all four runs. Screenshots seen.
Negative controls on the way: before `8ef18896`/`74a71eee` the same run failed — Esc moved focus to body and closed the whole bar.

## What the eyes and the guards caught on the way

- Update 1 stopped at `check:words` («a collapsible block» in use-primitives) — the node came back as it was; fixed and the whole chain
  run before every push since.
- Esc: Radix closed the list, React re-rendered before the field's handler, which then closed the bar — Esc now has one owner, the field.
- The element instruction named `use-own-stores` for native (a 717 line never regenerated into native) — split by variant.
- The voice in the AI window (the owner's own test): OpenAI answers `credit_balance_exhausted` with HTTP 429; the node read it as a rate
  limit — fixed in the voice tool and the translate door (`23b2d503`, `78089ae4`), and the owner made it 726-0: one reader of OpenAI's
  errors for all 20 callers.

## Not done

- 730-4 C — the guard's files rolled into the existing elements: waits for the owner's Accept of «Клип» (its 717 waits for Preview →
  Accept and would ride along).
- 730-5 — `check:i18n` is red without any change of ours (40 dictionaries) and is outside the prebuild chain: not a guard today; named,
  not changed.
- The tests of this step are not in CI (the core's CI runs no `test:*` today).
- The elements' sealed instruction reaches a live element with its next template update (`instruction:element -- element <dir>`).

## Evolution of skills

Done in the step itself: `use-primitives` §0 and `use-shadcn` §0 (core and templates), CLAUDE.md §6, the element instruction §7, the
design pass's `@design` rule. Lesson for my own work: the whole prebuild chain before every push, not only the guards of the files I
touched.
