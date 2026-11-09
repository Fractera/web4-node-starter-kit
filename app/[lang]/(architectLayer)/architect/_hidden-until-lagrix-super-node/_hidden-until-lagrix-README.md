# Hidden until Lagrix launches (step 710)

The owner 2026-11-09: «вкладка супер узел должна быть скрыта то есть закомментировано до тех пор пока у нас лагрикс не будет запущен».
The folder `super-node` was renamed to `_hidden-until-lagrix-super-node`: a folder starting with `_` is not a route and not a menu item
(`lib/parser-fs.mjs`). To bring it back — rename it to `super-node` and run `node lib/parser-fs.mjs`; nothing else was changed.
