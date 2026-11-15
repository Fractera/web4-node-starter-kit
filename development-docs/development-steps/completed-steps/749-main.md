# 749 — names instead of ids when an element is deleted or born, the true internet address on a server, Lagrix behind one accordion (closed 2026-11-15)

## The person, verbatim
The order, 2026-11-15 13:02 UTC (full text in the plan, recoverable below): «…при удалении элемента вместо того чтобы показать его
название ты показываешь его идентификатор … Найди пожалуйста этот шаг … Другую проблему нашел уже на удалённом сервере … красную карточку
… адрес Local хост … Что за бред? … сделать аккордеон … данный элемент в сетях lagrix web4 (пока не построена) … Проверь и кастомные
шаблоны и существующие нативные шаблоны и стартовые обои типОв». The plan approved 13:30 UTC: «да, утверждаю 749-1…4 целиком, go».

## Substeps
- 749-1 the delete dialogs name the element and take its name (`749-1.md`, `ae5f417a`)
- 749-2 a new element is named at its first click (`749-2.md`, `04a87a1f`) — my addition from the research, kept by his yes
- 749-3 «Адрес в интернете» tells the truth on a dedicated server (`749-3.md`, `d93cf02a`)
- 749-4 the Lagrix part of an element's home behind one closed accordion (`749-4.md`, `d414f35c`)

Pushed together as `d414f35c` (Fractera main, the fork synced); the whole chain 83/83 green with `NEXT_*` unset; CI of `6d09be14` (which
carries them) green on Linux and Windows. Live on aifa.dev since its update (its merge `01b9ba7d`, started 14:11 UTC), every substep
proven there in his Chrome, each with a negative control.

## What the step gives now
- No dialog of the panel asks a person to type an id: an element and a draft are deleted by their name; the doors check the same rule.
- An element made by the panel's button carries the person's name from the first second — in the menu, the header, the title, the dialogs
  and, after its birth, its passport.
- On a dedicated server every element's and service's «Адрес в интернете» names its real name (aifa.dev, auth.aifa.dev …) and is green
  when it answers; a server without a domain says so; a person's computer is unchanged.
- An element's home shows the port, the address and one closed band about Lagrix; everything about Lagrix is still inside it.
- The templates were read and need nothing: the custom and native starters print no id as text and draw no Lagrix part of their own.

## Side work in the same session (not 749)
- README line 30 had his Russian line from 747 pasted as it was; translated (`f9b14e92`) after his «what the stupid solution ? for en repo
  you post ru text ?», then replaced by his own section «What's in the box, in numbers» verbatim (`6d09be14`); 747.md corrected
  (`1c9b120f`).

## What is not done
- The owner's Mac runs none of this until its node update, started right after this commit (it also carries `5fb21d94`, `18e4cbf5`,
  `d81b9098`).
- A birth from the panel with a name — proven by its arguments, not by a live birth.
- Found on the way, not fixed here (the branch rule): `new-steps/750-wishes-of-749-element-deletion-and-server-names.md` (W1–W5).

## Mistakes
- Times written by guess four times in one session («13:45», «13:47», «14:2x», «13:1x»), each caught and corrected from `date` or the
  commit times. The rule «read the clock first» is not enough by memory; the time goes into a record only from a command's output.
- 721's «no id is visible» was proven by a scan of pages; dialogs open on a click and were outside it — the defect he met.
- 741-7's map missed the address card; a map of behaviours is complete only when every island asking a door about the domain is in it.

## Evolution of skills
Nothing changed in the skills; the two lessons above (open the dialogs in an inventory; map every island that asks about the domain)
are recorded here for the next pass.

## The plan
Deleted in this commit; recover it:
`git log --diff-filter=D --format=%H -1 -- development-docs/development-steps/new-steps/749/749-main.md`
then `git show <hash>^:development-docs/development-steps/new-steps/749/749-main.md` (the same for `749-1.md` … `749-4.md`,
`wishes.md`).
