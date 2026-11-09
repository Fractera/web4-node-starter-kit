# 709 — the main agent works only through elements

The owner 2026-11-09, verbatim: «У главного агента нужно удалить раздел рабочий процесс потому что если его нужны какие-либо процессы, то
он должен извлекать их из элементов … философия рабочих процессов на уровне терминала непросто не нужна а катастрофически запрещена. … есть
вкладка строительства … логичнее было бы переименовать эту кнопку в рабочие процессы.» · «I2i внутри узла главного агента также не могут
существовать удали их» · «переменное окружение … должны находиться на вкладке настройки … две настройка провайдера и переменная окружение».

Done: `build/workflow`, `build/i2i`, `build/api-map`, `build/mcp` deleted (git history keeps them); «Строительство» of the main agent is
«Рабочие процессы» / «Working processes» (elements keep «Build»); `environment` stands under «Настройки» (the page itself is the base AI
provider, under it Environment and Payments); the menu guard refuses `build/workflow` and `build/i2i` (negative control: an empty
folder → MAIN_AGENT_MENU_FAILED); CLAUDE.md §3 menu line and §6 law (a capability the main agent needs lives in an element, native when
the whole node needs it — e.g. web research with Exa), resealed. Proof on the node: eyes on the menu after the update.

709-2 (queued for the next build, the owner: «не стоит ради этого … делать новое развёртывание ядра»): the left menu's group row carries
the alert, so «Домен и хостинг» gets its red icon like GitHub (`f86d87b9`); «Автоматизированное управление» of the main agent — «Инструменты»
deleted («все инструменты могут быть только у агентов»), «Настройки» → «Добавить событие» / «Add an event», the empty-calendar words
point there. Proven live on the node 709: eyes — no Рабочий процесс, no i2i, «Рабочие процессы», Environment under Settings.
