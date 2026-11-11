# 727 — the shell as tools of the core that every element imports: the header (native elements, custom elements, search, «only running»), the account, the footer (PLAN — to be designed with the owner)

Opened 2026-11-11 by the owner, verbatim:

> Теперь то что касается элементов и инструментов я думаю что верхнее меню со всеми его функциями это должен быть один отдельный
> инструмент в вкладке инструменты ядра. Чтобы мы не перезапуска пускали каждый раз обновление всех элементов мы только в одном месте
> должны делать обновления а все остальные элементы должны получить его нативно. То есть если ты сделал или инструмент верхнее меню
> который содержит вкладку нативный элементы кастомные элементы и поиск значит любой другой элемент который захотел бы это использовать
> просто его импортирует вот и всё

then, the same evening:

> Также вкладка личный кабинет тоже может быть отдельным инструментом потому что на всех элементах она возвращает одно и то же также
> текущая версия Footer может быть инструментом потому что все элементы возвращают один и тот же инструмент я правильно мысли?

(Answered: yes — the header, the account (`components/shell/shell-account.client.tsx`) and the footer (`components/shell/project-footer.tsx`)
are today the shell kit copied into every element; as tools of the core they change in one place. The code is common, the data stays each
element's (`ShellData` from CONFIG); the footer's Fractera mark is protected better with no copies; an element must stay whole without
JavaScript and without the core — the central question.)

and before it (722-9): «фильтрации через чекбокс … По задумке он должен находиться прямо в верхнем меню то есть верхнем меню выпадает
список страниц и в этом же меню в верхней его части есть вот этот вот чекбокс они же идут элементы которые можно сортировать».

## Measured (2026-11-11)

- The header's tabs are drawn by the shell kit's mega-menu (`components/shell/shell-menu.client.tsx`): the core and the root starter carry
  it byte for byte (`2d8fa7fff3`), the custom, native, auth and stripe templates an older copy (`c15f8660ee`, a named debt of
  `check:shell-kits`). A change there today means a release of the core and root together and of every template — the cost the owner
  wants gone.
- Elements already take shell DATA at run time from the site's static door (`components/shell/remote-shell.ts`, `/api/shell/<lang>`);
  only the code is copied.
- The core's tools live in `_tools/<id>/` with `tool.json` cards (`TOOLS.json`, 11 tools); elements carry their own `_tools` copies.

## The shape to decide with the owner (no code before his yes)

- **How an element «imports» without being rebuilt.** A tool served by the core at run time (a module or island the element loads from
  the core's address) updates everywhere at once; a package or a copied folder needs every element rebuilt — what the owner rejects.
- **The laws it must keep.** An element lives without the core (the menu falls back to the static links of its CONFIG catalog); the menu
  works without JavaScript for visitors (the static part from the build, 722/723); the shell kit's «one owner per kind» — the header tool
  replaces the mega-menu's catalog tabs, it does not sit beside them; no single point of failure (CLAUDE.md §2).
- **What the tool holds.** The «Нативные элементы» and «Кастомные элементы» tabs with the state dots (architect only), the checkbox «только
  работающие» at the top of the dropdown, the search «Найти»/«ИИ» (722-3/4/8), portions of 12 (722-2).
- It becomes the first part born under 725-7: declared `@part`, carded, in the graph, found by `parts_find`.
