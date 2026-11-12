# toolsTab — the tools of the core: cards, a look, edit and add

**Type:** Workspace. The working part of the main agent's «Рабочие процессы → Инструменты» (node step 725-8).

**The owner's word, 2026-11-12:** «Нажатие на кнопку инструмента справа откроет карточки с описанием инструмента какое они задачи решают
где могут быть использованы и то самое полное описание … по пять инструментов с кнопкой показать ещё … кнопка добавить инструмент …
запускается терминал … На одном экране не более одного терминала».

An accordion «what tools are» (a tool vs a section vs a widget), the core's tools from `_tools/TOOLS.json` with the measured `usedBy` of
the parts map, five at a time; «Show» opens the tool in AppDialog (live on sample data only when it needs nothing beyond the browser),
«Edit» opens the main agent's terminal drawer with the edit task in its paste window, «Add a tool» takes the person's words by voice or
text and starts the development in the same drawer. One terminal on the screen at a time. Every element has the same tab
(`components/tools-tab/`).
